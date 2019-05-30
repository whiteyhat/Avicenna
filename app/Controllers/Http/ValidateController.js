'use strict'

const axios = require('axios');
const sha256 = require('hash.js/lib/hash/sha/256');


class ValidateController {

    async validate({ request, response }) {
        const { uuid, authtoken, filehash } = request.all()

        let res = {
            message: '',
            satellite: {
                txFound: false,
                isPaid: false,
            },
            ipfs: {
                isSha256Ok: false
            }
        }

        const result = await axios.get(`https://api.blockstream.space/order/${uuid}`, {
            headers: {
                'X-Auth-Token': authtoken
            },
            validateStatus: function (status) {
                return true;
            },
        })

        const data = result.data
        res.message = data.message

        if (result.status !== 200) {
            res.message = data.errors[0].detail
            return response.status(200).send(res)
        }

        res.satellite.txFound = true

        if (data.status !== 'sent') {
            res.message = "Satellite tx not paid"
            return response.status(200).send(res)
        }

        res.satellite.isPaid = true

        const filehash256 = sha256().update(filehash).digest('hex')
        if (data.message_digest === filehash256) {
            res.ipfs.isSha256Ok = true
            res.message = 'Successfully validated'
        }

        return response.status(200).send(res)
    }

}

module.exports = ValidateController
