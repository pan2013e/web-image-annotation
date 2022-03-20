const _port   = 3000;
// const _domain = 'net.zypan.ltd';
const _domain = '127.0.0.1';
const _protocol = 'http';
const _baseurl = `${_protocol}://${_domain}:${_port}`;
const _callbackuri = `${_baseurl}/api`;
const _captcha_enable = false;

module.exports = {
    credentials: {
        username: process.env.DB_USERNAME,
        passwd: process.env.DB_PASSWD,
        dbname: process.env.DB_NAME ,
        hosturl: process.env.DB_URL,
        protocol: process.env.DB_PROTOCOL || "mongodb",
        options: process.env.DB_OPT
    },
    server: {
        frontend_port: 8080,
        port: _port,
        domain: _domain,
        baseurl: _baseurl,
        callbackuri: _callbackuri
    },
    options: {
        useNewUrlParser: true,
    },
    oss: {
        enable: process.env.OSS_ENABLE || true,
        region: 'ap-shanghai',
        bucket: 'wp-1300750006',
        TencentCloud: {
            SecretId: process.env.OSS_SID,
            SecretKey: process.env.OSS_SKEY
        }
    },
    captcha: {
        enable: _captcha_enable,
        secret: process.env.CAPTCHA_SECRET
    },
    token: {
        secret: process.env.TOKEN_SECRET,
        option: {
            expiresIn: '3d'
        }
    }
};
