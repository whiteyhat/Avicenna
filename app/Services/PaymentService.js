'use strict'

const Invoice = use("App/Models/Invoice");
const OpenTimestamps = require('javascript-opentimestamps');
const fs = require("fs");
const Logger = use("Logger");
const LightningService = use("App/Services/LightningService");
const PdfService = use("App/Services/PdfService");
const Ws = use("Ws");
const Env = use("Env");
const axios = require("axios");

class PaymentService {

  async openTimestamp(data) {

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

      // Read the file of the data to verify using OTS
      const file = fs.readFileSync(path)

      // Create an OTS stamp
      const detached = OpenTimestamps.DetachedTimestampFile.fromBytes(new OpenTimestamps.Ops.OpSHA256(), file);
      OpenTimestamps.stamp(detached).then(() => {

        // Serialize the OTS stamp proof
        const fileOts = detached.serializeToBytes();

        // Generate a temporary path to store the OTS stamp proof
        const frontPath = '/temp/' + Date.now().toString() + '.ots'

        // Generate a relative path to access the stamp proof from the front
        const verificationPath = 'public' + frontPath

        // Write the OTS stamp proof in the previous path to serve it as a gateway
        fs.writeFile(verificationPath, fileOts, async function (err) {
          if (err) throw err;
          // Upload the hash of the verification hash to IPFS to have a gateway
          await LightningService.uploadToIPFS(verificationPath)
            .then(function (result) {

              // automate the self-destruction operation from both paths
              PdfService.autoDeletePdf(verificationPath);
              PdfService.autoDeletePdf(frontPath);

              // Log the IPFS hash gateway
              Logger.info("IPFS HASH: " + result.hash);

              // Emit the data outputs through the ws channel
              Ws.getChannel("invoice").topic("invoice").emitTo("invoicePaid", {

                //  send the temp gateway and the permanent gateway of the OTS stamp proof
                verification: frontPath,
                verificationIpfsPath: result.hash
              },
                [socketId]
              );
            })
            .catch(function (error) {
              console.log("Failed!", error);
            });
        });
      });

    } catch (error) {
      Logger.error("error");
      Logger.error(error);
    }
  }

  async satellite(data) {
    try {
      // Find invoice by ID and save it into db as paid
      const invoice = await Invoice.findBy("invoiceId", data.id);

      // Get the socket ID from the invoices
      const socketId = `invoice#${invoice.socketId}`;

      // Update the invoice to paid
      invoice.is_paid = true;

      // Save the invoice
      await invoice.save();


      // Upload the hash to the Blockstream Satellite
      // TODO: Upgrade this to upload the file instead of the string from the IPFS hash
      await axios
        .post(
          Env.get('BLOCKSTREAM_API_URL') + "/order?bid=10000&message=" +
          invoice.ipfs_hash
        )
        .then(async function (body) {
          // Get the uuid, auth token and pr to deliver the data
          const uuid = body.data.uuid;
          const authToken = body.data.auth_token;

          // The pr must be sent to the client to pay the satellite operation
          const pr = body.data.lightning_invoice["payreq"];

          // Pay the blockstream satellite payment request
          const data = await axios.post(`${Env.get('OPEN_NODE_URL')}/v2/withdrawals`, { type: 'ln', amount: 10, address: pr }, { headers: { Authorization: Env.get('OPEN_NODE_WITHDRAW_API') } })

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

}

module.exports = new PaymentService();