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

        // Get the request WebLN provider
        var requestProvider = require("webln/lib/client");

        // Instantiate the auth variable
        var auth;

        // When clickin on login
        $("#login").on("click", function() {

          // do http request to log in the user
          // send the user pubkey
          var request = $.ajax({
            url: "/api/v0/auth/login",
            data: {
              wallet: auth.node.pubkey
            },
            type: "post",
            headers: {
              "x-csrf-token": $("[name=_csrf]").val()
            },
            dataType: "json"
          });

          // If successful returns a nonce and prompts a digital signature using WebLN
          request.done(function(data) {

            // If there is a nonce from the response body
            if (data.nonce) {

              // Display a notification to the user
              toast(data.type, data.msg);

              // Prompt the WebLN provider to sign a digital signature 
              webln
                .signMessage(data.nonce, async success => {})
                .then(function(data) {

                  // When the user has signed a message
                  if (data) {

                    // do a http request to get the verification
                    // to authenticate the source of the pubkey
                    // has an identical match with the initial
                    // pubkey sent by the user
                    var request = $.ajax({
                      url: "/api/v0/auth/verify-signature",
                      type: "post",
                      data: {
                        wallet: auth.node.pubkey,
                        signature: data.signature
                      },
                      headers: {
                        "x-csrf-token": $("[name=_csrf]").val()
                      },
                      dataType: "json"
                    });

                    // If successful display a message from the backend and refresh the page
                    request.done(function(data) {
                      if (data.msg) {
                        toast(data.type, data.msg);
                      }
                      setTimeout(() => {
                         location.reload()
                      }, 800);
                    });


                    // If error display the error message
                    request.fail(function (jqXHR, textStatus) {
                      console.log(jqXHR, textStatus)
                    });
                  }
                });
            }
          });
          // If error display the error message
          request.fail(function (jqXHR, textStatus) {
            console.log(jqXHR, textStatus)
          });
        });

        // When clicking on the 'start as a doctor' button
        $("#start-doctor").on("click", async function() {

          // Display the user button with a loading animation and disabled
          $("#doctor-loader").toggle()
          $('#start-doctor').attr('disabled', true);

          // Instantiate the WebLN instance
          let webln;
          try {

            // Get the WebLN instance from the request provider
            webln = await requestProvider.requestProvider();
          } catch (err) {
            // Handle users without WebLN
            toast(
              "error",
              "Download the extension of Lightning Joule to connect your lightning node <a href='https://lightningjoule.com/'><button type='button' id='okBtn' class='nes-btn -btn-primary'>Install</button></a>"
            );
          }
          // Elsewhere in the code...
          if (webln) {
            // Call webln function
            auth = await webln.getInfo();

            // Get the pubkey from the user WebLN provider
            if (auth.node.pubkey) {
              
              // do htttp request to send the user pubkey to the backend
              var request = $.ajax({
                url: "/api/v0/demo/doctor",
                type: "post",
                data: {
                  wallet: auth.node.pubkey
                },
                headers: {
                  "x-csrf-token": $("[name=_csrf]").val()
                },
                dataType: "json"
              });

              // re-activate the doctor button
              $("#doctor-loader").toggle()
              $('#start-doctor').attr('disabled', false);

              // If successful display the login button and a message from the backend
              request.done(function(data) {
                $("#login").fadeIn();
                toast(data.type, data.msg);
              });

              // If error display the error message
              request.fail(function(data1, data2) {
                console.log(data1, data2)
              });
            }
          }
        });

          // When clicking on the 'start as a doctor' button
        $("#start-admin").on("click", async function() {

          // Display the user button with a loading animation and disabled
          $("#admin-loader").toggle()
          $('#start-admin').attr('disabled', true);

          // Instantiate the WebLN instance
          let webln;

          try {

            // Get the WebLN instance from the request provider
            webln = await requestProvider.requestProvider();
          } catch (err) {
            // Handle users without WebLN
            toast(
              "error",
              "Download the extension of Lightning Joule to connect your lightning node <a href='https://lightningjoule.com/'><button type='button' id='okBtn' class='nes-btn -btn-primary'>Install</button></a>"
            );
          }
          // Elsewhere in the code...
          if (webln) {
            // Call webln function
            auth = await webln.getInfo();

            // Get the pubkey from the user WebLN provider
            if (auth.node.pubkey) {
              var request = $.ajax({
                url: "/api/v0/demo/admin",
                type: "post",
                data: {
                  wallet: auth.node.pubkey
                },
                headers: {
                  "x-csrf-token": $("[name=_csrf]").val()
                },
                dataType: "json"
              });

              // re-activate the doctor button
              $("#admin-loader").toggle()
              $('#start-admin').attr('disabled', false);

              // If successful display the login button and a message from the backend
              request.done(function(data) {
                $("#login").fadeIn();
                toast(data.type, data.msg);
              });

              // If error display the error message
              request.fail(function(data1, data2) {
                console.log(data1, data2)
              });
            }
          }
        });
      },
      { "webln/lib/client": 1 }
    ]
  },
  {},
  [2]
);