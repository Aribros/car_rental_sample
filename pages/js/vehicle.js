let vehicleError = []
 

// Capture Submit event
$(document).on("submit", "#vehicle-form",function(e){
    e.preventDefault();
    let vehicleModel = {
        make:'',
        model:'',
        rental_price:'',
        reg_number:'',
        description:'',
    }    
    vehicleModel = getFormValues(vehicleModel,$(this).serializeArray())
    submitVehicle(vehicleModel)
})


//Submit and run validation
function submitVehicle(vehicleModel){
    if(validateVehicle(vehicleModel)){
        saveVehicle(vehicleModel)
        return true
    }else{
        displayError()
    }
}

//Display Error
function displayError(){
    let ul = "<ul><h5>Please, Correct the following Errors.</h5>"
    for(i=0; i< vehicleError.length; i++){
        ul += "<li>" + vehicleError[0] + "</li>"
    }
    ul += "</ul>"
    $(".form.has-error").html(ul)    
}

// Send Vehicle Infor data to for saving
function saveVehicle(vehicle){
    if(vehicle.id !== undefined){ //Check if Vehicle ID already exist
        performSave(vehicle,false) //Update 
    }else{
        //Create new record if no ID Exsit
        db.vehicle
        .where('reg_number')
        .equals(vehicle.reg_number)
        .first()
        .then(num => {
            if(num === undefined){
                performSave(vehicle,true)
            }else{
                vehicleError.push("Registration Number Already Exist!"); 
                displayError();
            }
        })
    }
}

//Commit to DataBase
function performSave(vehicle,isNew = true){
    if(!isNew){ //Check if Data is New
        vehicle.id = parseInt(vehicle.id) //make sure integer is passed
        db.vehicle.put(vehicle)
        .then((res) => {
            loadAllVehicles() //relaod page
        }) 
        .catch(function (e) {
            console.log(e)
            msgBox("Error: Update vehicle info.");
        });      
    }else{  //Save Data, id Not new
        db.vehicle.put(vehicle)
        .then(function() {
            loadAllVehicles()
        }).catch(function (e) {
            console.log(e)
            msgBox("Error: Cannot Save Data");
        });  
    }

}

//Create Vehicle
function createVehicle(data = null){
    $('#page-wrapper').load('./vehicle/create.htm',function(r){
        if(data !== null){
            $("#vehicle-form").append(`<input name = 'id' type ='hidden' value = ${data.id}>`)
            $.each(data, function(key, value){
                $('[name='+key+']').val(value);
            });
        }
    })
}

//Load All Vehicles
function loadAllVehicles(){

    $('#page-wrapper').load('./vehicle/index.htm', function(r){
        db.vehicle.toArray()
        .then(res => {
            if(res.length === 0){
                return $("#all-vehicles tbody").html(" No Result Found")
            }
            tbl = "";
            for(i = 0; i < res.length; i++){
                tbl += `<tr>
                    <td>${i + 1} </td>
                    <td> ${res[i].make } , ${res[i].model } </td>
                    <td> ${res[i].reg_number }</td>
                    <td> ${res[i].rental_price }</td>
                    <td id = "v-status-${res[i].id}">${ getStatus(res[i].id) }</td>
                    <td>${res[i].description }</td>
                    <td><a onclick='rentVehicle(${parseInt(res[i].id)})' class ='btn btn-link'>Rent</a>|<a  onclick='updateVehicle(${parseInt(res[i].id)})' class ='btn btn-link'>Edit</a>|<a  onclick='deleteVehicle(${parseInt(res[i].id)})' class ='btn btn-link btn-sm'>Delete</a></td>
                </tr>`
            }
            $("#all-vehicles tbody").html(tbl)
        })
        .catch(err => {
            msgBox("Error: Cannot load vehicles");
            console.log(err)
        })
    });
}

