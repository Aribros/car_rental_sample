const { ipcRenderer } = require('electron')




let customerError = []
 

// Capture Submit event
$(document).on("submit", "#customer-form",function(e){
    e.preventDefault();
    let customerModel = {
        full_name:'',
        phone_number:'',
        address:'',
        remarks:'',
    }
    customerModel = getFormValues(customerModel,$(this).serializeArray())
    submitCustomer(customerModel)
})


//Submit and run validation
function submitCustomer(customerModel){
    if(validateCustomer(customerModel)){
        saveCustomer(customerModel)
        return true
    }else{
        displayCustomerErrors()
    }
}

//display Error
function  displayCustomerErrors(){
    let ul = "<ul><h5>Please, Correct the following Errors.</h5>"
    for(i=0; i< customerError.length; i++){
        ul += "<li>" + customerError[0] + "</li>"
    }
    ul += "</ul>"
    $(".form.has-error").html(ul)
}

// Send Customer data to for saving
function saveCustomer(customer){

    if(customer.id !== undefined){ //Check if Customer ID already exist
        performCustomerSave(customer,false) //Update 
    }else{
        //Create new record if no ID Exsit
        db.customer
        .where('phone_number')
        .equals(customer.phone_number)
        .first()
        .then(num => {
            if(num === undefined){
                performCustomerSave(customer,true)
            }else{
                customerError.push("Phone Number Already Exist!"); 
                displayCustomerErrors();
            }
        })
    }
}


//Commit to DataBase
function performCustomerSave(customer,isNew = true){
    if(!isNew){ //Check if Data is New
        customer.id = parseInt(customer.id) //make sure integer is passed
        db.customer.put(customer)
        .then((res) => {
            loadAllCustomers() //relaod page
        })
        .catch(function (e) {
            console.log(e)
            msgBox("Error: Update Info");
        });       
    }else{  //Save Data id Not new
        db.customer.put(customer)
        .then(function() {
            $('#page-wrapper').load('./customer/index.htm',function(e){
                loadAllCustomers()
            })
        }).catch(function (e) {
            console.log(e)
            msgBox("Error: Cannot Save Data");
        });  
    }

}

//Create Customer
function createCustomer(data = null){
    $('#page-wrapper').load('./customer/create.htm',function(r){
        if(data !== null){
            $("#customer-form").append(`<input name = 'id' type ='hidden' value = ${data.id}>`)
            $.each(data, function(key, value){
                $('[name='+key+']').val(value);
            });
        }
    })
}

//Load All Available Customers
function loadAllCustomers(){
    $('#page-wrapper').load('./customer/index.htm', () => {
        db.customer.toArray()
        .then(res => {
            if(res.length === 0){
                return $("#all-customers tbody").html(" No Result Found")
            }
            tbl = "";
            for(i = 0; i < res.length; i++){
                tbl += `<tr>
                    <td>${i + 1} </td>
                    <td> ${res[i].full_name }  </td>
                    <td> ${res[i].phone_number }</td>
                    <td> ${res[i].address }</td>
                    <td>${res[i].remarks }</td>
                    <td><a  onclick='updateCustomer(${parseInt(res[i].id)})' class ='btn btn-link'>Edit</a>|<a  onclick='deleteCustomer(${parseInt(res[i].id)})' class ='btn btn-link btn-sm'>Delete</a></td>
                </tr>`            
            }
            return $("#all-customers tbody").html(tbl)
        })
        .catch(err => {
            msgBox("Error: Cannot load customers");
            console.log(err)
        })        
    });
}

//Edit customer Info
function updateCustomer(id){
    db.customer.where('id').equals(id).first()
    .then((customer) => {
        createCustomer(customer);
    })
    .catch(err => {
        msgBox("Error: Cannot updating customers");
        console.log(err)
    })
}

//Delete one Customer
function deleteCustomer(id){
    if(!confirmDialog("Are you sure you want to delete this item?")){
        return
    }
    db.customer.where('id').equals(id).delete()
    .then((res)  => {
        loadAllCustomers()
    })
    .catch(err => {
        msgBox("Error: Cannot deleting customers");
        console.log(err)
    })
}

//--------------------------Validation-----------------
//Validate
function validateCustomer(customerModel){
    customerError = []
    $(".form.has-error").html('')

    if ( !validateCutomerName(customerModel.full_name, "Full name") ||
         !validateCutomerPhone(customerModel.phone_number, "Phone Number") ||
         !validateCutomerAddress(customerModel.address, "Address") ||
         !validateCutomerRemarks(customerModel.remarks, "Remarks") )
     {
         return false
     }    
 
     return true
 }

//Validate Full Name
function validateCutomerName(name,field){
    if(isEmpty(name)){
        customerError.push(field+" cannot be blank!");
        return false
    }
    if(isNumeric(name)){
        customerError.push(field+" cannot a number!");
        return false
    }    
    if(!isMaxLen(name,30)){
        customerError.push(field+" cannot a more than 30 characters!");
        return false
    }   
    if(!isMinLen(name,2)){
        customerError.push(field+" cannot a less than 2 characters!");
        return false
    }   
    return true        
}

//Validate Phone number
function validateCutomerPhone(val, field){
    if(isEmpty(val)){
        customerError.push(field+" cannot be blank!");
        return false
    }
    if(!isNumeric(val)){
        customerError.push(field+"must be a number!");
        return false
    }    
    if(!isMaxLen(val,11)){
        customerError.push(field+" cannot a more than 11 characters!");
        return false
    }   
    if(!isMinLen(val,11)){
        customerError.push(field+" cannot a less than 11 characters!");
        return false
    }   
    return true        
}

//Validate Address
function validateCutomerAddress(val, field){
    if(isEmpty(val)){
        customerError.push(field+"  cannot be blank!");
        return false
    } 
    if(!isMaxLen(val,100)){
        customerError.push(field+" cannot a more than 100 characters!");
        return false
    }   
    if(!isMinLen(val,3)){
        customerError.push(field+" cannot a less than 3 characters!");
        return false
    }   
    return true        
}

//Validate Remarks
function validateCutomerRemarks(val, field){
    if(isEmpty(val)){
        customerError.push(field+"  cannot be blank!");
        return false
    } 
    if(!isMaxLen(val,200)){
        customerError.push(field+" cannot a more than 100 characters!");
        return false
    }   
    if(!isMinLen(val,3)){
        customerError.push(field+" cannot a less than 3 characters!");
        return false
    }   
    return true        
}