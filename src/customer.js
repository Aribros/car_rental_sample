const { ipcMain, BrowserWindow } = require('electron')


// ipcMain.on('customer:save', (event, customer) => {
//     console.log(customer)
//     insertCustomer(customer)
// })

// //Insert csutomer
// function insertCustomer(customer){
//     knex('customer')
//     .insert(customer)
//     .then((res) => {
//         console.log("Customer inserted: ", res)
//     })
//     .catch((err) =>{
//         console.log("cannot Insert Customer")
//     })
// }