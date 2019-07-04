// In renderer process (web page).
// const { ipcRenderer, remote } = require('electron')

// function loadAboutPage(e){
//     console.log("sending request ---") // prints "pong"

//     ipcRenderer.send('index:load-page', 'about.htm')
// }
const { dialog } = require('electron').remote

var db = new Dexie("CarRental");

db.version(1).stores({
  customer: "++id, full_name, phone_number, address, remarks",
  vehicle: "++id,make,model, rental_price, reg_number, description",
  rent: "++id,customer_id,vehicle_id, status"
});
// Dexie.delete('CarRental');


$('nav').load('./include/nav.html')

function goTo(page){
    $('#page-wrapper').load('./'+page)
}

// Helper Function to extract array values
function getFormValues(dataModel, sArray){
    $.map(sArray, function(n, i){
        dataModel[n['name']] = n['value'];
    });
    return dataModel;
}

// check if Maximum length
function isMaxLen(val, target){
    return val.length <= target
}

// check if Minimum length
function isMinLen(val, target){
    return val.length >= target
}

// check if Numeric length
function isNumeric(val){
    return !isNaN(parseFloat(val)) && isFinite(val);
}

// check if Equal in length
function isEqual(val, target){
    return val.length === target || val === target
}

//check integer
function isInt(val){
    return parseInt(val) === val && val % 1 === 0;
}

// check Float
function isFloat(val){
    return parseFloat(val) == val;
}

// check Required
function isEmpty(val){
    return (val == '' || val == 0);
}


//Confirm A message
function confirmDialog(msg){
    let res = dialog.showMessageBox({
        title: "ABC Car Rental",
        message: msg,
        type: "question",
        buttons: ["Yes", "No" ]
    });
    if(res === 0){
        return true
    }
    return false
}

//Show Message Box
function msgBox( msg){
    dialog.showMessageBox({
        title: "ABC Car Rental",
        message: msg,
        type: "question",
        buttons: ["Okay" ]
    });    
}