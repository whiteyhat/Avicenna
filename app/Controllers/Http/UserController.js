/**
Copyright 2019 Carlos Roldan Torregrosa

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

"use strict";
const Logger = use("Logger");
const edge = require("edge.js");
const User = use("App/Models/User");
const Clinic = use("App/Models/Clinic");
const Helpers = use("Helpers");
const Env = use("Env");
const LightningService = use("App/Services/LightningService");
const PdfService = use("App/Services/PdfService");
const Database = use("Database");
const lnService = require("ln-service");
const createInvoice = require("ln-service/createInvoice");
const Invoices = use("App/Models/Invoice");

/**
Class to perform
 */ 
class UserController {
  /**
   * Controller to log out from the auth middleware
   * @param auth middleware provider for authentication
   */
  async logout({ auth, response }) {
    try {
      await auth.logout();
      return response.send({ type: "info", msg: "Bye!" });
    } catch (error) {
      Logger.error(error);
      return response.send({
        type: "error",
        msg: "We had an error logging you off"
      });
    }
  }
  /**
  Controller that returns the passport creator view if the user is identified
   */
  async passportView({ request, view, response, auth }) {
    try {
      // Get user by id
      const user = await User.findBy("id", auth.user.id);
      if (user) {
        // If the user is found get his/her clinic
        const clinic = await Clinic.findBy("id", user.clinic_id);

        // return the passport generator view
        return view.render("index", { user, clinic });
      } else {
        // If the user has no permissions return an error message
        response.send({ error: "You do not have the permissions" });
      }
    } catch (error) {
      Logger.error(error);
    }
  }

  /**
   * Controller to deletet a user only if the admin
   * is sending the request
   * @param auth middleware provider for authentication
   * @param request http request from the client
   * @param response http response from the server
   */
  async deleteAccount({ auth, response, request }) {
    // Get the user to delete id from the request
    const { id } = request.all();
    let msg = "You do not have the right permsisions";
    let type = "error";
    try {
      // If the admins is the client sending the request
      if (auth.user.admin) {
        // Delete the authentication token from the DB
        await Database.table("tokens")
          .where("user_id", id)
          .delete();

        // Delete the user from the DB
        await Database.table("users")
          .where("id", id)
          .delete();

        // Add a successful message
        msg = "User deleted";
        type = "success";

        // If the admin is not sending the request
      } else {
        // If the user is trying to remove himself
        if (auth.user.id == id) {
          // Delete the authentication token from the DB
          await Database.table("tokens")
            .where("user_id", auth.user.id)
            .delete();

          // Delete the user from the DB
          await Database.table("users")
            .where("id", auth.user.id)
            .delete();

          // Add a successful message
          msg = "User deleted";
          type = "success";
        }
      }
      //   Send the response
      response.send({ type, msg });
    } catch (error) {
      Logger.error(error);
    }
  }

  /**
  Controller that returns the staff view if the user is identified
   */
  async staff({ auth, view, response }) {
    try {
      // if the user has a pubkey
      if (auth.user.wallet) {
        // Get the names, roles and pubkeys from all the users in the platform
        const users = await Database.select("name", "role", "wallet").from(
          "users"
        );

        // render the staff view
        return view.render("staff", { users });
      } else {
        // if the user has no permissions return an error messagee
        response.send({
          error: "You do not have the permission to view the admin panel"
        });
      }
    } catch (error) {
      Logger.error(error);
    }
  }

