/**Copyright 2019 Carlos Roldan Torregrosa

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function() {
  function r(e, n, t) {
    function o(i, f) {
      if (!n[i]) {
        if (!e[i]) {
          var c = "function" == typeof require && require;
          if (!f && c) return c(i, !0);
          if (u) return u(i, !0);
          var a = new Error("Cannot find module '" + i + "'");
          throw ((a.code = "MODULE_NOT_FOUND"), a);
        }
        var p = (n[i] = { exports: {} });
        e[i][0].call(
          p.exports,
          function(r) {
            var n = e[i][1][r];
            return o(n || r);
          },
          p,
          p.exports,
          r,
          e,
          n,
          t
        );
      }
      return n[i].exports;
    }
    for (
      var u = "function" == typeof require && require, i = 0;
      i < t.length;
      i++
    )
      o(t[i]);
    return o;
  }
  return r;
})()(
  {
    1: [
      function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        function requestProvider(_) {
          if (_ === void 0) {
            _ = {};
          }
          if (typeof window === "undefined") {
            throw new Error("Must be called in a browser context");
          }
          var webln = window.webln;
          if (!webln) {
            throw new Error("Your browser does not support WebLN");
          }
          return webln.enable().then(function() {
            return webln;
          });
        }
        exports.requestProvider = requestProvider;
      },
      {}
    ],
    2: [
      function(require, module, exports) {
        // instantaite webln provider
        var requestProvider = require("webln/lib/client");

        // instantiate main variables to store data about the patient
        var patient,
          report,
          allergy,
          immunisation,
          social,
          medication = null;
        var conditionCounter = 0;
        var allergyCounter = 0;
        var immunisationCounter = 0;
        var medication = 0;

        // instantiate user data arrays
        var conditionArray = [];
        var allergyArray = [];
        var immunisationArray = [];
        var medicationArray = [];
        var image = "";

        // instantiate ws object
        var ws;

        $(document).ready(function() {
          // Connecet ws channel through adonis
          ws = adonis.Ws().connect();
          ws.on("open", obj => {
            // Subscribe to our precviously created channel called invoice
            var invoice = ws.subscribe("invoice");
            $("[name=_connId]").val(obj.connId);
          });
          // On error report the issue
          ws.on("error", e => {
            console.log("error", e);
          });

          //Initialize tooltips
          $(".nav-tabs > li a[title]").tooltip();

          // Wizard tabs
          $('a[data-toggle="tab"]').on("show.bs.tab", function(e) {
            var $target = $(e.target);

            if ($target.parent().hasClass("disabled")) {
              return false;
            }
          });

          // next wizard tab
          $(".next-step").click(function(e) {
            var $active = $(".wizard .nav-tabs li.active");
            $active.next().removeClass("disabled");
            nextTab($active);
          });

          // previous wizard tab
          $(".prev-step").click(function(e) {
            var $active = $(".wizard .nav-tabs li.active");
            prevTab($active);
          });
        });

        // next wizard tab behaviour
        function nextTab(elem) {
          $(elem)
            .next()
            .find('a[data-toggle="tab"]')
            .click();
        }

        // next wizard tab behaviour
        function prevTab(elem) {
          $(elem)
            .prev()
            .find('a[data-toggle="tab"]')
            .click();
        }

        // Add medical condition
        $("#add-condition").on("click", async function() {
          // Create report data object
          report = {
            condition: $("#condition").val(),
            year: $("#year").val(),
            notes: $("#condition-notes").val()
          };

          // push the condition data object into the array
          conditionArray.push(report);

          // add 1 more to the condition counter
          conditionCounter++;

          // display medical conditions in the console log
          console.log(conditionArray);

          // append the condition in the view
          $("#conditionblock").append(
            '<div class="input-group input-group-sm"><span class="input-group-addon"><b>Condition</b></span><input disabled value="' +
              report.condition +
              '" type="text" class="form-control"aria-describedby="sizing-addon1"><span class="input-group-addon" id="sizing-addon1"><b>Year</b></span><input value="' +
              report.year +
              '" disabled type="text" class="form-control"aria-describedby="sizing-addon1"></div><br><div class="form-group"><label for="exampleFormControlTextarea1" class="text-muted">Additional Notes</label><textarea class="form-control" disabled rows="3">' +
              report.notes +
              "</textarea></div><legend></legend>"
          );

          // clear the textfields to allow another entry to be typed
          $("#condition").val("");
          $("#year").val("");
          $("#condition-notes").val("");
          toast("info", "New condition added");
        });

        // Add allergy
        $("#add-allergy").on("click", function() {
          // instantiate tas no risky
          let risk = "No";

          // if the risk option is checked then make it risky
          if ($("#risk").is(":checked")) {
            risk = "Yes";
          }

          // create the allergy data object
          allergy = {
            name: $("#allergy-name").val(),
            risk: risk,
            notes: $("#allergy-notes").val()
          };

          // push the allergy data object into the array
          allergyArray.push(allergy);

          // add 1 more to the allergy counter
          allergyCounter++;

          // display allergies in the console log
          console.log(allergy);

          // append the allergy in the view
          if (risk) {
            $("#allergyblock").append(
              '<div class="input-group input-group-sm"><span class="input-group-addon" id="sizing-addon1"><b>Allergy</b></span><input disabled value="' +
                allergy.name +
                '" type="text" class="form-control"aria-describedby="sizing-addon1"><span class="input-group-addon" id="sizing-addon1"><b>High Risk</b></span><input value="Yes" disabled type="text" class="form-control"aria-describedby="sizing-addon1"></div><br><div class="form-group"><label for="exampleFormControlTextarea1" class="text-muted">Additional Notes</label><textarea class="form-control" disabled rows="3">' +
                allergy.notes +
                "</textarea></div><legend></legend>"
            );
          } else {
            $("#allergyblock").append(
              '<div class="input-group input-group-sm"><span class="input-group-addon" id="sizing-addon1"><b>Allergy</b></span><input disabled value="' +
                allergy.name +
                '" type="text" class="form-control"aria-describedby="sizing-addon1"><span class="input-group-addon" id="sizing-addon1"><b>High Risk</b></span><input value="No" disabled type="text" class="form-control"aria-describedby="sizing-addon1"></div><br><div class="form-group"><label for="exampleFormControlTextarea1" class="text-muted">Additional Notes</label><textarea class="form-control" disabled rows="3">' +
                allergy.notes +
                "</textarea></div><legend></legend>"
            );
          }

          // display notification to the user
          toast("info", "New allergy added");

          // clear the textfields to allow another entry to be typed
          $("#allergy-name").val("");
          $("#allergy-notes").val("");
          $("#risk").prop("checked", false);
        });

        // Add an immunisation
        $("#add-immunisation").on("click", function() {
          // create the immunisation data object
          immunisation = {
            name: $("#immunisation-name").val(),
            year: $("#immunisation-date").val()
          };

          // push the immunisation data object into the array
          immunisationArray.push(immunisation);

          // add 1 more to the allergy counter
          immunisationCounter++;

          // display immunisation in the console log
          console.log(immunisationArray);

          // append the immunisation in the view
          $("#immunisationblock").append(
            '<div class="input-group input-group-sm"><span class="input-group-addon" id="sizing-addon1"><b>Allergy</b></span><input  disabled value="' +
              immunisation.name +
              '" type="text" class="form-control"aria-describedby="sizing-addon1"><span class="input-group-addon" id="sizing-addon1"><b>Date</b></span><input value="' +
              immunisation.year +
              '" disabled type="text" class="form-control"aria-describedby="sizing-addon1"></div><legend></legend>'
          );

          // clear the textfields to allow another entry to be typed
          $("#immunisation-name").val("");
          $("#immunisation-date").val("");

          // display notification to the user
          toast("info", "New immunisation added");
        });

        // When clickin on the save button 1
        $("#save1").on("click", async function() {
          // instantiate the WebLN instance
          let webln;
          try {
            // Request WebLN provider
            webln = await requestProvider.requestProvider();
          } catch (err) {
            // Handle users without WebLN
            toast(
              "error",
              "Download the extension of Lightning Joule to connect your lightning node <a href='https://lightningjoule.com/'><button type='button' id='okBtn' class='btn btn-primary'>Install</button></a>"
            );
          }

          // instantiatte teh gender object
          let gender = null;
          if ($("#male").is(":checked")) {
            // if male is checked then male
            gender = "male";
          } else {
            // if female checked the female
            gender = "female";
          }

          // create the patient data object
          patient = {
            dna: $("#DNA").val(),
            blood: $("#blood").val(),
            name: $("#name").val(),
            dob: $("#dob").val(),
            gender: gender
          };

          // display immunisation in the console log
          console.log(patient);

          // display notification to the user
          toast("success", "Patient personal details saved");
        });

        // When clicking on change picture
        $("#changePicture").on("change", async function() {
          var file = document.querySelector("input[type=file]").files[0];
          var reader = new FileReader();

          reader.onloadend = function() {
            $("#userPic").attr("src", reader.result);
            $("#userPic").fadeToggle();
          };

          if (file) {
            reader.readAsDataURL(file);
          } else {
            console.log("Error on image buffer");
          }
        });

        // When clicking on save 2
        $("#save2").on("click", function() {
          // instantiate mobility data object
          let mobility = null;

          // get mobility type
          if ($("#mobility-independent").is(":checked")) {
            mobility = "independent";
          } else if ($("#mobility-help").is(":checked")) {
            mobility = "some help";
          } else {
            mobility = "dependent";
          }

          // instantiate eating data object
          let eating = null;

          // get eating type
          if ($("#eating-independent").is(":checked")) {
            eating = "independent";
          } else if ($("#eating-help").is(":checked")) {
            eating = "some help";
          } else {
            eating = "dependent";
          }

          // instantiate dressing data object
          let dressing = null;

          // get dressing type
          if ($("#dressing-independent").is(":checked")) {
            dressing = "independent";
          } else if ($("#dressing-help").is(":checked")) {
            dressing = "some help";
          } else {
            dressing = "dependent";
          }

          // instantiate toileting data object
          let toileting = null;

          // get toileting type
          if ($("#toileting-independent").is(":checked")) {
            toileting = "independent";
          } else if ($("#toileting-help").is(":checked")) {
            toileting = "some help";
          } else {
            toileting = "dependent";
          }

          // instantiate washing data object
          let washing = null;

          // get washing type
          if ($("#washing-independent").is(":checked")) {
            washing = "independent";
          } else if ($("#washing-help").is(":checked")) {
            washing = "some help";
          } else {
            washing = "dependent";
          }

          // create the social data object
          social = {
            mobility,
            eating,
            dressing,
            toileting,
            washing,
            activity: $("#social-activity").val(),
            behaviour: $("#social-behaviour").val()
          };

          // display social in the console log
          console.log(social);

          // display notification to the suer
          toast("success", "Patient medical report saved");
        });

        // When clicking on add medication
        $("#add-medication").on("click", async function() {
          // Instantiate the days
          let monday = "No";
          let tuesday = "No";
          let wednesday = "No";
          let thursday = "No";
          let friday = "No";
          let saturday = "No";
          let sunday = "No";

          // Instantiate the dates array
          let dates = [];

          // if monday checked, add it to the array
          if ($("#monday").is(":checked")) {
            dates.push(" Monday");
            monday = "Yes";
          }

          // if tuesday checked, add it to the array
          if ($("#tuesday").is(":checked")) {
            dates.push(" Tuesday");
            tuesday = "Yes";
          }

          // if wednesday checked, add it to the array
          if ($("#wednesday").is(":checked")) {
            dates.push(" Wednesday");
            wednesday = "Yes";
          }

          // if thursday checked, add it to the array
          if ($("#thursday").is(":checked")) {
            dates.push(" Thursday");
            thursday = "Yes";
          }

          // if friday checked, add it to the array
          if ($("#friday").is(":checked")) {
            dates.push(" Friday");
            friday = "Yes";
          }

          // if saturday checked, add it to the array
          if ($("#saturday").is(":checked")) {
            dates.push(" Saturday");
            saturday = "Yes";
          }

          // if sunday checked, add it to the array
          if ($("#sunday").is(":checked")) {
            dates.push(" Sunday");
            sunday = "Yes";
          }

          // create the patient data object
          medication = {
            name: $("#medication-name").val(),
            dose: $("#medication-dose").val(),
            monday,
            tuesday,
            wednesday,
            thursday,
            friday,
            saturday,
            sunday,
            plan: $("#medication-plan").val()
          };

          // push the medication data object into the array
          medicationArray.push(medication);

          // display medication in the console log
          console.log(medication);

          // Append medication to the view
          $("#medicationblock").append(
            '<div class="input-group input-group-sm"><span class="input-group-addon"><b>Medication</b></span><input disabled value="' +
              medication.name +
              '" type="text" class="form-control"aria-describedby="sizing-addon1"><span class="input-group-addon"><b>Dose</b></span><input value="' +
              medication.dose +
              '" disabled type="text" class="form-control"aria-describedby="sizing-addon1"></div><br><div class="input-group input-group-sm"><span class="input-group-addon"><b>Days at week</b></span><input disabled value="' +
              dates.toString() +
              '" type="text" class="form-control"aria-describedby="sizing-addon1"></div><div class="form-group"><label for="exampleFormControlTextarea1" class="text-muted">Plan Care</label><textarea class="form-control" disabled rows="3">' +
              medication.plan +
              "</textarea></div><legend></legend>"
          );

          // clear the textfields to allow another entry to be typed
          $("#medication-name").val("");
          $("#medication-dose").val("");
          $("#monday").prop("checked", false);
          $("#tuesday").prop("checked", false);
          $("#wednesday").prop("checked", false);
          $("#thursday").prop("checked", false);
          $("#friday").prop("checked", false);
          $("#saturday").prop("checked", false);
          $("#sunday").prop("checked", false);
          $("#medication-plan").val("");

          // display notification to the user
          toast("info", "New medication prescribed");
        });

        // Clicking on the button save 3
        $("#save3").on("click", function() {
          //  Display notification to the user
          toast("success", "Patient medication saved");
        });

        // Clicking on the button save 4 => main button to generate the passport
        $("#save4").on("click", async function() {

          // create the validation checks
          var check1 = $('input[name="reg1"]:checked').length > 0;
          var check2 = $('input[name="reg2"]:checked').length > 0;
          var check3 = $('input[name="reg3"]:checked').length > 0;

          // get the user password
          var pass = $("#encryptPassword").val();

          // validation checks to ensure the user has understand the requirements
          if (check1 && check2 && check3 && pass != undefined) {
            // if the satellite has been chosen display a different title for the second step
            if ($("input[name='satellite']").val() === "true") {
              $("#loading_text").text("Linking IPFS to Blockstream Satellite");
              $("#modal_title").text("Upload to Blockstream Satellite");
            } else {
              $("#loading_text").text("Certifying using Open Time Stamps");
              $("#modal_title").text("Certify Passport using Open Time Stamps");
            }

            // instantiate the WebLN instance
          let webln;
          try {
            // Request WebLN provider
            webln = await requestProvider.requestProvider();
          } catch (err) {
            // Handle users without WebLN
             toast(
                "error",
                "Sorry, an enabled WebLN Provider is required to sign the patient diagnosis in the Bicoin network. <a href='https://lightningjoule.com/'><button type='button' class='btn btn-primary'>Install</button></a>"
              );
              return;
          }

            // switch to the loading view
            $("#loader").fadeToggle();

            // hide the password view
            $("#createPass").fadeToggle();

            // create the message data object to be signed by the user using his/her private keys
            const message =
              "As a " +
              $("[name=doctorRole]").val() +
              " of the " +
              $("[name=doctorClinic]").val() +
              ", I can validate that the accuracy of this medical record is my responsibility and/or " +
              $("[name=doctorClinic]").val() +
              "'s responsibility. This medical record belongs uniquely to " +
              patient.name +
              " or his/her or legal guardian. This data has been encrypted with a password provided by " +
              patient.name +
              " or his/her legal guardian. Me, " +
              $("[name=doctorName]").val() +
              ", I agree with these terms and use my public keys from my lightning peer id to sign this document, today, " +
              formatDate(new Date()) +
              ".";

              // prompt a sign message using the WebLN provider
              webln
                .signMessage(message, async success => {})
                .then(function(signature) {
                  // if the digital signature has been successful
                  if (signature) {
                    // display a notification to the user about the next step after tthe signature
                    toast(
                      "info",
                      "Encrypting and uploading patient passport to IPFS"
                    );

                    // create a FormData to store data about the patient details to be sent to the backend
                    const formData = new FormData();

                    // append data to the FormData object
                    formData.append(
                      "image",
                      document.querySelector("input[type=file]").files[0]
                    );
                    formData.append("patient", JSON.stringify(patient));
                    formData.append("report", JSON.stringify(conditionArray));
                    formData.append(
                      "signature",
                      JSON.stringify(signature.signature)
                    );
                    formData.append("message", JSON.stringify(message));
                    formData.append("allergy", JSON.stringify(allergyArray));
                    formData.append(
                      "immunisation",
                      JSON.stringify(immunisationArray)
                    );
                    formData.append(
                      "medication",
                      JSON.stringify(medicationArray)
                    );
                    formData.append("social", JSON.stringify(social));
                    formData.append(
                      "password",
                      JSON.stringify($("[name=encryptPassword]").val())
                    );

                    // do http request to the backend to send the patient data
                    var request = $.ajax({
                      url: "/api/v0/passport/new",
                      data: formData,
                      type: "post",
                      contentType: false, // NEEDED, DON'T OMIT THIS (requires jQuery 1.6+)
                      processData: false, // NEEDED, DON'T OMIT THIS
                      headers: {
                        "x-csrf-token": $("[name=_csrf]").val()
                      }
                    });

                    // Id the http request has been successful
                    request.done(function(data) {
                      // display the a valid animation for the step 1
                      $("#loader1").toggle();
                      $("#valid1").toggle();

                      // get the params from the response body
                      const ipfsHash = data.hash;
                      const filename = data.filename;

                      // display a notification to the user about the outputs of the step 1
                      toast(
                        "info",
                        "Passport encrypted and uploaded to IPFS with the following hash: " +
                          ipfsHash +
                          ". <br><a href='https://ipfs.io/ipfs/" +
                          ipfsHash +
                          "' target='_blank''><button type='button'class='btn btn-default'>Open</button></a>"
                      );

                      // append IPFS HASH, socket id, and temp file path of the user data to the FormData object
                      formData.append("ipfshash", JSON.stringify(ipfsHash));
                      formData.append("filename", JSON.stringify(filename));
                      formData.append(
                        "socket",
                        JSON.stringify($("[name=_connId]").val())
                      );

                      // if the validation methhohd was the satellite
                      if ($("input[name='satellite']").val() === "true") {
                        // do a http request to upload the user data into the Blockstream Satellite
                        var request = $.ajax({
                          url: "/api/v0/passport/satellite",
                          data: formData,
                          type: "post",
                          contentType: false, // NEEDED, DON'T OMIT THIS (requires jQuery 1.6+)
                          processData: false, // NEEDED, DON'T OMIT THIS
                          headers: {
                            "x-csrf-token": $("[name=_csrf]").val()
                          }
                        });

                        // If successful returns a payment request to pay the invoice to proceed with
                        // the certification process
                        request.done(function(result) {
                          setTimeout(function() {
                            // after 1.75 seconds
                            setTimeout(() => {
                              // display an informative message about the amount to pay using lightning
                              toast(
                                "info",
                                "Pay " +
                                  result.price +
                                  " satoshis to certify the passport using the Blockstream Satellite"
                              );
                            }, 1750);

                            // display payment request as a QR code with a clickable lightning prefix
                            showPR(
                              result,
                              "#pr",
                              "#invoiceRoute",
                              "#pr-string"
                            );

                            // Event handler to copy the invoice request when click the button copy
                            copyInvoice("#pr-string", "#copy-invoice");

                            // display the costs
                            $("#sats").text(result.price + "sats");

                            // display the modal
                            $("#payreq").modal("show");

                            // when the invoice has been paid retrieve data about the Blockstream
                            // Satellite order UUID + AUTH TOKEN
                            ws.getSubscription("invoice").on(
                              "invoicePaid",
                              blockstream => {
                                // append the UUID + AUTH TOKEN to the FormData object
                                formData.append(
                                  "uuid",
                                  JSON.stringify(blockstream.uuid)
                                );
                                formData.append(
                                  "authToken",
                                  JSON.stringify(blockstream.authToken)
                                );

                                // display a notification to the user
                                toast(
                                  "success",
                                  "Passport uploaded to Blockstream Satellite"
                                );

                                // hide the modal
                                $("#payreq").modal("hide");

                                // display the a valid animation for the step 2
                                $("#loader2").toggle();
                                $("#valid2").toggle();

                                // display an informative notification to the user
                                toast(
                                  "info",
                                  "Generating a Passport certification"
                                );

                                // after 1 second
                                setTimeout(() => {
                                  // do a http request to complete the certification process to generate a new
                                  // pdf containing data ab out the patient + doctor signature + Blockstream
                                  // Satellite outputs
                                  var request = $.ajax({
                                    url: "/api/v0/passport/satellite/complete",
                                    data: formData,
                                    type: "post",
                                    contentType: false, // NEEDED, DON'T OMIT THIS (requires jQuery 1.6+)
                                    processData: false, // NEEDED, DON'T OMIT THIS
                                    headers: {
                                      "x-csrf-token": $("[name=_csrf]").val()
                                    }
                                  });

                                  // If successful returns a temp path to serve quickly the passport which
                                  // it will be self-destructed in 60 approx and serve an immutable path to
                                  // retrieve the public access for the patient passporrt using an IPFS gateway
                                  request.done(function(obj) {
                                    // display the a valid animation for the step 3
                                    $("#loader3").toggle();
                                    $("#valid3").toggle();

                                    // after 1 second
                                    setTimeout(() => {
                                      // switch the view for the passport access screen
                                      $("#loader").fadeToggle();
                                      $("#passportView").fadeToggle();

                                      // display the public key of the patient passport
                                      $("#passportQR").attr(
                                        "src",
                                        "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://ipfs.io/ipfs/" +
                                          obj.hash
                                      );

                                      // set the path for a temporary quick access fo the patient's passport
                                      $("#viewQR").attr(
                                        "href",
                                        "/temp/" + obj.path
                                      );

                                      // create a link to download the patient's passport public key as a QR image
                                      $("#downloadQrCode").on(
                                        "click",
                                        function() {
                                          document.getElementById(
                                            "download_gateway"
                                          ).src =
                                            "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://ipfs.io/ipfs/" +
                                            obj.hash;
                                        }
                                      );

                                      // set the immutable path to serve the patient's passport using an IPFS gateway
                                      $("#linkQR").attr(
                                        "href",
                                        "https://ipfs.io/ipfs/" + obj.hash
                                      );
                                    }, 1000);
                                  });

                                  // If error display the error message and switch the view
                                  request.fail(function(jqXHR, textStatus) {
                                    console.log(textStatus, jqXHR);

                                    // switch the view
                                    $("#loader").fadeToggle();
                                    $("#createPass").fadeToggle();
                                  });
                                }, 1000);
                              }
                            );
                          }, 2000);
                        });

                        // If error display the error message and switch the view
                        request.fail(function(jqXHR, textStatus) {
                          console.log(textStatus, jqXHR);

                          // switch the view
                          $("#loader").fadeToggle();
                          $("#createPass").fadeToggle();
                        });

                        // If the cerrtification method chosen is Open Time Stamps
                      } else {
                        $("#loading_text").text(
                          "Linking IPFS to Blockstream Satellite"
                        );

                        // do a http request to retrieve a payment request to proceed with the
                        // Open Time Stamps certification
                        var request = $.ajax({
                          url: "/api/v0/passport/opentimestamps",
                          data: formData,
                          type: "post",
                          contentType: false, // NEEDED, DON'T OMIT THIS (requires jQuery 1.6+)
                          processData: false, // NEEDED, DON'T OMIT THIS
                          headers: {
                            "x-csrf-token": $("[name=_csrf]").val()
                          }
                        });

                        // if the http request is successful returns the payment request of 5 satoshis
                        request.done(function(result) {
                          // after 2 seconds
                          setTimeout(function() {
                            // after 1.75 seconds
                            setTimeout(() => {
                              // display an informative message about the amount to pay using lightning
                              toast(
                                "info",
                                "Pay " +
                                  result.price +
                                  " satoshis to certify the passport using Open Time Stamps"
                              );
                            }, 1750);

                            // display payment request as a QR code with a clickable lightning prefix
                            showPR(
                              result,
                              "#pr",
                              "#invoiceRoute",
                              "#pr-string"
                            );

                            // Event handler to copy the invoice request when click the button copy
                            copyInvoice("#pr-string", "#copy-invoice");

                            // display the costs
                            $("#sats").text(result.price + " sats");

                            // hide modal
                            $("#payreq").modal("show");
                          }, 2000);

                          // when the invoice has been paid retrieve data about the .ost stamp file
                          ws.getSubscription("invoice").on(
                            "invoicePaid",
                            ots => {
                              // Add the temporary path for the .ost stamp file to the FormData object
                              formData.append(
                                "verification",
                                JSON.stringify(ots.verificationIpfsPath)
                              );

                              // display a notifcation message
                              toast(
                                "success",
                                "Passport certified using Open Time Stamps"
                              );

                              // hide modal
                              $("#payreq").modal("hide");

                              // display the a valid animation for the step 2
                              $("#loader2").toggle();
                              $("#valid2").toggle();

                              // display an informative message about the IPFS gateway to serve the .ots file
                              toast(
                                "info",
                                "Passport certified using Open Time Stamps accessible using an IPFS gateway. " +
                                  "<br><a href='https://ipfs.io/ipfs/" +
                                  ots.verificationIpfsPath +
                                  "' target='_blank''><button type='button'class='btn btn-default'>Open</button></a>"
                              );

                              // down.oad the .ots file to the local device
                              document.getElementById("download_gateway").src =
                                ots.verification;

                              // after 1 second
                              setTimeout(() => {
                                // If successful returns a temp path to serve quickly the passport which
                                // it will be self-destructed in 60 approx and serve an immutable path to
                                // retrieve the public access for the patient passporrt using an IPFS gateway
                                var request = $.ajax({
                                  url: "/api/v0/passport/ots/complete",
                                  data: formData,
                                  type: "post",
                                  contentType: false, // NEEDED, DON'T OMIT THIS (requires jQuery 1.6+)
                                  processData: false, // NEEDED, DON'T OMIT THIS
                                  headers: {
                                    "x-csrf-token": $("[name=_csrf]").val()
                                  }
                                });

                                // If successful returns a temp path to serve quickly the passport which
                                // it will be self-destructed in 60 approx and serve an immutable path to
                                // retrieve the public access for the patient passporrt using an IPFS gateway
                                request.done(function(obj) {
                                  // display the a valid animation for the step 3
                                  $("#loader3").toggle();
                                  $("#valid3").toggle();

                                  // after 1 second
                                  setTimeout(() => {
                                    // switch the view for the passport access screen
                                    $("#loader").fadeToggle();
                                    $("#passportView").fadeToggle();

                                    // display the public key of the patient passport
                                    $("#passportQR").attr(
                                      "src",
                                      "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://ipfs.io/ipfs/" +
                                        obj.hash
                                    );

                                    // set the path for a temporary quick access fo the patient's passport
                                    $("#viewQR").attr(
                                      "href",
                                      "/temp/" + obj.path
                                    );

                                    // create a link to download the patient's passport public key as a QR image
                                    $("#downloadQrCode").on(
                                      "click",
                                      function() {
                                        document.getElementById(
                                          "download_gateway"
                                        ).src =
                                          "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://ipfs.io/ipfs/" +
                                          obj.hash;
                                      }
                                    );

                                    // set the immutable path to serve the patient's passport using an IPFS gateway
                                    $("#linkQR").attr(
                                      "href",
                                      "https://ipfs.io/ipfs/" + obj.hash
                                    );
                                  }, 1000);
                                });

                                // If error display the error message and switch the view
                                request.fail(function(jqXHR, textStatus) {
                                  console.log(textStatus, jqXHR);

                                  // switch the view
                                  $("#loader").fadeToggle();
                                  $("#createPass").fadeToggle();
                                });
                              }, 1000);
                            }
                          );
                        });

                        // If error display the error message and switch the view
                        request.fail(function(jqXHR, textStatus) {
                          console.log(textStatus, jqXHR);

                          // switch the view
                          $("#loader").fadeToggle();
                          $("#createPass").fadeToggle();
                        });
                      }
                    });

                    // If error display the error message and switch the view
                    request.fail(function(jqXHR, textStatus) {
                      console.log(textStatus, jqXHR);

                      // switch the view
                      $("#loader").fadeToggle();
                      $("#createPass").fadeToggle();
                    });

                    request.fail(function(jqXHR, textStatus) {
                      console.log(textStatus, jqXHR);
                      $("#loader").fadeToggle();
                      $("#createPass").fadeToggle();
                    });

                    // if the message was not successfully signed
                  } else {
                    // return an error notification
                    toast("error", "Sorry, We could not get your signature");
                  }
                });

            // if the user did not check the requrired input checkboxes
          } else {
            // return an error notification
            toast(
              "error",
              "Confirm the required checkbox are marked and make sure the patient has typed a password"
            );
          }
        });
      },
      { "webln/lib/client": 1 }
    ]
  },
  {},
  [2]
);

/*
|--------------------------------------------------------------------------
|                              HELPER    FUNCTIONS
|--------------------------------------------------------------------------
*/

// function to serve the lightning payment gateway
function showPR(result, pr, invoiceRoute, prString) {
  // serve the qr code image
  $(pr).attr(
    "src",
    "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + result.pr
  );
  // create link to open wallet and pay the invoice request automatically
  $(invoiceRoute).prop("href", "lightning:" + result.pr);
  // Show invoice request as string
  $(prString).val(result.pr);

  // set the request to be only readable
  $(prString).prop("readonly", true);
}

// function to copy the lightning payment request
function copyInvoice(prString, copyBtn) {
  // when clicking on the copy buttton
  $(copyBtn).on("click", function() {
    /* Get the selected text field */
    $(prString).select();
    /* Copy the text inside the text field */
    document.execCommand("copy");
    // show notification state
    toast("success", "Invoice Request copied to clipboard");
  });
}

// function to get the date object in a convinient string format
function formatDate(date) {
  var monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  var hours = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();

  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();

  return (
    day +
    " of " +
    monthNames[monthIndex] +
    " of " +
    year +
    " at " +
    hours +
    ":" +
    minutes +
    ":" +
    seconds
  );
}
