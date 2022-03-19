let express = require('express');
let router = express.Router();
let multer = require('multer');
let COS = require('cos-nodejs-sdk-v5');
let cos = new COS(require('../config/env').oss.TencentCloud);
let uuidV1 = require('uuid/v1');
let ffmpeg = require('ffmpeg');
let path = require('path');
let base = require('../config/env').server.baseurl;
let { region, bucket } = require('../config/env').oss;

let oss_enable = require('../config/env').oss.enable;
let local_image_base_url = require('../config/env').server.baseurl + '/static/image/';

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.resolve(__dirname, '../public/uploads'));
    },
    filename: (req, file, cb) => {
        const fmt = file.originalname.split('.');
        cb(null, uuidV1() + '.' + fmt[fmt.length - 1]);
    }
});
var upload = multer({ storage: storage });

router.post('/upload/pic', upload.single('file'), async (req, res, next) => {
    try {
        if(oss_enable){
            await cos.uploadFile({
                Bucket: bucket,
                Region: region,
                Key: 'uploads/' + req.file.filename,
                FilePath: req.file.path,
                onFileFinish: function (err, data, options) {
                    console.log('[INFO] ' + options.Key + '上传' + (err ? '失败' : '完成'));
                },
            }, (err, data) => {
                if (err) res.send({ value: -1, err: err });
                else {
                    res.send({ value: 0, file: `${base}/static/oss/${encodeURIComponent(data.Location)}`, name: req.file.originalname });
                }
            });
        } else {
            await res.send({ value: 0, file: local_image_base_url + req.file.filename , name: req.file.originalname });
        }
    } catch (err) {
        res.send({ value: -1, err: err });
        next(err);
    }
});

router.post('/upload/video', upload.single('file'), async (req, res, next) => {
    try {
        let save_path = `../public/uploads/${path.parse(req.file.filename).name}/`;
        await new ffmpeg(req.file.path).then((video) => {
            video.fnExtractFrameToJPG(path.resolve(__dirname, save_path), {
                every_n_frames: 30,
            }, (err, arr) => {
                let video_name = req.file.originalname;
                let name_pre = video_name.substring(0, video_name.indexOf("."));
                let video_arr = [];
                let name = [];
                let oss_upload_list = [];
                for(let i=0;i<arr.length;i++){
                    name.push(`${name_pre}_${i}${path.parse(arr[i]).ext}`);
                    if (oss_enable) {
                        oss_upload_list.push({
                            Bucket: bucket,
                            Region: region,
                            Key: 'uploads/' + path.parse(arr[i]).base,
                            FilePath: path.resolve(__dirname, '../public/uploads', `${path.parse(req.file.filename).name}/` + path.parse(arr[i]).base),
                        });
                    } else {
                        video_arr.push(local_image_base_url + `${path.parse(req.file.filename).name}/` + path.parse(arr[i]).base);
                    }
                }
                if (oss_enable) {
                    cos.uploadFiles({
                        files: oss_upload_list,
                        SliceSize: 10*1024*1024,
                        onFileFinish: function (err, data, options) {
                            console.log('[INFO] ' + options.Key + '上传' + (err ? '失败' : '完成'));
                        },
                    }, (err, data) => {
                        if (err) throw err;
                        else {
                            let oss_video_arr = [];
                            for (let k = 0; k < data.files.length; k++){
                                oss_video_arr.push(`${base}/static/oss/${encodeURIComponent(data.files[k].data.Location)}`)
                            }
                            res.send({ value: 0, file: oss_video_arr, name: name });
                        }
                    });
                } else {
                    res.send({ value: 0, file: video_arr, name: name });
                }
            });
        }).catch((err) => {
            res.send({ value: -1, err: err });
        });
    } catch (err) {
        res.send({ value: -1, err: err });
        next(err);
    }
});

module.exports = router;