  /**
  Controller that returms the donate view for clinics
   */
  async donate({ view, response, params }) {
    try {
      // get the clinic name from the dynamic route
      const clinicName = params.wallet;

      // find the clinic by its name
      const clinic = await Clinic.findBy("name", clinicName);
      if (clinic) {

        // Instantiate the lnd instance
        let lnd = null

        // If the health-care facility has activated the non-custodial feature
        if (clinic.tls && clinic.grgpc && clinic.macaroon) {
          
          // Instantiate the non custodial ln instance using their invoice macaroon
          lnd = LightningService.nonCustodialLndInstance();
        }else{

        // Instantiate the custodial lnd instance. This is required for evey lightning call
         lnd = LightningService.getLndInstance();
        }

        // Time to be cancelled the invoice. After 60 seconds
        var t = new Date();
        t.setSeconds(t.getSeconds() + 60 * 3);

        // Create invoice with respective time
        const pr = await createInvoice({
          lnd,
          description: "Donate to " + clinic.name,
          expires_at: t
        });

        // Split the coordinates by the symbol ',' for syntax
        const coordinates = clinic.location.split(",");

        // render the view with a custom PR request and clinic details
        return view.render("donation", {
          pr: pr.request,
          clinic,
          x: coordinates[0],
          y: coordinates[1]
        });
      } else {
        // If no clinic is found with this name return an error messagge
        response.send({ error: "No clinic registered with this name" });
      }
    } catch (error) {
      Logger.error(error);
    }
  }

  /**
  Controller that returns an admin view for admins
   */
  async admin({ auth, view, response }) {
    try {
      // If the user has admin permissiones
      if (auth.user.admin) {
        // get all of the user main details from the DB
        const users = await Database.select(
          "name",
          "id",
          "role",
          "address",
          "email",
          "phone",
          "wallet",
          "created_at"
        ).from("users");

        // Get all health-care facilities from the DB
        const clinics = await Database.select("*").from("clinics");

        // Render the view with the clinics and user list
        return view.render("admin", { users, clinics });
      } else {
        // If the user has no admini permissions return an error message
        response.send({
          error: "You do not have the permission to view the admin panel"
        });
      }
    } catch (error) {
      Logger.error(error);
    }
  }

  /**
  Controller that returns the profile view for the healthh-care practitioner
   */
  async profile({ view, auth, response }) {
    try {
      // Find the user by his/her session id
      const user = await User.findBy("id", auth.user.id);
      if (user) {
        // Get the user clinic
        const clinic = await Clinic.findBy("id", user.clinic_id);

        // Get all the clinic name registered in the DB
        const clinics = await Database.select("name").from("clinics");

        // Return the profile view with the user clinic and the rest of clinics
        return view.render("profile", { clinic, clinics });
      } else {
        // If the users is not authenticated returns an error message
        response.send({ error: "You do not have the permissions" });
      }
    } catch (error) {
      Logger.error(error);
    }
  }

  /**
  Controller to update the donation page
   */
  async updateDonationPage({ auth, request, response }) {
    // Get the request body
    const {
      grpc,
      tls,
      macaroon,
      location,
      target,
      about,
      name
    } = request.all();
    try {
      // Parse the FormData into JSON data
      const grpcJson = JSON.parse(grpc);
      const tlsJson = JSON.parse(tls);
      const macaroonJson = JSON.parse(macaroon);
      const locationJson = JSON.parse(location);
      const targetJson = JSON.parse(target);
      const aboutJson = JSON.parse(about);
      const nameJson = JSON.parse(name);

      // Get the images from the request
      const image1 = request.file("image1");
      const image2 = request.file("image2");

      // If no donation details are provided return an error
      if (!grpc || !tls || !macaroon) {
        return response.send({
          error: "GRPC, TLS CERT or MACAROON must be provided"
        });
      }

      // If the user has a session id
      if (auth.user.id) {
        // Find the user by his/her session id
        const user = await User.findBy("id", auth.user.id);

        // If the user has staff permissions
        if (user.staff) {
          // Find the clinic by the user id
          const clinic = await Clinic.findBy("user_id", user.id);

          // Add lightning details
          clinic.grpc = grpcJson;
          clinic.macaroon = macaroonJson;
          clinic.tls = tlsJson;

          // Add clinic information details
          clinic.name = nameJson;
          clinic.location = locationJson;
          clinic.target = targetJson;
          clinic.about = aboutJson;

          // Create a temporary image with a timestamp
          const tempImage = Date.now().toString() + ".jpg";

          // move the image to the public folder where the donation pictures are
          await tempImage.move(Helpers.publicPath("img/donation-pictures/"), {
            name: tempImage,
            overwrite: true
          });

          // if error display it in the console log
          if (!tempImage.moved()) {
            logger.error("error when moving image");
          }

          // Create a second temporary image with a timestamp
          const secondTempImage = Date.now().toString() + ".jpg";

          // move the image to the public folder where the donation pictures are
          await image2.move(Helpers.publicPath("img/donation-pictures/"), {
            name: secondTempImage,
            overwrite: true
          });

          // if error display it in the console log
          if (!image2.moved()) {
            logger.error("error when moving image");
          }

          // Save path images in the DB
          clinic.image1 = "/img/donation-pictures/" + tempImage;
          clinic.image2 = "/img/donation-pictures/" + secondTempImage;

          // Save clinic
          await clinic.save();

          // Return a notification message to update the user
          return response.send({
            type: "success",
            msg: "Donation page updated"
          });
        }
      }
    } catch (error) {
      Logger.error(error);
    }
  }

