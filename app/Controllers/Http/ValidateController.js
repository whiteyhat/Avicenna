/**
Copyright 2019 Carlos Roldan Torregrosa

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
"use strict";

const axios = require("axios");
const sha256 = require("hash.js/lib/hash/sha/256");
const Logger = use("Logger");
const Env = use("Env");

/**
Class to perform validation optiion for the Blockstream Satellite certification
 */
class ValidateController {

  /**
  Controller to validate the Blocstream Satellite data outputs
   */
  async validate({ request, response }) {

    try {

      // Get the body request
      const { uuid, authtoken, filehash } = request.all();

      // Instantiate teh response body
      let res = {
        message: "",
        satellite: {
          txFound: false,
          isPaid: false
        },
        ipfs: {
          isSha256Ok: false
        }
      };

      // HTTP Request to resolve the data body from the satellite
      const result = await axios.get(
        `${Env.get('BLOCKSTREAM_API_URL')}/order/${uuid}`,
        {
          //   use the auth token within for the auth headers
          headers: {
            "X-Auth-Token": authtoken
          },
          validateStatus: function (status) {
            return true;
          }
        }
      );

      // Get the data status
      const data = result.data;

      // AAdd the data status within the response body
      res.message = data.message;

      // If there is any error in the HTTP request
      if (result.status !== 200) {

        // Add the error log in the response body
        res.message = data.errors[0].detail;

        // Return the response body
        return response.status(200).send(res);
      }

      // If the Blockstream Satellite has a tx 
      // update the response body 
      res.satellite.txFound = true;

      // If there was any error within the satellite payment (lightning)
      if (data.status !== "sent") {

        // Update the response body
        res.message = "Satellite tx not paid";

        // Return the response body
        return response.status(200).send(res);
      }

      // If the Blockstream Satellite was paid (using lightning)
      // update the response body
      res.satellite.isPaid = true;

      // Make a hash (SHA-256) of the IPFS HASH obtained in the request body
      const filehash256 = sha256().update(filehash).digest("hex");

      // If there is an exact match between the SHA-256 hash from the 
      // blockstream satellite and the IPFS hashed hash, then the 
      // validation has been successful 
      if (data.message_digest === filehash256) {

        // Update the response body with successful details
        res.ipfs.isSha256Ok = true;
        res.message = "Successfully validated";
      }

      // Return the response body to the user
      return response.status(200).send(res);

    }
    catch (error) {
      Logger.error(error)
    }
  }
}

module.exports = ValidateController;
