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
        var requestProvider = require("webln/lib/client");
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
        var conditionArray = [];
        var allergyArray = [];
        var immunisationArray = [];
        var medicationArray = [];
        var image = "";
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

          //Wizard
          $('a[data-toggle="tab"]').on("show.bs.tab", function(e) {
            var $target = $(e.target);

            if ($target.parent().hasClass("disabled")) {
              return false;
            }
          });

          $(".next-step").click(function(e) {
            var $active = $(".wizard .nav-tabs li.active");
            $active.next().removeClass("disabled");
            nextTab($active);
          });
          $(".prev-step").click(function(e) {
            var $active = $(".wizard .nav-tabs li.active");
            prevTab($active);
          });
        });

        function nextTab(elem) {
          $(elem)
            .next()
            .find('a[data-toggle="tab"]')
            .click();
        }

        function prevTab(elem) {
          $(elem)
            .prev()
            .find('a[data-toggle="tab"]')
            .click();
        }
        $("#add-condition").on("click", async function() {
          report = {
            condition: $("#condition").val(),
            year: $("#year").val(),
            notes: $("#condition-notes").val()
          };

          conditionArray.push(report);
          conditionCounter++;
          console.log(conditionArray);

          $("#conditionblock").append(
            '<div class="input-group input-group-sm"><span class="input-group-addon"><b>Condition</b></span><input disabled value="' +
              report.condition +
              '" type="text" class="form-control"aria-describedby="sizing-addon1"><span class="input-group-addon" id="sizing-addon1"><b>Year</b></span><input value="' +
              report.year +
              '" disabled type="text" class="form-control"aria-describedby="sizing-addon1"></div><br><div class="form-group"><label for="exampleFormControlTextarea1" class="text-muted">Additional Notes</label><textarea class="form-control" disabled rows="3">' +
              report.notes +
              "</textarea></div><legend></legend>"
          );

          $("#condition").val("");
          $("#year").val("");
          $("#condition-notes").val("");
          toast("info", "New condition added");
        });

        $("#add-allergy").on("click", function() {
          let risk = "No";
          if ($("#risk").is(":checked")) {
            risk = "Yes";
          }

          allergy = {
            name: $("#allergy-name").val(),
            risk: risk,
            notes: $("#allergy-notes").val()
          };

          allergyArray.push(allergy);
          allergyCounter++;
          console.log(allergy);

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
          toast("info", "New allergy added");
          $("#allergy-name").val("");
          $("#allergy-notes").val("");
          $("#risk").prop("checked", false);
        });

        $("#add-immunisation").on("click", function() {
          immunisation = {
            name: $("#immunisation-name").val(),
            year: $("#immunisation-date").val()
          };
          immunisationArray.push(immunisation);
          immunisationCounter++;
          console.log(immunisationArray);
          $("#immunisationblock").append(
            '<div class="input-group input-group-sm"><span class="input-group-addon" id="sizing-addon1"><b>Allergy</b></span><input  disabled value="' +
              immunisation.name +
              '" type="text" class="form-control"aria-describedby="sizing-addon1"><span class="input-group-addon" id="sizing-addon1"><b>Date</b></span><input value="' +
              immunisation.year +
              '" disabled type="text" class="form-control"aria-describedby="sizing-addon1"></div><legend></legend>'
          );

          $("#immunisation-name").val("");
          $("#immunisation-date").val("");
          toast("info", "New immunisation added");
        });
        $("#save1").on("click", async function() {
          let webln;
          try {
            webln = await requestProvider.requestProvider();
          } catch (err) {
            // Handle users without WebLN
            toast(
              "error",
              "Download the extension of Lightning Joule to connect your lightning node <a href='https://lightningjoule.com/'><button type='button' id='okBtn' class='nes-btn -btn-primary'>Install</button></a>"
            );
          }

          let gender = null;
          if ($("#male").is(":checked")) {
            gender = "male";
          } else {
            gender = "female";
          }

          patient = {
            dna: $("#DNA").val(),
            blood: $("#blood").val(),
            name: $("#name").val(),
            dob: $("#dob").val(),
            gender: gender
          };
          console.log(patient);
          toast("success", "Patient personal details saved");
        });

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

        $("#save2").on("click", function() {
          let mobility = null;
          if ($("#mobility-independent").is(":checked")) {
            mobility = "independent";
          } else if ($("#mobility-help").is(":checked")) {
            mobility = "some help";
          } else {
            mobility = "dependent";
          }

          let eating = null;
          if ($("#eating-independent").is(":checked")) {
            eating = "independent";
          } else if ($("#eating-help").is(":checked")) {
            eating = "some help";
          } else {
            eating = "dependent";
          }

          let dressing = null;
          if ($("#dressing-independent").is(":checked")) {
            dressing = "independent";
          } else if ($("#dressing-help").is(":checked")) {
            dressing = "some help";
          } else {
            dressing = "dependent";
          }

          let toileting = null;
          if ($("#toileting-independent").is(":checked")) {
            toileting = "independent";
          } else if ($("#toileting-help").is(":checked")) {
            toileting = "some help";
          } else {
            toileting = "dependent";
          }

          let washing = null;
          if ($("#washing-independent").is(":checked")) {
            washing = "independent";
          } else if ($("#washing-help").is(":checked")) {
            washing = "some help";
          } else {
            washing = "dependent";
          }

          social = {
            mobility,
            eating,
            dressing,
            toileting,
            washing,
            activity: $("#social-activity").val(),
            behaviour: $("#social-behaviour").val()
          };

          console.log(social);
          toast("success", "Patient medical report saved");
        });

        $("#add-medication").on("click", async function() {
          let monday = "No";
          let tuesday = "No";
          let wednesday = "No";
          let thursday = "No";
          let friday = "No";
          let saturday = "No";
          let sunday = "No";

          let dates = [];

          if ($("#monday").is(":checked")) {
            dates.push(" Monday");
            monday = "Yes";
          }
          if ($("#tuesday").is(":checked")) {
            dates.push(" Tuesday");
            tuesday = "Yes";
          }
          if ($("#wednesday").is(":checked")) {
            dates.push(" Wednesday");
            wednesday = "Yes";
          }
          if ($("#thursday").is(":checked")) {
            dates.push(" Thursday");
            thursday = "Yes";
          }
          if ($("#friday").is(":checked")) {
            dates.push(" Friday");
            friday = "Yes";
          }
          if ($("#saturday").is(":checked")) {
            dates.push(" Saturday");
            saturday = "Yes";
          }
          if ($("#sunday").is(":checked")) {
            dates.push(" Sunday");
            sunday = "Yes";
          }

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

          medicationArray.push(medication);
          console.log(medication);

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

          toast("info", "New medication prescribed");
        });

        $("#save3").on("click", function() {
          toast("success", "Patient medication saved");
        });

        $("#save4").on("click", function() {
          var check1 = $('input[name="reg1"]:checked').length > 0;
          var check2 = $('input[name="reg2"]:checked').length > 0;
          var check3 = $('input[name="reg3"]:checked').length > 0;
          var pass = $("#encryptPassword").val();

          if (check1 && check2 && check3 && pass != undefined) {

            if ($("input[name='satellite']").val() === "true") {
                $("#loading_text").text("Linking IPFS to Blockstream Satellite");
                $("#modal_title").text("Upload to Blockstream Satellite");
            }else{
                $("#loading_text").text("Certifying using Open Time Stamps");
                $("#modal_title").text("Certify Passport using Open Time Stamps");
            }
            $("#loader").fadeToggle();
            $("#createPass").fadeToggle();

            const message =
              "As a " +
              $("[name=doctorRole]").val() +
              " of the " +
              $("[name=doctorClinic]").val() +
              ", I can confirm that the accuracy of this medical record is my responsibility and/or " +
              $("[name=doctorClinic]").val() +
              "'s responsibility. This medical record is confidential and belongs uniquely to " +
              patient.name +
              " or his/her or legal guardian. This data has been encrypted with a password provided by " +
              patient.name +
              " or his/her legal guardian. \n\n Me, " +
              $("[name=doctorName]").val() +
              ", I agree with these terms and use my public keys from my bitcoin wallet to sign this legitimate document, today, " +
              formatDate(new Date()) +
              ".";

            webln
              .signMessage(message, async success => {})
              .then(function(signature) {
                if (signature) {
                  toast(
                    "info",
                    "Encrypting and uploading patient passport to IPFS"
                  );
                  const formData = new FormData();
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

                  request.done(function(data) {
                    $("#loader1").toggle();
                    $("#valid1").toggle();

                    const ipfsHash = data.hash;
                    const filename = data.filename;

                    toast(
                      "info",
                      "Passport encrypted and uploaded to IPFS with the following hash: " +
                        ipfsHash +
                        ". <br><a href='https://ipfs.io/ipfs/" +
                        ipfsHash +
                        "' target='_blank''><button type='button'class='btn btn-default'>Open</button></a>"
                    );

                    formData.append("ipfshash", JSON.stringify(ipfsHash));
                    formData.append("filename", JSON.stringify(filename));
                    formData.append(
                      "socket",
                      JSON.stringify($("[name=_connId]").val())
                    );


                    if ($("input[name='satellite']").val() === "true") {
                                            
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

                      request.done(function(result) {
                        setTimeout(function() {
                          toast(
                            "info",
                            "Uploading IPFS Passport to the Blockstream Satellite"
                          );

                          showPR(result, "#pr", "#invoiceRoute", "#pr-string");

                          // Event handler to copy the invoice request when click the button copy
                          copyInvoice("#pr-string", "#copy-invoice");
                          $("#sats").text("15 sats");
                          $("#payreq").modal("show");

                          ws.getSubscription("invoice").on(
                            "invoicePaid",
                            blockstream => {
                              formData.append(
                                "uuid",
                                JSON.stringify(blockstream.uuid)
                              );
                              formData.append(
                                "authToken",
                                JSON.stringify(blockstream.authToken)
                              );

                              toast(
                                "success",
                                "Passport uploaded to Blockstream Satellite"
                              );
                              $("#payreq").modal("hide");
                              $("#loader2").toggle();
                              $("#valid2").toggle();

                              toast(
                                "info",
                                "Generating a Passport certification"
                              );
                              setTimeout(() => {
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

                                request.done(function(obj) {
                                  $("#loader3").toggle();
                                  $("#valid3").toggle();

                                  setTimeout(() => {
                                    $("#loader").fadeToggle();
                                    $("#passportView").fadeToggle();
                                    $("#passportQR").attr(
                                      "src",
                                      "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://ipfs.io/ipfs/" +
                                        obj.hash
                                    );
                                    $("#viewQR").attr(
                                      "href",
                                      "/temp/" + obj.path
                                    );

                                    $("#downloadQrCode").on("click", function() {document.getElementById("download_gateway").src = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://ipfs.io/ipfs/" + obj.hash;
                                    });

                                    $("#linkQR").attr(
                                      "href",
                                      "https://ipfs.io/ipfs/" + obj.hash
                                    );
                                  }, 1000);
                                });

                                request.fail(function(jqXHR, textStatus) {
                                  console.log(textStatus, jqXHR);
                                  $("#loader").fadeToggle();
                                  $("#createPass").fadeToggle();
                                });
                              }, 1000);
                            }
                          );
                        }, 2000);
                      });

                      request.fail(function(jqXHR, textStatus) {
                        console.log(textStatus, jqXHR);
                        $("#loader").fadeToggle();
                        $("#createPass").fadeToggle();
                      });
                    } else {
                      $("#loading_text").text("Linking IPFS to Blockstream Satellite");
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

                      request.done(function(result) {
                        setTimeout(function() {
                          setTimeout(() => {
                            toast(
                              "info",
                              "Pay 5 satoshis to certify the passport using Open Time Stamps"
                            );
                          }, 1750);

                          showPR(result, "#pr", "#invoiceRoute", "#pr-string");

                          // Event handler to copy the invoice request when click the button copy
                          copyInvoice("#pr-string", "#copy-invoice");
                          $("#sats").text("5 sats");
                          $("#payreq").modal("show");
                          
                          }, 2000);

                          ws.getSubscription("invoice").on(
                            "invoicePaid",
                            ots => {
                              formData.append(
                                "verification",
                                JSON.stringify(ots.verificationIpfsPath)
                              );

                              toast(
                                "success",
                                "Passport certified using Open Time Stamps"
                              );
                              $("#payreq").modal("hide");
                              $("#loader2").toggle();
                              $("#valid2").toggle();

                              toast(
                                "info",
                                "Passport certified using Open Time Stamps accessible using an IPFS gateway. " +
                                  "<br><a href='https://ipfs.io/ipfs/" +
                                  ots.verificationIpfsPath +
                                  "' target='_blank''><button type='button'class='btn btn-default'>Open</button></a>"
                              );

                              document.getElementById("download_gateway").src =
                                ots.verification;

                              setTimeout(() => {
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

                                request.done(function(obj) {
                                  $("#loader3").toggle();
                                  $("#valid3").toggle();

                                  setTimeout(() => {
                                    $("#loader").fadeToggle();
                                    $("#passportView").fadeToggle();
                                    $("#passportQR").attr(
                                      "src",
                                      "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://ipfs.io/ipfs/" +
                                        obj.hash
                                    );
                                    $("#viewQR").attr(
                                      "href",
                                      "/temp/" + obj.path
                                    );

                                    $("#downloadQrCode").on("click", function() {document.getElementById("download_gateway").src = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://ipfs.io/ipfs/" + obj.hash;
                                    });

                                    $("#linkQR").attr(
                                      "href",
                                      "https://ipfs.io/ipfs/" + obj.hash
                                    );
                                  }, 1000);
                                });

                                request.fail(function(jqXHR, textStatus) {
                                  console.log(textStatus, jqXHR);
                                  $("#loader").fadeToggle();
                                  $("#createPass").fadeToggle();
                                });
                              }, 1000);
                            }
                          );
                      });

                      request.fail(function(jqXHR, textStatus) {
                        console.log(textStatus, jqXHR);
                        $("#loader").fadeToggle();
                        $("#createPass").fadeToggle();
                      });
                    }
                  });
                  request.fail(function(jqXHR, textStatus) {
                    console.log(textStatus, jqXHR);
                    $("#loader").fadeToggle();
                    $("#createPass").fadeToggle();
                  });

                  request.fail(function(jqXHR, textStatus) {
                    console.log(textStatus, jqXHR);
                    $("#loader").fadeToggle();
                    $("#createPass").fadeToggle();
                  });
                } else {
                  toast("error", "Sorry, We could not get your signature");
                  $("#loader").fadeToggle();
                  $("#createPass").fadeToggle();
                }
              });
          } else {
            toast(
              "error",
              "Confirm the required checkbox are marked and make sure the patient has typed a password"
            );
          }
        });

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
      },
      { "webln/lib/client": 1 }
    ]
  },
  {},
  [2]
);