  /**
  Controller to generate a safe gateway to serve the encrypted passport
  when it has been certified using the Blockstream Satellite
   */
  async satelliteComplete({ request, response, auth }) {
    try {
      // Get the body request
      const {
        patient,
        report,
        allergy,
        immunisation,
        social,
        medication,
        password,
        signature,
        message,
        wallet,
        uuid,
        ipfshash,
        authToken
      } = request.all();

      // Get the user instance to use for the final certification
      const user = await User.findBy("id", auth.user.id);

      // Parse the form data objects
      const image = request.file("image");
      const jsonPatient = JSON.parse(patient);
      const reportJson = JSON.parse(report);
      const allergyJson = JSON.parse(allergy);
      const immunisationJson = JSON.parse(immunisation);
      const socialJson = JSON.parse(social);
      const medicationJson = JSON.parse(medication);
      const passwordJson = JSON.parse(password);
      const signatureJson = JSON.parse(signature);
      const messageJson = JSON.parse(message);
      const ipfs = JSON.parse(ipfshash);
      const uuidJson = JSON.parse(uuid);
      const authTokenJson = JSON.parse(authToken);

      // create final data object to create the PDF Certificate
      const data = {
        image,
        patient: jsonPatient,
        report: reportJson,
        allergy: allergyJson,
        immunisation: immunisationJson,
        social: socialJson,
        password: passwordJson,
        medication: medicationJson,
        certification: {
          satellite: {
            uuid: uuidJson,
            authToken: authTokenJson
          },
          hash: ipfs,
          signature: signatureJson,
          message: messageJson,
          wallet: user.wallet
        },
        doctor: user
      };

      // Create the final PDF Certificate with the satellite data
      let path = PdfService.generatePDF(data, Date.now().toString());

      // craete the full relative path
      const relativePath = "public/temp/" + path;

      // automate the self-destruction operation
      PdfService.autoDeletePdf(relativePath);

      // Upload the initial medical health record to IPFS
      await LightningService.uploadToIPFS(relativePath)
        .then(function(result) {
          // Display the IPFS HASH in the console log
          Logger.info("IPFS HASH: " + result.hash);

          // Return the IPFS hash gateway to the user
          return response.send({ hash: result.hash, path });
        })
        .catch(function(error) {
          console.log("Failed!", error);
        });
    } catch (error) {
      Logger.error(error);
    }
  }

