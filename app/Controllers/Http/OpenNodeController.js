/**
Copyright 2019 Carlos Roldan Torregrosa

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
"use strict";

const axios = require("axios");
const PaymentService = use("App/Services/PaymentService")

/**
Class to perform webhook opennode
 */
class OpenNodeController {

    async opentimestampsInvoicePaid({ request, response }) {
        const { status } = request.all();
        if (status == 'paid') {
            PaymentService.openTimestamp(request.all())
        }
        return response.status(200).send('succeed')
    }

    async satelliteInvoicePaid({ request, response }) {
        const { status } = request.all();
        if (status == 'paid') {
            PaymentService.satellite(request.all())
        }
        return response.status(200).send('succeed')
    }

}

module.exports = OpenNodeController;
