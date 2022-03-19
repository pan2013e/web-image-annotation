let express = require('express');
let tables = require('../mongodb');
let router = express.Router();
let axios = require('axios');
let token = require('../token');
let captcha_secret = require('../config/env').captcha.secret;

router.get('/list', async (req, res, next) => {
    try {
        let ret = await tables.login_info.find({});
        res.send(ret);
    } catch (err) {
        next(err);
    }
});

router.post('/login', async (req, res, next) => {
    try {
        var params = req.body;
        let ret = await tables.login_info.find({ uname: params.username });
        if (!ret.length) {
            res.send({ value: -1, err: '用户名不存在', hash: '', token: '' })
        } else{
            let tok = token.create({ uid: ret[0]._id});
            res.send({ value: 0, err: '', hash: ret[0].passwd, token: tok });
        }
    } catch (err) {
        res.send({ value: -1, err: err, hash: '', token: '' });
        next(err);
    }
});

router.post('/captcha',async (req, res, next) => {
    try {
        await axios.get('https://recaptcha.net/recaptcha/api/siteverify', {
            params: {
                secret: captcha_secret,
                response: req.body.code
            }
        }).then((gres)=>{
            res.send({ success: gres.data.success });
        }).catch((err) => {
            res.send({ success: false });
            next(err);
        })
    } catch (err) {
        next(err);
    }
});

router.post('/register', async (req, res, next) => {
    try {
        var params = req.body;
        let check = await tables.login_info.find({ uname: params.username });
        if (check.length) {
            res.send({ value: -1, err: '用户名已经存在' });
            return;
        }
        await tables.login_info.create({
            uname: params.username,
            email: params.email,
            passwd: params.passwd
        }, (err, docs) => {
            if (err) {
                res.send({ value: -1, err: err });
            } else {
                res.send({ value: 0, err: '' });
            }
        });
    } catch (err) {
        res.send({ value: -1, err: err });
        next(err);
    }
});

router.post('/verify', async (req, res, next) => {
    try {
        var params = req.body;
        if (params.token === undefined || params.token  === '') {
            res.sendStatus(401).end();
        } else if (token.verify(params.token)) {
            res.sendStatus(200).end();
        } else {
            res.sendStatus(403).end();
        };
    } catch (err) {
        res.sendStatus(500).end();
        next(err);
    }
});

module.exports = router;