  /**
  Controller to generate a safe gateway to serve the encrypted passport
  when it has been certified using Open Time Stamps
   */
  async otsComplete({ request, response, auth }) {
    try {
      // Get the  body request
      const {
        patient,
        report,
        allergy,
        immunisation,
        social,
        medication,
        password,
        signature,
        message,
        wallet,
        ipfshash,
        verification
      } = request.all();

      // Find the user by his/her session id
      const user = await User.findBy("id", auth.user.id);

      let data = null;

      // Parse the form data objects
      const image = request.file("image");
      const jsonPatient = JSON.parse(patient);
      const reportJson = JSON.parse(report);
      const allergyJson = JSON.parse(allergy);
      const immunisationJson = JSON.parse(immunisation);
      const socialJson = JSON.parse(social);
      const medicationJson = JSON.parse(medication);
      const passwordJson = JSON.parse(password);
      const signatureJson = JSON.parse(signature);
      const messageJson = JSON.parse(message);
      const ipfs = JSON.parse(ipfshash);
      const verificationJson = JSON.parse(verification);

      // create final data object to create the PDF Certificate
      data = {
        image,
        patient: jsonPatient,
        report: reportJson,
        allergy: allergyJson,
        immunisation: immunisationJson,
        social: socialJson,
        password: passwordJson,
        medication: medicationJson,
        certification: {
          ots: {
            verification: verificationJson
          },
          hash: ipfs,
          signature: signatureJson,
          message: messageJson,
          wallet: user.wallet
        },
        doctor: user
      };

      // Create the final PDF Certificate with the satellite data
      let path = PdfService.generatePDF(data, Date.now().toString());

      // craete the full relative path
      const relativePath = "public/temp/" + path;

      // automate the self-destruction operation
      PdfService.autoDeletePdf(relativePath);

      // Upload the initial medical health record to IPFS
      await LightningService.uploadToIPFS(relativePath)
        .then(function(result) {
          // Display the IPFS HASH in the console log
          Logger.info("IPFS HASH: " + result.hash);

          // Return the IPFS hash gateway to the user
          return response.send({ hash: result.hash, path });
        })
        .catch(function(error) {
          console.log("Failed!", error);
        });
    } catch (error) {
      Logger.error(error);
    }
  }

  /**
  Controller to provide a payment gateway to the user for using
  the Blockstream Satellite stamping certification
   */
  async paySatellite({ auth, request, response }) {
    try {
      // If the user has a session id
      if (auth.user.id) {
        // Get the request body
        const { ipfshash, socket } = request.all();

        // Find the user by his/her session id
        const user = await User.findBy("id", auth.user.id);

        // Parse the FormData objects into JSON
        const hash = JSON.parse(ipfshash);
        const socketId = JSON.parse(socket);

        // Instantiate lnd instance. This is required for evey lightning call
        const lnd = LightningService.getLndInstance();

        // Time to be cancelled the invoice. After 60 seconds
        var t = new Date();
        t.setSeconds(t.getSeconds() + 60 * 3);

        // Create invoice with respective time
        const pr = await createInvoice({
          lnd,
          tokens: 15,
          description: "Upload Avicenna's Passport to Blockstream Satellite",
          expires_at: t
        });
        // create an invoice to the DB with the current resources
        await Invoices.create({
          invoiceId: pr.id,
          ipfs_hash: hash,
          satoshis: pr.tokens,
          socketId
        });
        // Send invoice request and public key
        return response.send({ pr: pr.request });
      }
    } catch (error) {
      Logger.error(error);
    }
  }

  /**
  Controller to provide a payment gateway to the user for using
  the Open Time Stamps stamping certification
   */
  async payOpenTimeStamps({ auth, request, response }) {
    try {
      // If the user has a session id
      if (auth.user.id) {
        // Get the body request
        const { ipfshash, socket, filename } = request.all();

        // Find the user by his/her session id
        const user = await User.findBy("id", auth.user.id);

        // Parse the FormData objects into JSON
        const hash = JSON.parse(ipfshash);
        const socketId = JSON.parse(socket);
        const filenameJson = JSON.parse(filename);

        // Split the filename to generate a file id
        const split = filenameJson.split(".");
        const fileId = split[0];

        // Instantiate lnd instance. This is required for evey lightning call
        const lnd = LightningService.getLndInstance();

        // Time to be cancelled the invoice. After 60 seconds
        var t = new Date();
        t.setSeconds(t.getSeconds() + 60 * 3);

        // Create invoice with respective time
        const pr = await createInvoice({
          lnd,
          tokens: 5,
          description:
            "Certify Avicenna's Passport using Open Time Stamps | " + fileId,
          expires_at: t
        });
        // create an invoice to the DB with the current resources
        await Invoices.create({
          invoiceId: pr.id,
          ipfs_hash: hash,
          satoshis: pr.tokens,
          socketId
        });
        // Send invoice request and public key
        return response.send({ pr: pr.request });
      }
    } catch (error) {
      Logger.error(error);
    }
  }

