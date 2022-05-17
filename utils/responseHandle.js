const headers = require('../helper/config');

const successHandle = (res, data) => {
    res.writeHead(200, headers);
    res.write(JSON.stringify({
        'status': 'success',
        'data': data
    }));
    res.end();
}

const errHandle = (res, statusCode, message) => {
    res.writeHead(statusCode, headers);
    res.write(JSON.stringify({
        'status': 'false',
        'message': message
    }));
    res.end();
}
module.exports = { errHandle, successHandle }