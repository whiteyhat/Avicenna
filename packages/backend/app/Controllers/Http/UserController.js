'use strict'
const Logger = use('Logger')
const User = use('App/Models/User')
const LightningService = use('App/Services/LightningService')
const PdfService = use('App/Services/PdfService')
const axios = require('axios')
var FormData = require('form-data')
var fs = require('fs');

class UserController {

    /**
     * Controller to log out from the auth middleware
     * @param auth middleware provider for authentication
     */
    async logout({auth, response}) {
        try {
          await auth.logout()
          return response.send({type:"info", msg:"Bye!"})
        } catch (error) {
            Logger.error(error)
            return response.send({type:"error", msg:"We had an error logging you off"})
        }
      }

    /**
     * Controller to deletet a user only if the admin 
     * is sending the request
     * @param auth middleware provider for authentication
     * @param request http request from the client
     * @param response http response from the server
     */
    async deleteAccount({auth, response, request}) {
        // Get the user to delete id from the request
        const {id} = request.all()
        let msg = "You do not have the right permsisions"
        let type = "error"
        try {

            // If the admins is the client sending the request
          if (auth.user.admin) {

            // Delete the authentication token from the DB
            await Database
            .table('tokens')
            .where('user_id', id)
            .delete()
    
            // Delete the user from the DB
            await Database
            .table('users')
            .where('id', id)
            .delete()


            // Add a successful message
            msg = "User deleted"
            type = "success"

            // If the admin is not sending the request
          } else {

              // If the user is trying to remove himself
            if (auth.user.id == id) {
            // Delete the authentication token from the DB
              await Database
              .table('tokens')
              .where('user_id', auth.user.id)
              .delete()

            // Delete the user from the DB
              await Database
              .table('users')
              .where('id', auth.user.id)
              .delete()

            // Add a successful message
              msg = "User deleted"
              type = "success"
            }
          }
        //   Send the response
          response.send({type, msg})
        } catch (error) {
          Logger.error(error)
        }
      }

    /**
     * Controller to create new users only if the admin
     * is sending the request
     * @param auth middleware provider for authentication
     * @param request http request from the client
     * @param response http response from the server
     */
  async createUser({auth,request,response}) {

    try {
    // get thee public key from the webln providre
      const {public_key: publicKey} = request.all()
      let msg = ""
      let type = ""
    //   if the user is an admin, allow the creation of new users
      if (auth.user.admin) {
        const nonce = Math.floor(Math.random() * 10000)
        const user = await User.create({
          public_key: publicKey.toLowerCase(),
          nonce
        })
        // if the user is successfully created add a success response
        if (user) {
          msg = "New user added"
          type = "success"
        } else {
        // if the user is not created add an unsuccesssful response
          msg = "There was an error when adding a new user"
          type = "error"
        }
      } else {
        // if the user is not an admin, add an error message 
        msg = "You do not have the permission to create"
        type = "error"
      }

    //   send response
      response.send({type,msg})
    } catch (error) {
      Logger.error(error)
    }
  }