  /**
  Controller to generate the inital raw data from the passport to later on
  be certified
   */
  async newPassport({ auth, request, response }) {
    try {
      // If the user has a session id
      if (auth.user.id) {
        // Get the body request
        const {
          patient,
          report,
          allergy,
          immunisation,
          social,
          medication,
          password,
          signature,
          message,
          wallet
        } = request.all();

        // Find the user by his/her session id
        const user = await User.findBy("id", auth.user.id);

        // Parse the FormData objects into JSON
        const image = request.file("image");
        const jsonPatient = JSON.parse(patient);
        const reportJson = JSON.parse(report);
        const allergyJson = JSON.parse(allergy);
        const immunisationJson = JSON.parse(immunisation);
        const socialJson = JSON.parse(social);
        const medicationJson = JSON.parse(medication);
        const passwordJson = JSON.parse(password);

        // Create the data object to send it to the PDF Service
        const data = {
          image,
          patient: jsonPatient,
          report: reportJson,
          allergy: allergyJson,
          immunisation: immunisationJson,
          social: socialJson,
          password: passwordJson,
          medication: medicationJson
        };

        // Create the initial medical health record
        let path = PdfService.generatePDF(data, Date.now().toString());

        // craete the full relative path
        const relativePath = "public/temp/" + path;

        // automate the self-destruction operation
        PdfService.autoDeletePdf(relativePath);

        // Upload the initial medical health record to IPFS
        await LightningService.uploadToIPFS(relativePath)
          .then(function(result) {
            // Display the IPFS HASH in the console log
            Logger.info("IPFS HASH: " + result.hash);

            // Return the IPFS hash gateway to the user
            return response.send({ hash: result.hash, filename: path });
          })
          .catch(function(error) {
            console.log("Failed!", error);
          });
      } else {
        // If the user does not have a session id return an error message
        response.send({ error: "Not an authorized user" });
      }
    } catch (error) {
      Logger.error(error);
    }
  }

  /**
  Controller to create a new user in the system
   */
  async createUser({ auth, request, response }) {
    try {
      // Get the request body
      const { wallet, staff, admin } = request.all();

      // If the user has admin persmissions
      if (auth.user.admin) {
        // Generate a random nonce
        const nonce = Math.floor(Math.random() * 10000);

        // Instantiate response variables
        let msg = "";
        let type = "";

        // Create a new user with the request details and the previous random nonce
        const user = await User.create({
          wallet: wallet.toLowerCase(),
          nonce,
          clinic_id: (Math.random() * (10 - 1) + 1)
        });

        // If the user created needs to have staff permisssions
        if (staff === "true") {
          // Grant the previous generated user with staff permissions
          user.staff = 1;

          // Save the user
          await user.save();
        }

        // If the user created needs to have admin permisssions
        if (admin === "true") {
          // Grant the previous generated user with admins permissions
          user.admin = 1;

          // save the user
          await user.save();
        }

        // If the user was successfully created and updated send a response message
        // If there was any error send an error message
        if (user) {
          // Update the response variables
          msg = "New user added";
          type = "success";
        } else {
          msg = "There was an error when adding a new user";
          type = "error";
        }

        response.send({ type, msg });
      } else {
        response.send({
          type: "error",
          msg: "You do not have the permission to create"
        });
      }
    } catch (error) {
      Logger.error(error);
    }
  }

  /**
  Controller to add a user to a clinic
   */
  async addUserToClinic({ auth, request, response }) {
    try {
      // Get the request body
      const { name, wallet } = request.all();

      // If the user has admin permissions
      if (auth.user.admin) {
        // Instantiate the response body
        let msg = "";
        let type = "";

        // Get the user by the pubkey
        const user = await User.findBy({ wallet: wallet.toLowerCase() });

        // Get the clinic by name
        const clinic = await Clinic.findBy({ name });

        // If the user and clinic exist
        if (user && clinic) {
          // Update the reponse body
          msg = "New user added";
          type = "success";

          // User to clinic
          user.clinic_id = clinic.id;

          // Save the user
          await user.save();
        } else {
          // If an error is present send an error message
          msg = "No clinic or user selected";
          type = "error";
        }

        // send the reponse body to the user
        return response.send({ type, msg });
      } else {
        response.send({
          type: "error",
          msg: "You do not have the permission to create users"
        });
      }
    } catch (error) {
      Logger.error(error);
    }
  }