function showPR(result, pr, invoiceRoute, prString) {
  $(pr).attr(
    "src",
    "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + result.pr
  );
  // create link to open wallet and pay the invoice request automatically
  $(invoiceRoute).prop("href", "lightning:" + result.pr);
  // Show invoice request as string
  $(prString).val(result.pr);
  $(prString).prop("readonly", true);
}

function copyInvoice(prString, copyBtn) {
  $(copyBtn).on("click", function() {
    /* Get the selected text field */
    $(prString).select();
    /* Copy the text inside the text field */
    document.execCommand("copy");
    // show notification state
    toast("success", "Invoice Request copied to clipboard");
  });
}

function AnimateProgressbar(timetopay) {
  var start = new Date();
  var maxTime = 3000 * 60;
  var timeoutVal = Math.floor(maxTime / 100);
  animateUpdate();

  function updateProgress(percentage) {
    $(timetopay).val(percentage);
  }

  function animateUpdate() {
    var now = new Date();
    var timeDiff = now.getTime() - start.getTime();
    var perc = Math.round((timeDiff / maxTime) * 100);
    if (perc <= 100) {
      updateProgress(perc);
      setTimeout(animateUpdate, timeoutVal);
    }
    if (perc == 75) {
      toast("warning", "Invoice expiring soon");
    } else if (perc == 100) {
      toast("error", "Invoice Expired");
    }
  }
}