//Rent Vehicle
function rentVehicle(id){
    db.vehicle.where('id').equals(id).first()
    .then((vehicle) => {
        if(vehicle !== undefined){
            db.rent.where('vehicle_id').equals(`${id}`).first()
            .then((rent) => {
                console.log(rent,id)
                if(rent !== undefined && rent.status === "Pending"){
                    return msgBox("Vehicle is not available. It is already rented.");  
                }else{
                    loadRentPage(vehicle); //in Rental Page
                }
            })
        }else{
            msgBox("Error: Vehicle was not found!");  
        }
    })
    .catch(err => {
        msgBox("Error: Cannot load vehicle inforamtion");
        console.log(err)
    })    
}

//Load Update Page
function updateVehicle(id){
    db.vehicle.where('id').equals(id).first()
    .then((vehicle) => {
        if(vehicle !== undefined){
            createVehicle(vehicle);
        }else{
            msgBox("Error: Vehicle was not found!");  
        }        
    })
}


//Delete one Vehicle
function deleteVehicle(id){
    if(!confirmDialog("Are you sure you want to delete this item?")){
        return
    }
    db.vehicle.where('id').equals(id).delete()
    .then((res)  => {
        loadAllVehicles()
    })
    .catch((err) => console.log(err))
}


function getStatus(id){
    db.rent.where('vehicle_id').equals(`${id}`).first()
    .then((rent) => {
        console.log(id)
        if(rent !== undefined && rent.status === "Pending"){
            $("#v-status-"+id).html(`<span class='label label-danger'>RENTED</span>`);
        }else{
            $("#v-status-"+id).html(`<span class='label label-success'>AVAILABLE</span>`);
        }
    })
}

//--------------------------Validation-----------------
//Validate
function validateVehicle(vehicleModel){
    vehicleError = []
    $(".customer.has-error").html('')

    if ( !validateVehicleMake(vehicleModel.make, "Vehicle Make") ||
        !validateVehicleMake(vehicleModel.model, "Vehicle Model") ||
         !validateVehicleNumber(vehicleModel.reg_number, "Reg Number") ||
         !validateVehiclePrice(vehicleModel.rental_price, "Rental price") ||
         !validateVehicleDescription(vehicleModel.description, "Description") )
     {
         return false
     }    

     return true
 }

//Validate Make and Model
function validateVehicleMake(name,field){

    if(isEmpty(name)){
        vehicleError.push(field+" cannot be blank!");
        return false
    }
    if(isNumeric(name)){
        vehicleError.push(field+" cannot a number!");
        return false
    }    
    if(!isMaxLen(name,30)){
        vehicleError.push(field+" cannot a more than 30 characters!");
        return false
    }   
    if(!isMinLen(name,2)){
        vehicleError.push(field+" cannot a less than 2 characters!");
        return false
    }   
    return true        
}

//Validate Rental Price
function validateVehiclePrice(val, field){
    if(isEmpty(val)){
        vehicleError.push(field+" cannot be blank or zero!");
        return false
    }
    if(!isFloat(val)){
        vehicleError.push(field+" must be a number!");
        return false
    }     
    return true        
}

//Validate Number Plate
function validateVehicleNumber(val, field){
    if(isEmpty(val)){
        vehicleError.push(field+"  cannot be blank!");
        return false
    } 
    if(!isMaxLen(val,12)){
        vehicleError.push(field+" cannot a more than 12 characters!");
        return false
    }   
    if(!isMinLen(val,2)){
        vehicleError.push(field+" cannot a less than 2 characters!");
        return false
    }   
       
    return true        
}

//Validate Remarks
function validateVehicleDescription(val, field){
    if(isEmpty(val)){
        vehicleError.push(field+"  cannot be blank!");
        return false
    } 
    if(!isMaxLen(val,200)){
        vehicleError.push(field+" cannot a more than 100 characters!");
        return false
    }   
    if(!isMinLen(val,3)){
        vehicleError.push(field+" cannot a less than 3 characters!");
        return false
    }   
    return true        
}