    /**
     * Controller to send a random nonce when users which
     * are identified in the DB send a request to log in
     * @param auth middleware provider for authentication
     * @param request http request from the client
     * @param response http response from the server
     */
  async login({auth,request,response}) {
    try {
    
    // Get the public ket from the client using the webln provider
      const {publicKey} = request.all()

    //  Create a random big integer  
      const nonce = Math.floor(Math.random() * 10000)

    //   If no public key was in the request body send an error responsee
      if (!publicKey) {
        response.status(400)
          .send('Request should have signature and public key')
      }

    //   Find the user by searching by the public key
      const user = await User.findBy('public_key', publicKey)

    //   If no user is found, check if there is any user in the DB
      if (!user) {
        let msg = ""
        let type = ""
        const query = await Database.select('*').from('users')
        let jwt = null
        // If there is no user in the DB, create a new user with admin permissions
        if (!query[0]) {
          const user = await User.create({
            public_key: publicKey,
            admin: 1,
            nonce
          })

        //   Create an auth token to remember the user
        jwt = await auth.generate(user)
          await auth.remember(true).login(user)

        //   Add an info message in the response
          msg = "Welcome to Hippocrates. New admin user created"
          type = "info"

        } else {
            // If no user was found in the DB and the DB is not empty add an error message
          msg = "Sorry, only registered users can access to Hippocrates"
          type = "error"
        }

        // Send the response body
        response.send({type,msg,nonce, jwt})

        // If a user was found in the DB replace the old nonce by a new random nonce to add
        // more security
      } else {
        user.nonce = nonce
        await user.save()

        msg = "Please, sign a random nonce generated randomly by us to verify your identity"
        type = "info"

        // Send the random nonce which has been just created to the user to sign it
        response.send({
          nonce: user.nonce, msg, type
        })
      }
    } catch (error) {
      Logger.error(error)
    }
  }

    /**
     * Controller to verify the user digital signature
     * @param auth middleware provider for authentication
     * @param request http request from the client
     * @param response http response from the server
     */
  async digitalSignature({auth,request,response}) {
    //   Get the public key and signature from the client request
    const {publicKey,signature} = request.all()

    // If the signature or public is not in the request body return an error 
    if (!signature || !publicKey) {
      return res
        .status(400)
        .send({
          error: 'Request should have signature and public key'
        })
    }

    try {
        let msg = ""
        let type = ""
        let jwt = null
    // Find the user by his public key
      const user = await User.findBy('public_key', publicKey)

    // Create a data object with the user and the signature
      const data = {user,signature}

      await LightningService.verifyDigitalSignature(data).then(async function(result){
        if (result.pubkey.signed_by.toLowerCase() === user.unique_key) {

            // make sure other session are logged off
            await auth.logout()

            //   Create an auth token to login and remember the user
            jwt = await auth.generate(user)
            await auth.remember(true).login(user)
            
            // Add an informative successful message
            msg = "Welcome back"
            type = "success"

            // send response with JWT auth token
          return response.send({type,msg, jwt})
        } else {
            
              // Add an error message
            msg = "We could not verify your digital signature"
            type = "error"
            return response.send({type,msg})
      }
    })
    } catch (error) {
      Logger.error(error)
    }
  }

