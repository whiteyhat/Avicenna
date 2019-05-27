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
        let auth;

        $("#login").on("click", function() {
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

          request.done(function(data) {
            if (data.nonce) {
              toast(data.type, data.msg);
              webln
                .signMessage(data.nonce, async success => {})
                .then(function(data) {
                  if (data) {
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
                    request.done(function(data) {
                      if (data.msg) {
                        toast(data.type, data.msg);
                      }
                      setTimeout(() => {
                         location.reload()
                      }, 800);
                    });
                    request.fail(function(data) {
                      toast("success", data.msg);
                      setTimeout(function() {
                        window.location.replace('/');
                      }, 600);
                    });
                  }
                });
            }
          });
          request.fail(function(data) {
            toast("success", data.msg);
            setTimeout(function() {
              window.location.replace('/');
            }, 600);
          });
        });

        $("#start-doctor").on("click", async function() {
          $("#doctor-loader").toggle()
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
          // Elsewhere in the code...
          if (webln) {
            // Call webln function
            auth = await webln.getInfo();

            if (auth.node.pubkey) {
              $("#doctor-loader").toggle()
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
              request.done(function(data) {
                $("#login").fadeIn();
                toast(data.type, data.msg);
              });
              request.fail(function(data) {
                toast("success", data.msg);
                setTimeout(function() {
                  // window.location.replace('/');
                }, 600);
              });
            }
          }
        });

        $("#start-admin").on("click", async function() {
          $("#admin-loader").toggle()
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
          // Elsewhere in the code...
          if (webln) {
            // Call webln function
            auth = await webln.getInfo();

            if (auth.node.pubkey) {
              $("#admin-loader").toggle()
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
              request.done(function(data) {
                $("#login").fadeIn();
                toast(data.type, data.msg);
              });
              request.fail(function(data) {
                toast("success", data.msg);
                setTimeout(function() {
                  // window.location.replace('/');
                }, 600);
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