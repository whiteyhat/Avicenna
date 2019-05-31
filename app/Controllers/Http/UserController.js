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

var FormData = require("form-data");

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

  async staff({ auth, view, response }) {
    try {
      if (auth.user.wallet) {
        const users = await Database.select("name", "role", "wallet").from(
          "users"
        );
        edge.global("contract", Env.get("CONTRACT_ADDRESS"));
        return view.render("staff", { users });
      } else {
        response.send({
          msg: "You do not have the permission to view the admin panel"
        });
      }
    } catch (error) {
      Logger.error(error);
    }
  }

  async donate({ view, response, params }) {
    try {
      const clinicName = params.wallet;

      // Get the user instance to use for the final certification
      const clinic = await Clinic.findBy("name", clinicName);
      if (clinic) {
        // Instantiate lnd instance. This is required for evey lightning call
        const lnd = LightningService.getLndInstance();

        // Time to be cancelled the invoice. After 60 seconds
        var t = new Date();
        t.setSeconds(t.getSeconds() + 60 * 3);

        // Create invoice with respective time
        const pr = await createInvoice({
          lnd,
          description: "Donate to " + clinic.name,
          expires_at: t
        });

        const coordinates = clinic.location.split(",");

        return view.render("donation", {
          pr: pr.request,
          clinic,
          x: coordinates[0],
          y: coordinates[1]
        });
      } else {
        response.send({ msg: "No clinic registered with this publick key" });
      }
    } catch (error) {
      Logger.error(error);
    }
  }

  async admin({ auth, view, response }) {
    try {
      if (auth.user.admin) {
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
        const clinics = await Database.select("*").from("clinics");

        return view.render("admin", { users, clinics });
      } else {
        response.send({
          msg: "You do not have the permission to view the admin panel"
        });
      }
    } catch (error) {
      Logger.error(error);
    }
  }

  async profile({ view, auth, response }) {
    try {
      const user = await User.findBy("id", auth.user.id);
      if (user) {
        const clinic = await Clinic.findBy("user_id", user.id);
        const clinics = await Database.select("name").from("clinics");

        return view.render("profile", { clinic, clinics });
      } else {
        response.send({ msg: "You do not have the permissions" });
      }
    } catch (error) {
      Logger.error(error);
    }
  }

  async noCustodial({ auth, request, response }) {
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
      const grpcJson = JSON.parse(grpc);
      const tlsJson = JSON.parse(tls);
      const macaroonJson = JSON.parse(macaroon);
      const locationJson = JSON.parse(location);
      const targetJson = JSON.parse(target);
      const aboutJson = JSON.parse(about);
      const nameJson = JSON.parse(name);

      const image1 = request.file("image1");
      const image2 = request.file("image2");

      if (!grpc || !tls || !macaroon) {
        return response.send({
          error: "GRPC, TLS CERT or MACAROON must be provided"
        });
      }
      if (auth.user.id) {
        const user = await User.findBy("id", auth.user.id);
        if (user.staff) {
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

          const name1 = Date.now().toString() + ".jpg";

          await image1.move(Helpers.publicPath("img/donation-pictures/"), {
            name: name1,
            overwrite: true
          });

          if (!image1.moved()) {
            logger.error("error when moving image");
          }

          const name2 = Date.now().toString() + ".jpg";

          await image2.move(Helpers.publicPath("img/donation-pictures/"), {
            name: name2,
            overwrite: true
          });

          if (!image2.moved()) {
            logger.error("error when moving image");
          }

          // Save path images
          clinic.image1 = "/img/donation-pictures/" + name1;
          clinic.image2 = "/img/donation-pictures/" + name2;

          // Save clinic
          await clinic.save();
          return response.send({
            type: "success",
            msg: "Lightning node successfully linked"
          });
        }
      }
    } catch (error) {
      Logger.error(error);
    }
  }

  async passportComplete({ request, response, auth }) {
    try {
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
      const uuidJson = JSON.parse(uuid);
      const authTokenJson = JSON.parse(authToken);
      const ipfs = JSON.parse(ipfshash);

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
        satellite: {
          uuid: uuidJson,
          authToken: authTokenJson,
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
      PdfService.autoDeletePdf(path);

      // Upload the initial medical health record to IPFS
      await LightningService.uploadToIPFS(relativePath)
        .then(function(result) {
          Logger.info("IPFS HASH: " + result.hash);
          return response.send({ hash: result.hash, path });
        })
        .catch(function(error) {
          console.log("Failed!", error);
        });
    } catch (error) {
      Logger.error(error);
    }
  }

  async paySatellite({ auth, request, response }) {
    try {
      if (auth.user.id) {
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
          socket
        } = request.all();

        // Get the user instance to use for the final certification
        const user = await User.findBy("id", auth.user.id);

        // Parse the form data objects
        const image = request.file("image");
        const jsonPatient = JSON.parse(patient);
        const hash = JSON.parse(ipfshash);
        const reportJson = JSON.parse(report);
        const allergyJson = JSON.parse(allergy);
        const immunisationJson = JSON.parse(immunisation);
        const socialJson = JSON.parse(social);
        const medicationJson = JSON.parse(medication);
        const passwordJson = JSON.parse(password);
        const socketId = JSON.parse(socket);
        const signatureJson = JSON.parse(signature);
        const messageJson = JSON.parse(message);

        Logger.info(signatureJson);
        Logger.info(message);

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
  async newPassport({ auth, request, response }) {
    try {
      if (auth.user.id) {
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
        PdfService.autoDeletePdf(path);

        // Upload the initial medical health record to IPFS
        await LightningService.uploadToIPFS(relativePath)
          .then(function(result) {
            Logger.info("IPFS HASH: " + result.hash);
            return response.send({ hash: result.hash });
          })
          .catch(function(error) {
            console.log("Failed!", error);
          });
      } else {
        Logger.info("Not an identified doctor");
        response.send({ msg: "Not an identified doctor" });
      }
    } catch (error) {
      Logger.error(error);
    }
  }

  async getPassport({ auth, request, response }) {
    try {
      const { uid, auth_token } = request.all();
      if (auth.user) {
        axios
          .get("https://api.blockstream.space/order/" + uid, {
            auth_token
          })
          .then(function(response) {})
          .catch(function(error) {
            console.log(error);
          });
      }
    } catch (error) {
      Logger.error(error);
    }
  }

  async createUser({ auth, request, response }) {
    try {
      const { wallet, staff, admin } = request.all();

      if (auth.user.admin) {
        const nonce = Math.floor(Math.random() * 10000);
        let msg = "";
        let type = "";
        const user = await User.create({ wallet: wallet.toLowerCase(), nonce });
        if (staff === "true") {
          user.staff = 1;
          await user.save();
        }
        if (admin === "true") {
          user.admin = 1;
          await user.save();
        }
        if (user) {
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

  async addUserToClinic({ auth, request, response }) {
    try {
      const { name, wallet } = request.all();

      if (auth.user.admin) {
        let msg = "";
        let type = "";
        const user = await User.findBy({ wallet: wallet.toLowerCase() });
        const clinic = await Clinic.findBy({ name });
        if (user && clinic) {
          msg = "New user added";
          type = "success";

          user.clinic_id = clinic.id;
          clinic.user_id = user.id;

          await clinic.save();
          await user.save();
        } else {
          msg = "No clinic or user selected";
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

  async removeUserFromClinic({ auth, request, response }) {
    try {
      const { name, wallet } = request.all();

      if (auth.user.admin) {
        let msg = "";
        let type = "";
        const user = await User.findBy({ wallet: wallet.toLowerCase() });
        const clinic = await Clinic.findBy({ name });
        if (user && clinic) {
          msg = "New user added";
          type = "success";

          user.clinic_id = 0;

          await clinic.save();
          await user.save();
        } else {
          msg = "No clinic or user selected";
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

  async createClinic({ auth, request, response }) {
    try {
      const { name } = request.all();

      if (auth.user.admin) {
        let msg = "";
        let type = "";
        const clinic = await Clinic.create({ name });
        if (clinic) {
          msg = "New clinic added";
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

  async demoAdmin({ auth, request, response }) {
    try {
      const { wallet } = request.all();
      const nonce = Math.floor(Math.random() * 10000);
      const user = await User.findBy("wallet", wallet);

      if (user) {
        await user.delete();
        await User.create({ wallet: wallet.toLowerCase(), nonce, admin: true });

        response.send({
          type: "info",
          msg: "Demo started. Please click on log in on the top right button"
        });
      }
      if (auth.user) {
        await auth.logout();
        return response.send({
          type: "info",
          msg:
            "You are already in Hippocrates, please log in on the top right button"
        });
      } else {
        await User.create({ wallet: wallet.toLowerCase(), nonce, admin: true });

        const msg =
          "Demo started. Please click on log in on the top right button";
        const type = "info";

        response.send({ type, msg });
      }
    } catch (error) {}
  }

  async demoDoctor({ auth, request, response }) {
    try {
      const { wallet } = request.all();
      const nonce = Math.floor(Math.random() * 10000);
      const user = await User.findBy("wallet", wallet);

      if (user) {
        await Database.table("tokens")
          .where("user_id", user.id)
          .delete();
        await user.delete();
        await User.create({ wallet: wallet.toLowerCase(), nonce });
      } else {
        await User.create({ wallet: wallet.toLowerCase(), nonce });
      }
      response.send({
        type: "info",
        msg: "Demo started. Please click on log in on the top right button"
      });
    } catch (error) {
      Logger.error(error);
    }
  }

  async edit({ auth, request, response }) {
    const { role, name, email, phone, clinic, address } = request.all();
    try {
      if (auth.user.wallet) {
        const user = await User.findBy("wallet", auth.user.wallet);
        if (role != undefined) {
          user.role = role;
        }
        user.role = role;
        if (name != undefined) {
          user.name = name;
        }
        if (address != undefined) {
          user.address = address;
        }

        if (email != undefined) {
          user.email = email;
        }

        if (phone != undefined) {
          user.phone = phone;
        }

        if (clinic != undefined) {
          user.clinic = clinic;
        }

        await user.save();
        response.send({ msg: "Profile saved", type: "success" });
      } else {
        response.send({
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