  async newPassport({auth,request,response}) {
    try {
    if (auth.user.id) {
        const {patient,report,allergy,immunisation,social,medication,password, signature, message, wallet} = request.all()

        //*********************************************
        //**************** TESTING CODE ***************
        //*********************************************
        // const data = {patient: {
        //   name: "carlos",
        //   dob: "23/02/1992",
        // },report:[{
        //   condition: "Active",
        //   year: "2018"
        // }],allergy:[{
        //   title: "Active",
        //   year: "2018"
        // }],immunisation:[{
        //   title: "Active",
        //   year: "2018"
        // }],social:{
        //   mobility:"independent",
        //   eating:"independent"
        // },password: "123456",medication:[{
        //   title: "Insulin",
        //   dose: "3gr",
        //   plan:"Take 2 daily"
        // }]
        // }
        //*********************************************
        //*********************************************
        //*********************************************

        // Get the user instance to use for the final certification
        const user = await User.findBy('id', auth.user.id)

        // Parse the form data objects
        const image = request.file('image')
        const jsonPatient = JSON.parse(patient)
        const reportJson = JSON.parse(report)
        const allergyJson = JSON.parse(allergy)
        const immunisationJson = JSON.parse(immunisation)
        const socialJson = JSON.parse(social)
        const medicationJson = JSON.parse(medication)
        const passwordJson = JSON.parse(password)

        // Create the data object to send it to the PDF Service
        const data = {
          image,
          patient: jsonPatient,
          report: reportJson,
          allergy: allergyJson,
          immunisation: immunisationJson,
          social: socialJson,
          password: passwordJson,
          medication : medicationJson
        }
  
        // Create the initial medical health record
        let path = PdfService.generatePDF(data, Date.now().toString())

        // craete the full relative path
        const relativePath = "out/temp/"+path

        // automate the self-destruction operation
        PdfService.autoDeletePdf(path)
        
        // Upload the initial medical health record to IPFS
        await LightningService.uploadToIPFS(relativePath).then(async function(result) {
          Logger.info("IPFS HASH: " + result.hash)

          // Upload the hash to the Blockstream Satellite
          // TODO: Upgrade this to upload the file instead of the string from the IPFS hash
          await axios.post('https://api.blockstream.space/order?bid=10000&message='+result.hash).then(async function (body) {
            // Get the uuid, auth token and pr to deliver the data
            const uuid = body.data.id
            const authToken = body.data.auth_token

            // The pr must be sent to the client to pay the satellite operation
            const pr = body.data.lightning_invoice['payreq']

            //*********************************************
            //**************** TESTING CODE ***************
            //*********************************************
            // const data = {
            //   patient: {
            //     name: "carlos",
            //     dob: "23/02/1992",
            //   },report:[{
            //     condition: "Active",
            //     year: "2018"
            //   }],allergy:[{
            //     title: "Active",
            //     year: "2018"
            //   }],immunisation:[{
            //     title: "Active",
            //     year: "2018"
            //   }],social:{
            //     mobility:"independent",
            //     eating:"independent"
            //   },password: "123456",medication:[{
            //     title: "Insulin",
            //     dose: "3gr",
            //     plan:"Take 2 daily"
            //   }],
            //   satellite:{
            //     uuid, authToken, hash:result.hash, signature, message, wallet
            //   }, 
            //   doctor: user
            //   }
            //*********************************************
            //*********************************************
            //*********************************************


            // create final data object to create the PDF Certificate
              const finalData = {
                image,
                patient: jsonPatient,
                report: reportJson,
                allergy: allergyJson,
                immunisation: immunisationJson,
                social: socialJson,
                password: passwordJson,
                medication : medicationJson,
                satellite:{
                  uuid, authToken, hash:result.hash, signature, message, wallet
                }, 
                doctor: user
                }

            // Create the final PDF Certificate with the satellite data
            let finalPath = PdfService.generatePDF(finalData, Date.now().toString())

            // Upload the PDF Certificate to IPFS to ahve the immutable storage access endpoint
            await LightningService.uploadToIPFS(relativePath).then(async function(finalResult) {

            // automate the self-destruction operation of the certificate in the server
            PdfService.autoDeletePdf(finalPath)

            // Send the Payment Request to pay the satellite service
            // Send the hash to retrieve the certificate via https://ipfs.io/ipfs/<IPFS_HASH>
            // Send the path to access temporarily the certificate (because it takes 5-15 min to be available at IPFS)
            return response.send({pr, hash:finalResult.hash, path: "out/temp/"+path})

              }).catch(function(error) {
                console.log("Failed!", error);
              })
            // response.send(response.data.id)
            // let pa = PdfService.generatePDF(fullData, Date.now().toString())
          })
          .catch(function (error) {
            // console.log(error.response.data.errors);
            console.log(error)
          })

        }).catch(function(error) {
          console.log("Failed!", error);
        })

    }  else {
      Logger.info("Not an identified doctor")
      response.send({msg:"Not an identified doctor"})
    }
    } catch (error) {
      Logger.error(error)
    }
  }

  async getPassport({auth, request, response}) {
    try {
        const {uid, auth_token} = request.all()
      if (auth.user) {
          axios.get('https://api.blockstream.space/order/'+uid, {
            auth_token
          })
          .then(function (response) {
            
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    } catch (error) {
      Logger.error(error)
    }
  }
}

module.exports = UserController
