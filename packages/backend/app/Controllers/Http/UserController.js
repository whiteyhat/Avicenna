'use strict'
const Logger = use('Logger')
const User = use('App/Models/User')
const LightningService = use('App/Services/LightningService')


class UserController {

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
     * are indentified in the DB send a request to log in
     * @param auth middleware provider for authentication
     * @param request http request from the client
     * @param response http response from the server
     */
  async login({auth,request,response}) {
    try {
    
    // Get the public ket from the client using the webln provider
      const {public_key: publicKey} = request.all()

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

        // If there is no user in the DB, create a new user with admin permissions
        if (!query[0]) {
          const user = await User.create({
            public_key: publicKey,
            admin: 1,
            nonce
          })

        //   Create an auth token to remember the user
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
        response.send({type,msg,nonce})

        // If a user was found in the DB replace the old nonce by a new random nonce to add
        // more security
      } else {
        user.nonce = nonce
        await user.save()

        // Send the random nonce whihchh has bene just created to the user to sign it
        response.send({
          nonce: user.nonce
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
    // Find the user by his public key
      const user = await User.findBy('public_key', publicKey)

    // Create a data object with the user and the signature
      const data = {user,signature}

    //   If the signature is verified
      if (LightningService.verifyDigitalSignature(data)) {

        //   Create an auth token to login and remember the user
        await auth.remember(true).login(user)

        // Add an informative successful message
        msg = "Welcomee back"
        type = "info"

        // If the signature fails the verification process
      } else {
    
         // Add an error message
        msg = "We could not verify your digital signature"
        type = "error"
      }
      response.send({type,msg})
    } catch (error) {
      Logger.error(error)
    }
  }
}

module.exports = UserController
