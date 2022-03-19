let express = require('express');
let tables = require('../mongodb');
let router = express.Router();
let qr = require('qr-image');
let path = require('path');
let fs = require('fs');
let { XMLBuilder } = require('fast-xml-parser');
let compressing = require('compressing');

let builder = new XMLBuilder({
    format: true,
    attrNodeName: "_attrs",
    textNodeName: "#text",
    cdataTagName: "_cdata"
});

let zip = compressing.zip;


// GET /api/task
// List all tasks
router.get('/task', async (req, res, next) => {
    try {
        let ret = await tables.task.find({}).sort({ "created_at" : -1 });
        res.send(ret);
    } catch (err) {
        next(err);
    }
});

// POST /api/task
// Add a new task
router.post('/task', async (req, res, next) => {
    try {
        let params = req.body;
        var new_tid;
        var cnt=0;
        while(1) {
            cnt++;
            if(cnt > 65536){
                res.send({ value: -1, err: '任务个数超过限制' });
            }
            var rand = Math.round(Math.random()*65536); 
            var uname = params.uname;
            var rand_tid = `${uname}_${rand}`
            let check = await tables.task.find({ tid: rand_tid });
            if(!check.length){
                new_tid = rand_tid;
                break;
            }
        }
        await tables.task.create({
            tid: new_tid,
            uname: params.uname,
            title: params.title,
            desc: params.desc,
            pid: params.pid,
            credit: params.credit
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

// GET /api/task/{tid}
// Show information of a task according to its task_id
router.get('/task/tid/:tid', async (req, res, next) => {
    try {
        let params = req.params;
        let ret = await tables.task.find({ tid: params.tid });
        res.send(ret);
    } catch (err) {
        next(err);
    }
});

// GET /api/task/{uname}
// Show information of a set of tasks according to its username
router.get('/task/uname/:uname', async (req, res, next) => {
    try {
        let params = req.params;
        let ret = await tables.task.find({ uname: params.uname }).sort({ "created_at" : -1 });
        res.send(ret);
    } catch (err) {
        next(err);
    }
});

// GET /api/task/{uname_recv}
// Show information of a set of tasks according to its username
router.get('/task/uname_r/:uname_recv', async (req, res, next) => {
    try {
        let params = req.params;
        let ret = await tables.task.find({ uname_recv: params.uname_recv }).sort({ "created_at" : -1 });
        res.send(ret);
    } catch (err) {
        next(err);
    }
});

// PUT /api/task/{tid}
// Update a task, use task_id as index
router.put('/task/tid/:tid', async (req, res, next) => {
    try {
        var changes = {};
        if(req.body.state != ''){
            changes.state = req.body.state;
        }
        if(req.body.uname_recv != ''){
            changes.uname_recv = req.body.uname_recv;
        }
        if(req.body.advice != ''){
            changes.advice = req.body.advice;
        }
        await tables.task.updateOne({ tid : req.params.tid }, { $set: changes });
        res.send({ value: 0, err: '' });
    } catch (err) {
        res.send({ value: -1, err: err });
        next(err);
    }
});

// DELETE /api/task/{tid}
// Delete a task according to its task_id
router.delete('/task/tid/:tid', async (req, res, next) => {
    try {
        let params = req.params;
        await tables.task.deleteOne({ tid: params.tid });
        res.send({ value: 0, err: '' });
    } catch (err) {
        res.send({ value: -1, err: err });
        next(err);
    }
});

router.get('/export', async (req, res, next) => {
    try {
        let params = req.query;
        let name = params.dataset;
        let tid = params.tid;
        if(name === 'coco' || name === 'voc') {
            let temp = await tables.task.find({ tid: tid});
            if(!temp.length) {
                res.status(404).send('<h1>404 Not Found</h1><hr>The task_id requested does not exist.');
                return;
            }
            let img = await tables.image.find({ pid: temp[0].pid });
            let label = img[0].res.sort((a, b) => {
                return parseInt(a.idx) - parseInt(b.idx)
            });
            if(name === 'coco'){
                var coco_json = {
                    'info': {},
                    'licenses': [],
                    'images': [],
                    'annotations': [],
                    'categories': []
                };
                for(let i=0;i<img[0].src.length;i++){
                    let images_item = {
                    'file_name': img[0].original_name[i],
                    'url': img[0].src[i],
                    'id': i
                    };
                    coco_json['images'].push(images_item);
                }
                for(let i=0;i<label.length;i++){
                    var x = label[i].bbox[0];
                    var y = label[i].bbox[1];
                    var w = label[i].bbox[2] - x;
                    var h = label[i].bbox[3] - y;
                    var label_name = label[i].label;
                    var cat_id = -1;
                    for(let i=0;i<coco_json['categories'].length;i++){
                        if(coco_json['categories'][i].name == label_name){
                            cat_id = i;
                            break;
                        }
                    }
                    if(cat_id === -1){
                        coco_json['categories'].push({
                            'supercategory': label_name,
                            'id': coco_json['categories'].length + 1,
                            'name': label_name
                        });
                        cat_id = coco_json['categories'].length;
                    }
                    let anno = {
                        "segmentation": [ label[i].bbox ],
                        "area": w*h,
                        "iscrowd": 0,
                        "image_id": label[i].idx,
                        "bbox": [x,y,h,w],
                        "category_id": cat_id,
                        "id": i
                    }
                    coco_json['annotations'].push(anno);
                }
                let coco_loc = path.resolve(__dirname, `../public/exports/export_${tid}_coco.json`);
                res.set({
                    'Content-Type': 'application/octet-stream',
                    'Content-Disposition': 'attachment; filename=' + `export_${tid}_coco.json`,
                });
                fs.writeFileSync(coco_loc, JSON.stringify(coco_json,null,'\t'));
                let cs = fs.createReadStream(coco_loc);
                cs.on("data", (chunk) => {
                    res.write(chunk);
                });
                cs.on("end", () => {
                    res.status(200).end();
                });
                return;
            } else { // voc
                let voc_loc_prefix = path.resolve(__dirname, `../public/exports/export_${tid}_voc/Annotations`);
                try {
                    fs.accessSync(voc_loc_prefix, fs.constants.F_OK | fs.constants.W_OK | fs.constants.W_OK);
                } catch(err) {
                    fs.mkdirSync(voc_loc_prefix, {recursive: true});
                }
                for(let i=0;i<img[0].src.length;i++){
                    let voc_json = {
                        annotation: {
                            folder: {
                                "#text": `export_${tid}_voc`
                            },
                            filename: {
                                "#text": img[0].original_name[i]
                            },
                            source: {
                                "#text": ''
                            },
                            size: {
                                width: {
                                    "#text": 0
                                },
                                height: {
                                    "#text": 0
                                },
                                depth: {
                                    "#text": '3'
                                }
                            },
                            segmented: {
                                "#text": '1'
                            },
                            object: []
                        }
                    };
                    for(let j=0;j<label.length;j++){
                        if(label[j].idx == i){
                            voc_json.annotation.size.width['#text'] = label[j].width;
                            voc_json.annotation.size.height['#text'] = label[j].height;
                            var object_json = {
                                name: {
                                    "#text": label[j].label
                                },
                                pose: {
                                    "#text": "Unspecified"
                                },
                                truncated: {
                                    "#text": "0"
                                },
                                difficult: {
                                    "#text": "0"
                                },
                                bndbox: {
                                    xmin: {
                                        "#text": label[j].bbox[0]
                                    },
                                    ymin: {
                                        "#text": label[j].bbox[1]
                                    },
                                    xmax: {
                                        "#text": label[j].bbox[2]
                                    },
                                    ymax: {
                                        "#text": label[j].bbox[3]
                                    }
                                }
                            };
                            voc_json.annotation.object.push(object_json);
                        }
                    }
                    if(voc_json.annotation.object.length){
                        let json2xml = builder.build(voc_json);
                        json2xml = '<?xml version="1.0" encoding="utf-8"?>\n' + json2xml;
                        fs.writeFileSync(`${voc_loc_prefix}/${img[0].original_name[i]}.xml`, json2xml);
                    }
                }
                await zip.compressDir(path.resolve(__dirname, `../public/exports/export_${tid}_voc`),
                    path.resolve(__dirname, `../public/exports/export_${tid}_voc.zip`));
                res.set({
                    'Content-Type': 'application/octet-stream',
                    'Content-Disposition': 'attachment; filename=' + `export_${tid}_voc.zip`,
                });
                let cs = fs.createReadStream(path.resolve(__dirname, `../public/exports/export_${tid}_voc.zip`));
                cs.on("data", (chunk) => {
                    res.write(chunk);
                });
                cs.on("end", () => {
                    res.status(200).end();
                });
                return;
            }
        } else {
            res.status(404).send('<h1>404 Not Found</h1><hr>Invalid dataset name.');
        }
    } catch (err) {
        res.status(503).end();
        next(err);
    }
});

router.get('/qrcode', async (req, res, next) => {
    var text = decodeURI(req.query.text);
    try {
        var img = qr.image(text,{size :10});
        res.writeHead(200, {'Content-Type': 'image/png'});
        img.pipe(res);
    } catch (err) {
        res.writeHead(414, {'Content-Type': 'text/html'}).end('<h1>414 Request-URI Too Large</h1>');
        next(err);
    }
});

module.exports = router;