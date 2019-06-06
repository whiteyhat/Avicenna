/**
Copyright 2019 Carlos Roldan Torregrosa

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
"use strict";

const Invoice = use("App/Models/Invoice");
const User = use("App/Models/User");
const lnService = require("ln-service");
const Logger = use("Logger");
const axios = require("axios");
const Ws = use("Ws");
const payInvoice = require("ln-service/pay");
const PdfService = use("App/Services/PdfService");
const Database = use("Database");
const LightningService = use("App/Services/LightningService")
const OpenTimestamps = require('javascript-opentimestamps')
const fs = require("fs")

let websocket = null;

// Create a channel to handle invoice requests
Ws.channel("invoice", "InvoiceController");

const initWS = async () => {
  // Since BTCPay Server closes WS every 90 seconds it must be looped
  try {
    // Instantiate LN daemon
    const lnd = LightningService.getLndInstance();
    websocket = lnService.subscribeToInvoices({
      lnd
    });

    websocket.on("error", async err => {
      // recursive call
      try {
        await initWS();
      } catch (err) {
        Logger.error(err);
      }
    });

    // When Invoice is created
    websocket.on("data", async data => {
      // If invoice is paid
      if (data.is_confirmed) {
        // If a lightning invoice has been paid for a certification using Blockstream Satellite
        if (data.description ==="Upload Avicenna's Passport to Blockstream Satellite") {
          Logger.info("Invoice paid for passport generation using Blockstream Satellite");

          try {
            // Find invoice by ID and save it into db as paid
            const invoice = await Invoice.findBy("invoiceId", data.id);

            // Get the socket ID from the invoices
            const socketId = `invoice#${invoice.socketId}`;

            // Update the invoice to paid
            invoice.is_paid = true;

            // Save the invoice
            await invoice.save();

            // Get the user by his/her session id
            const user = await User.findBy("id", invoice.user_id);

            // Get the lnd instance
            const lnd = LightningService.getLndInstance();

            // Upload the hash to the Blockstream Satellite
            // TODO: Upgrade this to upload the file instead of the string from the IPFS hash
            await axios
              .post(
                "https://api.blockstream.space/order?bid=10000&message=" +
                  invoice.ipfs_hash
              )
              .then(async function(body) {
                // Get the uuid, auth token and pr to deliver the data
                const uuid = body.data.uuid;
                const authToken = body.data.auth_token;

                // The pr must be sent to the client to pay the satellite operation
                const pr = body.data.lightning_invoice["payreq"];

                // Pay the blockstream satellite payment request
                await payInvoice({ lnd, request: pr });

                // Emit data to the ws channel
                Ws.getChannel("invoice")
                  .topic("invoice")
                  .emitTo(
                    "invoicePaid",
                    {
                      // send the UUID & auth token
                      uuid,
                      authToken
                    },
                    [socketId]
                  );
              });
          } catch (error) {
            Logger.error("error");
            Logger.error(error);
          }
        }

        // If a lightning invoice has been paid for a certification using Open Time Stamps
        if (data.description.includes("Open Time Stamps")) {
          Logger.info("Invoice paid for passport generation usin Open Time Stamps");

          // Split the data form the description until getting the file id
          const filename = data.description.split("| ");

          // Get the path for the data to verify using OTS
          const path = 'public/temp/' + filename[1] + '.pdf'

          try {
            // Find invoice by ID and save it into db as paid
            const invoice = await Invoice.findBy("invoiceId", data.id);


            // Get the socket ID from the invoices
            const socketId = `invoice#${invoice.socketId}`;

            // Update the invoice to paid
            invoice.is_paid = true;

            // Save the invoice
            await invoice.save();

            // Get the user by his/her session id
            const user = await User.findBy("id", invoice.user_id);

            // Read the file of the data to verify using OTS
            const file = fs.readFileSync(path)

            // Create an OTS stamp
            const detached = OpenTimestamps.DetachedTimestampFile.fromBytes(new OpenTimestamps.Ops.OpSHA256(), file);
            OpenTimestamps.stamp(detached).then( ()=>{

              // Serialize the OTS stamp proof
              const fileOts = detached.serializeToBytes();

              // Generate a temporary path to store the OTS stamp proof
              const frontPath = '/temp/'+ Date.now().toString()+'.ots'

              // Generate a relative path to access the stamp proof from the front
              const verificationPath = 'public'+ frontPath

              // Write the OTS stamp proof in the previous path to serve it as a gateway
              fs.writeFile( verificationPath, fileOts, async function (err) {
                  if (err) throw err;
                  // Upload the hash of the verification hash to IPFS to have a gateway
                  await LightningService.uploadToIPFS(verificationPath)
                    .then(function(result) {

                      // automate the self-destruction operation from both paths
                      PdfService.autoDeletePdf(verificationPath);
                      PdfService.autoDeletePdf(frontPath);

                      // Log the IPFS hash gateway
                      Logger.info("IPFS HASH: " + result.hash);

                      // Emit the data outputs through the ws channel
                       Ws.getChannel("invoice").topic("invoice").emitTo("invoicePaid",{

                        //  send the temp gateway and the permanent gateway of the OTS stamp proof
                          verification: frontPath,
                          verificationIpfsPath: result.hash
                        },
                        [socketId]
                      );
                    })
                    .catch(function(error) {
                      console.log("Failed!", error);
                    });
                });
            });

          } catch (error) {
            Logger.error("error");
            Logger.error(error);
          }
        }
      } else {
        // Invoice creation notification
        Logger.notice("Invoice created");
      }
    });
  } catch (error) {
    Logger.error(error);
  }
};

// Delete invoices that are not paid on start up
const deleteInvoices = async () => {
  await Database.table("invoices")
    .where("is_paid", false)
    .delete();
};

// Since BTCPay Server closes WS every 90 seconds it must be looped recursively
try {
  initWS();
} catch (error) {
  Logger.error(error);
}
