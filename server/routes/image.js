let express = require('express');
let tables = require('../mongodb');
let router = express.Router();

router.get('/image', async (req, res, next) => {
    try {
        let ret = await tables.image.find({});
        res.send(ret);
    } catch (err) {
        next(err);
    }
});

router.post('/image', async (req, res, next) => {
    try {
        let params = req.body;
        var new_pid;
        var cnt = 0;
        while(1) {
            cnt++;
            if(cnt > 65536){
                res.send({ value: -1, err: '个数超过限制' });
            }
            var rand = Math.round(Math.random()*65536); 
            var uname = params.uname;
            var rand_pid = `${uname}_${rand}`
            let check = await tables.image.find({ pid: rand_pid });
            if(!check.length){
                new_pid = rand_pid;
                break;
            }
        }
        await tables.image.create({
            pid: new_pid,
            src: params.file,
            original_name: params.file_name
        }, (err, docs) => {
            if (err) {
                res.send({ value: -1, err: err });
            } else {
                res.send({ value: 0, err: '', pid: new_pid });
            }
        });
    } catch (err) {
        res.send({ value: -1, err: err });
        next(err);
    }
});

router.get('/image/pid/:pid', async (req, res, next) => {
    try {
        let params = req.params;
        let ret = await tables.image.find({ pid: params.pid });
        res.send(ret);
    } catch (err) {
        next(err);
    }
});

router.put('/image/pid/:pid', async (req, res, next) => {
    try {
        var changes = {};
        if(req.body.res != null && req.body.res != []){
            changes.res = req.body.res;
        }
        if(req.body.res_url != null && req.body.res_url != []){
            changes.res_url = req.body.res_url;
        }
        await tables.image.updateOne({ pid : req.params.pid }, { $set: changes });
        res.send({ value: 0, err: '' });
    } catch (err) {
        res.send({ value: -1, err: err });
        next(err);
    }
});

router.get('/image/tid/:tid', async (req, res, next) => {
    try {
        let params = req.params;
        let ret = await tables.task.find({ tid: params.tid });
        if (ret.length) {
            pid = ret[0].pid;
            let img = await tables.image.find({ pid: pid });
            res.send({ value: 0, img: img });
        } else {
            res.send({ value:0, img: [] });
        }
    } catch (err) {
        res.send({ value: -1, err: err });
        next(err);
    }
});

router.get('/image/plist', async (req, res, next) => {
    try {
        let plist = req.query.plist;
        var img_list = [];
        for(var item in plist){
            if(item === '' || item === null){
                img_list.push([]);
            } else {
                let ret = await tables.image.find({ pid: plist[item] });
                if(ret.length) {
                    img_list.push(ret[0].src);
                } else {
                    img_list.push([]);
                }
            }
        }
        res.send({ value: 0, img: img_list });
    } catch (err) {
        res.send({ value: -1, err: err });
        next(err);
    }
});

module.exports = router;