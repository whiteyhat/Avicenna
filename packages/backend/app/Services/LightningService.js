// Using the infura.io node, otherwise ipfs requires you to run a daemon on your own computer/server.
// IPFS docs: https://docs.ipfs.io/s
// Infura.io docs: https://infura.io/docs/
const IPFS = require('ipfs-http-client')
const ipfs = new IPFS({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https'
})

// Run with local daemon
// const IPFS = require('ipfs-api');
// const ipfs = new IPFS('localhost', '5001', {
//   protocol: 'http'
// });
const Logger = use('Logger')
const fs = require("fs")
const lnService = require('ln-service')
const Env = use('Env')

class LightningService {


  /**
   * Service to upload a file to the IPFS instance
   * @param {String} path path pointing to the file
   */
  async uploadToIPFS(path) {
    try {
      return new Promise(resolve => {

        //  Wait for 1 second to read the file as the PDF generation has latency
        setTimeout(function () {

          // Read the file from the path
          var content = fs.readFileSync(path)

          // If the 1 second delay to generate the pdf worked, it should be content
          // so this checks the PDF has been generated + read
          if (content) {
            Logger.info("Uploading file to IPFS")
            try {

              // save document to IPFS,return its hash
              // https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#add 
              ipfs.add(content, (err, ipfsHash) => {
                if (ipfsHash) {
                  //   Log IPFS hash
                  Logger.info(ipfsHash)

                  // Send in a promise the hash + path
                  resolve({
                    hash: ipfsHash[0].hash,
                    path: path
                  })
                }
              })
            } catch (error) {
              Logger.error(error)
            }
          }
        }, 1000)
      })
    } catch (error) {
      Logger.error(error)
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
        const msg = 'I am signing my one-time nonce: ' + data.user.nonce

        // Get the public key from the signed message and the signature 
        // https://github.com/alexbosworth/ln-service/blob/master/verifyMessage.js
        const publicKey = await lnService.verifyMessage(this.getLndInstance, msg, data.signature)


        // The signature verification is successful if the public key found with
        // lnService.verifyMessage matches the initial public key
        if (publicKey.toLowerCase() === data.user.publicKey.toLowerCase()) {
          return true
        } else {
          return false
        }
      } else {
        return false
      }
    } catch (error) {
      Logger.error(error)
    }

  }

  /**
   * Service to get the LND instance
   */
  async getLndInstance() {
    if (lndInstance == null) {
      lndInstance = await lnService.lightningDaemon({
        socket: this.getNodeAddress(),
        macaroon: Env.get('LND_MACAROON'),
      });
    }
    return lndInstance
  }

  /**
   * Service to get the node address
   */
  getNodeAddress() {
    return `${Env.get('LND_HOST')}:${Env.get('LND_PORT')}`
  }

}

module.exports = new LightningService()
