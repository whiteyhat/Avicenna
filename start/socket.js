'use strict'

/*
|--------------------------------------------------------------------------
| Websocket
|--------------------------------------------------------------------------
|
| This file is used to register websocket channels and start the Ws server.
| Learn more about same in the official documentation.
| https://adonisjs.com/docs/websocket
|
| For middleware, do check `wsKernel.js` file.
|
*/

const Ws = use('Ws')

Ws.channel('chat', ({ socket }) => {
  console.log('user joined with %s socket id', socket.id)
})


// 'use strict'
// const Invoice = use('App/Models/Invoice')
// const User = use('App/Models/User')
// const lnService = require('ln-service')
// const Logger = use('Logger')
// const Ws = use('Ws')
// const Database = use('Database')
// const LightningService = use('App/Services/LightningService')

// let websocket = null

// // Create a channel to handle invoice requests
// Ws.channel('invoice', 'InvoiceController')


// const initWS = async () => {

//   // Since BTCPay Server closes WS every 90 seconds it must be looped
//   try {
//     // Instantiate LN daemon
//     const lnd =  LightningService.getLndInstance()
//     websocket = lnService.subscribeToInvoices({
//       lnd
//     })

//     websocket.on('error', async err => {
//       // recursive call
//       try {
//         await initWS()
//       } catch (err) {
//         Logger.error(err)
//       }
//     })


//     // When Invoice is created
//     websocket.on('data', async data => {

//       // If invoice is paid
//       if (data.is_confirmed) {

        
//           // If invoice is equal to 1000 satoshis = If invoice for standard account creation
//         if (data.tokens === '10000') {
//           Logger.info('Invoice paid for passport generation')

//           try {
//             // Find invoice by ID and save it into db as paid
//             const invoice = await Invoice.findBy('invoiceId', data.id)
//             const socketId = `invoice#${invoice.socketId}`
//             invoice.is_paid = true

//             // Get user ID from invoice
//             invoice.user_id = newUser.id
//             await invoice.save()

//             Ws.getChannel('invoice').topic('invoice').emitTo('invoicePaid', { jwt }, [socketId])
//           } catch (error) {
//             Logger.error('error')
//           }
//         }
        
//       } else {
//         // Invoice creation notification
//         Logger.notice('Invoice created')
//       }
//     })
//   } catch (error) {
//     Logger.error(error)
//   }
// }

// // Delete invoices that are not paid on start up
// const deleteInvoices = async () => {
//   await Database.table('invoices').where('is_paid', false).delete()
// }

// // Since BTCPay Server closes WS every 90 seconds it must be looped recursively
// try { initWS() } catch (error) { Logger.error(error) }