  /**
  Controller to remove user from the clinic
   */
  async removeUserFromClinic({ auth, request, response }) {
    try {
      // Get the request body
      const { name, wallet } = request.all();

      // If the user has admin permissions
      if (auth.user.admin) {
        // Instantiate the response body
        let msg = "";
        let type = "";

        // Get the user by the pubkey
        const user = await User.findBy({ wallet: wallet.toLowerCase() });

        // Get the clinic by name
        const clinic = await Clinic.findBy({ name });

        // If the user and clinic exist
        if (user && clinic) {
          msg = "New user added";
          type = "success";

          // remove from the clinic ids
          user.clinic_id = 0;

          // Save the user
          await user.save();
        } else {
          // If an error is present send an error message
          msg = "No clinic or user selected";
          type = "error";
        }

        // send the reponse body to the user
        response.send({ type, msg });
      } else {
        response.send({
          type: "error",
          msg: "You do not have the permission to create"
        });
      }
    } catch (error) {
      Logger.error(error);
    }
  }

  /**
  Controller to create a clinic
   */
  async createClinic({ auth, request, response }) {
    try {
      // Get ther request body
      const { name } = request.all();

      // if the user has admin permissions
      if (auth.user.admin) {
        // Instantiate the response body
        let msg = "";
        let type = "";

        // Get the clinic by name
        const clinic = await Clinic.findBy({ name });

        // If the clinic already exisits send an error message
        // If the clinic does not exists, create the clinic
        if (clinic) {
          // Update respose error body
          msg = "This clinic already exists";
          type = "error";
        } else {
          // Create clinic
          const clinic = await Clinic.create({ name });

          // Update respose success body
          msg = "Clinic successfully created";
          type = "success";
        }

        // Return response to the user
        return response.send({ type, msg });
      } else {
        response.send({
          type: "error",
          msg: "You do not have the permission to create"
        });
      }
    } catch (error) {
      Logger.error(error);
    }
  }

  /**
  Controller to start the demo as an admin
   */
  async demoAdmin({ auth, request, response }) {
    try {
      // Get the request body
      const { wallet } = request.all();

      // Generate a random nonce
      const nonce = Math.floor(Math.random() * 10000);

      // Find the user by the pubkey
      const user = await User.findBy("wallet", wallet);

      // If user already exists in the DB
      if (user) {
        // Delete user auth tokens
        await Database.table("tokens")
          .where("user_id", user.id)
          .delete();

        // Delete user
        await user.delete();

        // Create a new user
        await User.create({ wallet: wallet.toLowerCase(), nonce, admin: true, name: "Admin" });

        // Return response body
        return response.send({
          type: "info",
          msg: "Demo started. Please click on log in on the top right button"
        });

        // If the user does not exist in the DB
      } else {
        // Create a new user
        await User.create({ wallet: wallet.toLowerCase(), nonce, admin: true, name:"Admin" });

        // Return response body to the user
        return response.send({
          type: "info",
          msg: "Demo started. Please click on log in on the top right button"
        });
      }
    } catch (error) {
      Logger.error(error);
    }
  }

  /**
  Controller to start the demo as a doctor
   */
  async demoDoctor({ auth, request, response }) {
    try {
      // Get the request body
      const { wallet } = request.all();

      // Generate a random nonce
      const nonce = Math.floor(Math.random() * 10000);

      // Find the user by the pubkey
      const user = await User.findBy("wallet", wallet);

      // If user already exists in the DB
      if (user) {
        // Delete user tokens
        await Database.table("tokens")
          .where("user_id", user.id)
          .delete();

        // Delete user
        await user.delete();

        // Creaate a new user
        await User.create({
          wallet: wallet.toLowerCase(),
          nonce,
          clinic_id: (Math.random() * (10 - 1) + 1)
        });

        // If the user does not exist in the DB
      } else {
        // Create a new user
        await User.create({
          wallet: wallet.toLowerCase(),
          nonce,
          clinic_id: (Math.random() * (10 - 1) + 1)
        });
      }

      // Return response body to the user
      return response.send({
        type: "info",
        msg: "Demo started. Please click on log in on the top right button"
      });
    } catch (error) {
      Logger.error(error);
    }
  }

