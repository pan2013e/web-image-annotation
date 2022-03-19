let express = require('express');
let router = express.Router();
let path = require('path');
let fs = require('fs');
let url = require('url');
let axios = require('axios');

let fullUrl = (req) => {
    return url.format({
      protocol: req.protocol,
      host: req.get('host'),
      pathname: req.originalUrl
    });
};

router.get('/image/:image', (req, res, next) => {
    try {
        let dst_img = path.resolve(__dirname, `../public/uploads/${req.params.image}`);
        fs.access(dst_img, fs.constants.F_OK | fs.constants.R_OK, (err) => {
            if(err) {
                res.setHeader('Content-Type', 'application/xml');
                res.status(404).send(
                    `<Error>
                        <Message>${err}</Message>
                        <Resource>${fullUrl(req)}</Resource>
                    </Error>`
                );
            } else {
                res.setHeader('Access-Control-Allow-Origin', '*');
                let cs = fs.createReadStream(dst_img);
                cs.on("data", (chunk) => {
                    res.write(chunk);
                });
                cs.on("end", () => {
                    res.status(200).end();
                });
            }
        })
    } catch(err) {
        res.status(503).send('<h1>503 Service Unavailable</h1><hr>');
        next(err);
    }
});

router.get('/oss/:oss', async (req, res, next) => {
    try {
        let name = decodeURIComponent(req.params.oss);
        let url = `http://${name}`;
        let pos = url.lastIndexOf("/");
        let filepath = name.substring(pos + 1);
        let loc = path.resolve(__dirname,`../public/cache/${filepath}`);
        let cached = false;
        res.setHeader('Access-Control-Allow-Origin', '*');
        try {
            fs.accessSync(loc);
            cached = true;
        } catch(err) {
            cached = false;
        }
        if(!cached){
            const response = await axios({
                url,
                method: 'GET',
                responseType: 'arraybuffer'
            });
            fs.writeFileSync(loc, response.data);
        }
        let cs = fs.createReadStream(loc);
        cs.on("data", (chunk) => {
            res.write(chunk);
        });
        cs.on("end", () => {
            res.status(200).end();
        });
    } catch(err) {
        res.status(503).send('<h1>503 Service Unavailable</h1><hr>');
        next(err);
    }
});

module.exports = router;