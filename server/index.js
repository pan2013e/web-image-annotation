let path = require('path');
let express = require('express');
let server = express();
let cors = require('cors');
let fs = require('fs');

let PORT = require('./config/env').server.port;

let check_dir = (path) => {
    try {
        fs.accessSync(path, fs.constants.W_OK | fs.constants.R_OK);
    } catch(err) {
        fs.mkdirSync(path, {recursive: true});
        console.log(`[INFO] Created directory ${path}`);
    }
};

check_dir(path.resolve(__dirname,'./public/cache'));
check_dir(path.resolve(__dirname,'./public/exports'));
check_dir(path.resolve(__dirname,'./public/uploads'));

server.use(express.urlencoded({ extended: true }));
server.use(cors());
server.use(express.json({limit : "50000000kb"}));

server.use('/api', require('./routes/auth'));
server.use('/api', require('./routes/upload'));
server.use('/api', require('./routes/task'));
server.use('/api', require('./routes/image'));
server.use('/static', require('./routes/static'));
server.use('/static/image', express.static(path.join(__dirname, 'public/uploads')));
server.use((req, res) => {
    res.status(404).send('<h1>404 Not Found</h1><hr>The resource you requested cannot be found.');
});

server.listen(PORT, () => {
    console.log(`[INFO] Server listening on port ${PORT}`);
});
