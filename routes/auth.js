var User = require('../models/user.js');
var authLib = require('../libs/authLib.js');
console.log('Auth Route loaded successfully');

function getMe(req, res, next) {
    res.send(200, req.user);
}


PATH = '/api/auth';

module.exports = function(server) {
    server.post({path: PATH + '/authenticate', version: '0.0.1'}, authLib.authenticate);
    server.get({path: '/api/me', version: '0.0.1'}, getMe)
};
