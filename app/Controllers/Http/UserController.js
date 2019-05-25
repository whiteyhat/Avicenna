'use strict'
const Logger = use('Logger')
const User = use('App/Models/User')
const LightningService = use('App/Services/LightningService')


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


  async demoAdmin({auth, request, response}) {
    
    try {
      const {wallet} = request.all()
      const nonce = Math.floor(Math.random() * 10000)
      const user = await User.findBy('wallet', wallet)

      if (user) {
        await user.delete()
        await User.create({wallet: wallet.toLowerCase(), nonce, admin:true})
    
        response.send({type:'info', msg: "Demo started. Please click on log in on the top right button"})
      }
      if (auth.user) {
        await auth.logout()
        return response.send({type:"info", msg:"You are already in Hippocrates, please log in on the top right button"})
      }else{
        await User.create({wallet: wallet.toLowerCase(), nonce, admin: true})
        
        const msg = 'Demo started. Please click on log in on the top right button'
        const type = "info"
      
        response.send({type, msg})
      }
  } catch (error) {
  }
}

async demoDoctor({auth, request, response}) {
    
  try {
    const {wallet} = request.all()
    const nonce = Math.floor(Math.random() * 10000)
    const user = await User.findBy('wallet', wallet)

    if (user) {
      await user.delete()
      await User.create({wallet: wallet.toLowerCase(), nonce})
    }else{
      await User.create({wallet: wallet.toLowerCase(), nonce})
    }
      response.send({type:'info', msg: "Demo started. Please click on log in on the top right button"})

    } catch (error) {
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
      const {wallet} = request.all()
      let type = "info"
      let msg = "Please, sign a secret message to login"

    //  Create a random big integer  
      const randomNonce = Math.floor(Math.random() * 10000)
      const nonce = "I am signing a secret number ("+randomNonce+") to log in Satoshis.Games platform"

    //   If no public key was in the request body send an error responsee
      if (!wallet) {
        response.status(400)
          .send('Request should have signature and public key')
      }

    //   Find the user by searching by the public key
      const user = await User.findBy('wallet', wallet)

       if (user) {
        user.nonce = randomNonce
        await user.save()

        // Send the random nonce which has been just created to the user to sign it
        response.send({
          nonce, msg, type
        })
      }
    } catch (error) {
      Logger.error("HERE", error)
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
    const {wallet,signature} = request.all()
    
    // If the signature or public is not in the request body return an error 
    if (!signature || !wallet) {
      return res
        .status(400)
        .send({
          error: 'Request should have signature and public key'
        })
    }

    try {
        let msg = ""
        let type = ""
    // Find the user by his public key
      const user = await User.findBy('wallet', wallet)

    // Create a data object with the user and the signature
      const data = {user,signature}

    //   If the signature is verified

    await LightningService.verifyDigitalSignature(data).then(async function(result){

      if (result.pubkey.signed_by.toLowerCase() === user.wallet) {

              await auth.logout()
              // Create an auth token to login and remember the user              
             await auth.remember(true).login(user)
               
              // Add an informative successful message
              msg = "Welcome back"
              type = "success"

            return response.send({type,msg})
            // If the signature fails the verification process
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
}

module.exports = UserController
