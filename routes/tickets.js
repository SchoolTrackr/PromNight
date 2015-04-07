/**
 * Created by chandler on 3/11/15.
 */
var Ticket = require('../models/ticket.js');
var Student = require('../models/student.js');

var createTicket = function(req, res, next) {
    ticket = new Ticket(req.body);
    if (ticket.associated) {
        console.log('Found a ticket with an associated student, linking other student...')
        var query = Ticket.findOne();
        query.where({student: ticket.associated});
        query.exec(function(err, targetTicket) {
            if (err) console.log(err);
            targetTicket.associated = ticket.student;
            targetTicket.save();
        })
    }
    ticket.save(function(err, success) {
        if (success) {
            res.send(200, ticket)
        } else {
            res.send(500, err)
        }
    })
};

function readOneTicket(req, res, next) {
    Ticket.findById(req.params.id, function(err, ticket){
        if (err) {
            res.status(503, err)
        } else {
            res.send(ticket)
        }
    })
}

function readAllTickets(req, res, next) {
    var query = Ticket.find();
    if (req.query.student) query.where({ student: req.query.student});
    if (req.query.associated) query.where({ associated: req.query.associated});
    if (req.query.price) query.where({ price: req.query.price});
    if (req.query.sort) {
        query.sort(req.query.sort)
    } else {
        query.sort('-bought')
    }
    if (req.query.limit) {
        query.limit(req.query.limit)
    } else {
        query.limit(20)
    }
    if (req.query.count) {
        query.limit(1000000);
        query.exec(function(err, students) {
            if (err) return next(err);
            var resultCount = students.length;
            res.send(200, resultCount);
        });
    } else {
        query.populate('student').exec(function(err, students) {
            if (err) return next(err);
            res.send(students)
        });
    }
}

function checkIn(req, res, next) {
    Ticket.findById(req.params.id, function(err, ticket){
        if (err) {
            res.status(503, err)
        } else {
            res.send(ticket)
        }
    })

}

PATH = '/api/tickets';

module.exports = function(server) {
    server.post({path: PATH, version: '1.0.0.'}, createTicket);
    server.get({path: PATH + '/:id', version: '1.0.0'}, readOneTicket);
    server.get({path: PATH, version: '1.0.0'}, readAllTickets);

};