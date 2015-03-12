/**
 * Created by chandler on 3/11/15.
 */
var Ticket = require('models/ticket.js');
var Student = require('models/student.js');

var createTicket = function(req, res, next) {
    console.log(req.body);
    res.send(200, 'Okay')
};

PATH = '/api/tickets';

module.exports = function(server) {
    server.post({path: PATH, version: '1.0.0.'}, createTicket)
};