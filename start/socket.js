"use strict";

const Invoice = use("App/Models/Invoice");
const User = use("App/Models/User");
const lnService = require("ln-service");
const Logger = use("Logger");
const axios = require("axios");
const Ws = use("Ws");
const payInvoice = require("ln-service/pay");
const Database = use("Database");
const LightningService = use("App/Services/LightningService");

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
        // If invoice is equal to 1000 satoshis = If invoice for standard account creation
        if (
          data.description ===
          "Upload Avicenna's Passport to Blockstream Satellite"
        ) {
          Logger.info("Invoice paid for passport generation");

          try {
            // Find invoice by ID and save it into db as paid
            const invoice = await Invoice.findBy("invoiceId", data.id);
            const socketId = `invoice#${invoice.socketId}`;
            invoice.is_paid = true;
            await invoice.save();

            const user = await User.findBy("id", invoice.user_id);

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

                await payInvoice({ lnd, request: pr });

                Ws.getChannel("invoice")
                  .topic("invoice")
                  .emitTo(
                    "invoicePaid",
                    {
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
