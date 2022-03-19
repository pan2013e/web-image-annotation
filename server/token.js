let jwt = require('jsonwebtoken');
let secret = require('./config/env').token.secret;
let option = require('./config/env').token.option;

module.exports = {
    create: (data) => {
        return jwt.sign(data, secret, option);
    },
    verify: (token) => {
        var res;
        jwt.verify(token, secret, (err, decoded) => {
            res = err ? false : true;
        });
        return res;
    }
};