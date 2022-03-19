let env = require('./config/env').credentials;
let options = require('./config/env').options;
let mongoose = require('mongoose');
let db = mongoose.connection;
let uri = `${env.protocol}://${env.username}:${env.passwd}@${env.hosturl}/${env.dbname}?${env.options}`;

mongoose.connect(uri, options).then(() => {
    console.log('[INFO] Database connected');
    db.useDb('webapp');
});

db.on('error', (err) => {
    console.error(err);
});

module.exports = {
    login_info: mongoose.model('login_info', new mongoose.Schema({
        uname: {
            type: String, required: true, unique: true
        },
        passwd: {
            type: String, required: true
        },
        email: {
            type: String, required: true, unique: true,
            match: RegExp(/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/)
        }
    })),
    image: mongoose.model('image', new mongoose.Schema({
        pid: {
            type: String, required: true, unique: true
        },
        src: {
            type: Array, required: true
        },
        original_name: {
            type: Array, default: []
        },
        res: {
            type: Array, default: []
        },
        res_url: {
            type: Array, default: []
        }
    })),
    task: mongoose.model('task', new mongoose.Schema({
        tid: {
            type: String, required: true, unique: true
        },
        uname: {
            type: String, required: true
        },
        title: {
            type: String, required: true
        },
        desc: {
            type: String, default: 'null'
        },
        created_at: {
            type: Date, default: Date.now
        },
        state: {
            type: String, default: 'init'
        },
        uname_recv:{
            type: String, default: 'null'
        },
        pid: {
            type: String, required: true
        },
        advice: {
            type: String, default: ''
        }
    }))
};