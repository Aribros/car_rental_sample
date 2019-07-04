let rentError = []
//Create Vehicle
function loadRentPage(vehicleData = null, updateData = null){
    $('#page-wrapper').load('./rental/create.htm',function(r){
        //Add New Rent
        if(vehicleData !==  null & updateData === null){ 
            let title = vehicleData.make + ", " + vehicleData.model
            $("#rent-title").html(`Rent Vehicle: ${title}`)
            $("#rent-form").append(`<input name = 'vehicle_id' type ='hidden' value = ${vehicleData.id}>`)
            $("#rent-form").append(`<input name = 'vehicle_title' type ='hidden' value = "${title}">`)
            $("[name=total_amount]").val(vehicleData.rental_price)

        //Edit Rent Information
        }else if(updateData !==  null & vehicleData === null){ 
            $("#rent-title").html(`Rent Vehicle: ${updateData.vehicle_title}`)
            $("#rent-form").append(`<input name = 'id' type ='hidden' value = ${updateData.id}>`)
            $("#rent-form").append(`<input name = 'vehicle_title' type ='hidden' value = "${updateData.vehicle_title}">`)
            $.each(updateData, function(key, value){
                $('[name='+key+']').val(value);
            });
        }   
        loadCustomersOptions();     
    })//end load function
}

//Load Customers for Dropdown Menu
function loadCustomersOptions(){
    db.customer.toArray()
    .then(customer => {
        if(customer.length !== 0){
            let opt = "";
            for(i = 0; i < customer.length; i++){
               opt += `<option value = ${customer[i].id}>
                        ${customer[i].full_name} (${customer[i].phone_number})</option>`
            }
            $('[name=customer_id]').html(opt)
            $('[name=customer_id]').removeAttr("disabled");
        }
    })
    .catch(err => {
        msgBox("Error: Cannot load customers");
        console.log(err)
    })    
}

// Capture Submit event
$(document).on("submit", "#rent-form",function(e){
    e.preventDefault();
    let rentModel = {
        vehicle_id:'',
        customer_id:'',
        vehicle_title:'',
        total_amount:'',
        amount_paid:'',
        status:'',
        remarks:'',
        date: null,
    }    
    rentModel = getFormValues(rentModel,$(this).serializeArray())
    submitRentDetails(rentModel)
})


//Submit and run validation
function submitRentDetails(rentModel){
    if(validateRent(rentModel)){
        rentModel.date = (new Date()).toDateString()
        saveRent(rentModel)
        return true
    }else{
        displayRentError()
    }
}

//Display Error
function displayRentError(){
    let ul = "<ul><h5>Please, Correct the following Errors.</h5>"
    for(i=0; i< rentError.length; i++){
        ul += "<li>" + rentError[0] + "</li>"
    }
    ul += "</ul>"
    $(".form.has-error").html(ul)    
}

// Send Rent Infor data to for saving
function saveRent(rent){
    if(rent.id !== undefined){ //Check if Rent ID already exist
        performRentSave(rent,false) //Update 
    }else{
        //Create new record if no ID Exsit
        performRentSave(rent,true)
    }
}

//Commit to DataBase
function performRentSave(rent,isNew = true){
    //Add Find Customer and Add the name
    db.customer.where('id').equals(parseInt(rent.customer_id)).first()
    .then((customer) => {
        console.log(customer, rent)
        if(customer != undefined){
            rent.customer_name = customer.full_name
            if(!isNew){ //Check if Data is New
                rent.id = parseInt(rent.id) //make sure integer is passed
                db.rent.put(rent)
                .then((res) => {
                    loadAllRents() //relaod page
                }) 
                .catch(function (e) {
                    console.log(e)
                    msgBox("Error: Update rent info.");
                });      
            }else{  //Save Data id Not new
                db.rent.put(rent)
                .then(function() {
                    loadAllRents()
                }).catch(function (e) {
                    console.log(e)
                    msgBox("Error: Cannot Save Data");
                });  
            }            
        }else{ //no customer found
            rentError.push("Invalid Customer Details.");
            displayRentError()
        }
    })
    .catch((e) => {
        console.log(e)
        msgBox("Error: Cannot Save Data");
    })      
}


