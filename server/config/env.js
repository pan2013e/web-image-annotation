const _port   = 3000;
// const _domain = 'net.zypan.ltd';
const _domain = '127.0.0.1';
const _protocol = 'http';
const _baseurl = `${_protocol}://${_domain}:${_port}`;
const _callbackuri = `${_baseurl}/api`;
const _captcha_enable = false;

module.exports = {
    credentials: {
        username: process.env.DB_USERNAME ||  "pzy",
        passwd: process.env.DB_PASSWD || "Pzy12345",
        dbname: process.env.DB_NAME || "webapp",
        hosturl: process.env.DB_URL || "dds-bp1e73a6fffcefa41330-pub.mongodb.rds.aliyuncs.com:3717",
        protocol: process.env.DB_PROTOCOL || "mongodb",
        options: process.env.DB_OPT || "replicaSet=mgset-58384600"
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
            SecretId: process.env.OSS_SID || 'AKIDznLcfRwA8oDMDpAF3cuvf8KFtFLAj02o',
            SecretKey: process.env.OSS_SKEY || 'WljQr1uVpsd8MJzPcZEcka9RTEivsYx4'
        }
    },
    captcha: {
        enable: _captcha_enable,
        secret: process.env.CAPTCHA_SECRET || '6LckeZ8cAAAAAOItP9VVzmLBMCdzEvWZYmYOtIvz'
    },
    token: {
        secret: process.env.TOKEN_SECRET || 'pzy3190101093zju',
        option: {
            expiresIn: '3d'
        }
    }
};