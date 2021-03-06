/**
Copyright 2019 Carlos Roldan Torregrosa

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// Using the infura.io node, otherwise ipfs requires you to run a daemon on your own computer/server.
// IPFS docs: https://docs.ipfs.io/s
// Infura.io docs: https://infura.io/docs/
const IPFS = require("ipfs-http-client");
const ipfs = new IPFS({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https"
});

// Run with local daemon
// const IPFS = require('ipfs-api');
// const ipfs = new IPFS('localhost', '5001', {
//   protocol: 'http'
// });
const Logger = use("Logger");
const fs = require("fs");
const lnService = require("ln-service");
const Env = use("Env");

let lndInstance = null;

class LightningService {
  /**
   * Service to upload a file to the IPFS instance
   * @param {String} path path pointing to the file
   */
  async uploadToIPFS(path) {
    try {
      return new Promise(resolve => {
        //  Wait for 1 second to read the file as the PDF generation has latency
        setTimeout(function() {
          // Read the file from the path
        var content = fs.readFileSync(path);

          // If the 1 second delay to generate the pdf worked, it should be content
          // so this checks the PDF has been generated + read
          if (content) {
            Logger.info("Uploading file to IPFS");
            try {
              // save document to IPFS,return its hash
              // https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#add
              ipfs.add(content, (err, ipfsHash) => {
                if (ipfsHash) {
                  //   Log IPFS hash
                  Logger.info(ipfsHash);

                  // Send in a promise the hash + path
                  resolve({
                    // Send the hash and path 
                    hash: ipfsHash[0].hash,
                    path: path
                  });
                }
              });
            } catch (error) {
              Logger.error(error);
            }
          }
        }, 1000);
      });
    } catch (error) {
      Logger.error(error);
    }
  }

  /**
   * Service to verify the client's signature
   * @param {Object} data parameter that contains the user object and the signature
   */
  async verifyDigitalSignature(data) {
    try {
      // If there nonce exists allow the verification process
      if (data.user.nonce) {
        // Replicate the message signature with the same random nonce signed by the client
        const message =
          "I am signing a secret number (" +
          data.user.nonce +
          ") to log in Avicenna platform";

        // const wallet = await  lnService.verifyMessage(LndService.getLndInstance(), msg, data.signature)

        return new Promise((resolve, reject) => {
          try {
            // Verify signature using the bitcoin instance, the message and the signature
            lnService.verifyMessage(
              {
                lnd: this.getLndInstance(),
                message,
                signature: data.signature
              },
              (err, pubkey) => {
                // Get the pubkey from the signature
                // message + signature = pubkey
                if (pubkey) {
                  resolve({
                    // send the publey in the promise
                    pubkey
                  });
                }
              }
            );
          } catch (error) {
            Logger.error(error);
          }
        });
      } else {
        return false;
      }
    } catch (error) {
      Logger.error(error);
    }
  }

   async checkSandardSignature(data) {
    try {
        return new Promise((resolve, reject) => {
          try {
            // Verify signature using the bitcoin instance, the message and the signature
            lnService.verifyMessage(
              {
                lnd: this.getLndInstance(),
                message: data.message,
                signature: data.signature
              },
              (err, pubkey) => {
                // Get the pubkey from the signature
                // message + signature = pubkey
                if (pubkey) {
                  resolve({
                    // send the publey in the promise
                    pubkey
                  });
                }
                if (err) {
                  console.log(err)
                }
              }
            );
          } catch (error) {
            Logger.error(error);
          }
        });
    } catch (error) {
      Logger.error(error);
    }
  }

  /**
   * Service to get the LND instance
   */
   getLndInstance() {
    if (lndInstance == null) {

      // If no cusodial node using a non bcpay server lightning instance
      if (Env.get("LND_TLS")) {
      lndInstance = lnService.lightningDaemon({
          socket: this.getNodeAddress(),
          macaroon: Env.get("LND_MACAROON"),
          cert:Env.get("LND_TLS")
      });

      // if no custodial node using a btcpay server insance
      } else {
        lndInstance = lnService.lightningDaemon({
          socket: this.getNodeAddress(),
          macaroon: Env.get("LND_MACAROON")
      });
      }
      
    }
    return lndInstance;
  }

  /**
   * Service to get the LND instance
   */
   nonCustodialLndInstance(clinic) {
     try { 
      if (lndInstance == null) {
        lndInstance = lnService.lightningDaemon({
          socket: clinic.grpc,
          macaroon: clinic.macaroon,
          cert: clinic.tls
        });
      }
      return lndInstance;
    } catch (error) {
       Logger.error(error)
     }
  }

  /**
   * Service to get the node address
   */
  getNodeAddress() {
    return `${Env.get("LND_HOST")}:${Env.get("LND_PORT")}`;
  }
}

module.exports = new LightningService();