  /**
   Controller to edit the user profile
    */
  async edit({ auth, request, response }) {
    // Get the request body parameters
    const { role, name, email, phone, clinic, address } = request.all();
    try {
      // If the user is authentified
      if (auth.user.wallet) {
        // Get the user by the pubkey
        const user = await User.findBy("wallet", auth.user.wallet);

        // If role param has been provided
        if (role != undefined) {
          // Update the user role
          user.role = role;
        }

        // If name param has been provided
        if (name != undefined) {
          // Update the user name
          user.name = name;
        }

        // If role param has been provided
        if (address != undefined) {
          // Update the user address
          user.address = address;
        }

        // If role param has been provided
        if (email != undefined) {
          // Update the user email
          user.email = email;
        }

        // If role param has been provided
        if (phone != undefined) {
          // Update the user phone
          user.phone = phone;
        }

        // If role param has been provided
        if (clinic != undefined) {
          // Update the user clinic
          user.clinic = clinic;
        }

        // Save the user
        await user.save();

        // Return the response body
        return response.send({ msg: "Profile saved", type: "success" });
      } else {
        // Send an error message in case of not having permissions to update the profile
        return response.send({
          msg: "You do not have the permissions",
          type: "error"
        });
      }
    } catch (error) {
      Logger.error(error);
    }
  }

  /**
   * Controller to send a random nonce when users which
   * are identified in the DB send a request to log in
   * @param auth middleware provider for authentication
   * @param request http request from the client
   * @param response http response from the server
   */
  async login({ auth, request, response }) {
    try {
      // Get the public ket from the client using the webln provider
      const { wallet } = request.all();
      let type = "info";
      let msg = "Please, sign a secret message to login";

      //  Create a random big integer
      const randomNonce = Math.floor(Math.random() * 10000);
      const nonce =
        "I am signing a secret number (" +
        randomNonce +
        ") to log in Avicenna platform";

      //   If no public key was in the request body send an error responsee
      if (!wallet) {
        response
          .status(400)
          .send("Request should have signature and public key");
      }

      //   Find the user by searching by the public key
      const user = await User.findBy("wallet", wallet);

      if (user) {
        user.nonce = randomNonce;
        await user.save();

        // Send the random nonce which has been just created to the user to sign it
        response.send({
          nonce,
          msg,
          type
        });
      }
    } catch (error) {
      Logger.error("HERE", error);
    }
  }

  /**
   * Controller to verify the user digital signature
   * @param auth middleware provider for authentication
   * @param request http request from the client
   * @param response http response from the server
   */
  async digitalSignature({ auth, request, response }) {
    //   Get the public key and signature from the client request
    const { wallet, signature } = request.all();

    // If the signature or public is not in the request body return an error
    if (!signature || !wallet) {
      return res.status(400).send({
        error: "Request should have signature and public key"
      });
    }

    try {
      let msg = "";
      let type = "";
      // Find the user by his public key
      const user = await User.findBy("wallet", wallet);

      // Create a data object with the user and the signature
      const data = { user, signature };

      //   If the signature is verified

      await LightningService.verifyDigitalSignature(data).then(async function(
        result
      ) {
        if (result.pubkey.signed_by.toLowerCase() === user.wallet) {
          await auth.logout();
          // Create an auth token to login and remember the user
          await auth.remember(true).login(user);

          // Add an informative successful message
          msg = "Welcome back";
          type = "success";

          return response.send({ type, msg });
          // If the signature fails the verification process
        } else {
          // Add an error message
          msg = "We could not verify your digital signature";
          type = "error";
          return response.send({ type, msg });
        }
      });
    } catch (error) {
      Logger.error(error);
    }
  }
}

module.exports = UserController;
