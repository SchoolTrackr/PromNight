/**
 * Created by chandler on 3/10/15.
 */
var restify = require('restify');
var server = restify.createServer({
    name:'PromNight-API',
    version: '1.0.0'
});
var mongoose = require('mongoose');
var authLib = require('./libs/authLib.js');

server.listen(8000, function() {
    console.log('PromNight API is now running')
});
var databaseURL = process.env.databaseURL;

mongoose.connect(databaseURL, function(err) {
    if (err) console.log('Error connecting to MongoDB: ' + err); else console.log('Successfully connected to MongoDB')
});

server.use(restify.queryParser());
server.use(restify.bodyParser());
server.pre(restify.CORS());
server.use(restify.jsonp());
server.use(restify.gzipResponse());
server.use(restify.throttle({
    burst: 100,
    rate: 75,
    ip: true
}));
server.use(function crossOrigin(req,res,next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    return next();
});

// Fix Options requests per https://github.com/mcavage/node-restify/issues/284
function unknownMethodHandler(req, res) {
    console.log('Got an unknown method, handling');
    if (req.method.toLowerCase() === 'options') {
        var allowHeaders = ['Accept', 'Accept-Version', 'Content-Type', 'Api-Version', 'Authorization', 'x-access-token'];
        if (res.methods.indexOf('OPTIONS') === -1) res.methods.push('OPTIONS');
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Headers', allowHeaders.join(', '));
        res.header('Access-Control-Allow-Methods', res.methods.join(', '));
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        return res.send(204);
    }
    else
        return res.send(new restify.MethodNotAllowedError());
}
server.on('MethodNotAllowed', unknownMethodHandler);

require('./routes/students.js')(server);
require('./routes/tickets.js')(server);
require('./routes/auth.js')(server);