//Laod All rents
function loadAllRents(){

    $('#page-wrapper').load('./rental/index.htm', function(r){
        db.rent.reverse().sortBy("id")
        .then(res => {
            if(res.length === 0){
                return $("#all-rents tbody").html(" No Result Found.")
            }
            tbl = "";
            for(i = 0; i < res.length; i++){
                tbl += `<tr>
                    <td>${i + 1} </td>
                    <td> ${res[i].vehicle_title } </td>
                    <td> ${res[i].customer_name }</td>
                    <td> ${res[i].date }</td>
                    <td> ${res[i].total_amount }</td>
                    <td> ${res[i].amount_paid }</td>
                    <td> ${(res[i].total_amount - res[i].amount_paid) < 0 ? (0) : (res[i].total_amount - res[i].amount_paid)}</td>
                    <td> ${ res[i].status == "Pending" ?
                        `<span class='label label-danger'>PENDING</span>` :
                        `<span class='label label-success'>RETURNED</span>` }</td>
                    <td>${res[i].remarks }</td>
                    <td><a  onclick='updateRent(${parseInt(res[i].id)})' class ='btn btn-link'>Edit</a>|<a  onclick='deleteRent(${parseInt(res[i].id)})' class ='btn btn-link btn-sm'>Delete</a></td>
                </tr>`
            }
            $("#all-rents tbody").html(tbl)
        })
        .catch(err => {
            msgBox("Error: Cannot load rents details");
            console.log(err)
        })
    });    
}


//Load Update Page
function updateRent(id){
    db.rent.where('id').equals(id).first()
    .then((rent) => {
        if(rent !== undefined){
            loadRentPage(null,rent);
        }else{
            msgBox("Error: Rent details was not found!");  
        }        
    })
}


//Delete one Vehicle
function deleteRent(id){
    if(!confirmDialog("Are you sure you want to delete this item?")){
        return
    }
    db.rent.where('id').equals(id).delete()
    .then((res)  => {
        loadAllRents()
    })
    .catch((err) => console.log(err))
}

//--------------------------Validation-----------------
//Validate
function validateRent(rentModel){
    rentError = []
    $(".rent.has-error").html('')

    if ( !validateRentTotalAmount(rentModel.total_amount, "Total Amount") ||
            !validateRentPaidAmount(rentModel.amount_paid, "Amount Paid") ||
            !validateRentCustomer(rentModel.customer_id, "Customer Name") ||
            !validateRentVehicle(rentModel.vehicle_id, "Vehicle ") ||
            !validateRentStatus(rentModel.status, "Status ") ||
            !validateRentRemarks(rentModel.remarks, "Remarks") )
     {
         return false
     }    

     return true
 }

//Validate Rent Customer
function validateRentCustomer(name,field){

    if(isEmpty(name)){
        rentError.push(field+" cannot be blank!");
        return false
    }
    if(!isNumeric(name)){
        rentError.push(field+" is invalid!");
        return false
    }   
    return true        
}

//Validate Rent Vehicle ID
function validateRentVehicle(name,field){

    if(isEmpty(name)){
        rentError.push(field+" cannot be blank!");
        return false
    }
    if(!isNumeric(name)){
        rentError.push(field+" is invalid!");
        return false
    }   
  
    return true        
}

//Validate Rent Paid Amount
function validateRentPaidAmount(val, field){
    if(isEmpty(val)){
        rentError.push(field+" cannot be blank or zero!");
        return false
    }
    if(!isFloat(val)){
        rentError.push(field+" must be a number!");
        return false
    } 
    if(val < 0){
        rentError.push(field+" must not be negative!");
        return false
    }         
    return true        
}

//Validate Rental Price
function validateRentTotalAmount(val, field){
    if(isEmpty(val)){
        rentError.push(field+" cannot be blank or zero!");
        return false
    }
    if(!isFloat(val)){
        rentError.push(field+" must be a number!");
        return false
    } 
    if(val < 0){
        rentError.push(field+" must not be negative!");
        return false
    }            
    return true        
}



//Validate Status
function validateRentStatus(val, field){
    if(isEmpty(val)){
        rentError.push(field+" cannot be blank or zero!");
        return false
    } 
    return true        
}

//Validate Remarks
function validateRentRemarks(val, field){
    if(isEmpty(val)){
        rentError.push(field+"  cannot be blank!");
        return false
    } 
    if(!isMaxLen(val,200)){
        rentError.push(field+" cannot a more than 100 characters!");
        return false
    }   
    if(!isMinLen(val,3)){
        rentError.push(field+" cannot a less than 3 characters!");
        return false
    }   
    return true        
}