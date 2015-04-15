/**
 * Created by chandler on 3/11/15.
 */
var Ticket = require('../models/ticket.js');
var Student = require('../models/student.js');

var ticketConfirmationEmail = function(studentID, ticketID) {
    var Student = {};
    var Ticket = {};
    Student.findById(studentID, function(err, student){
        if (err) return err;
        Student = student;
        Ticket.findById(ticketID, function(err, ticket){
            if (err) return err;
            Ticket = ticket;
        })
    });
    var sendEmail = function(student, ticket) {
        mandrill('/messages/send', {
            message: {
                to: [{email: student.email, name: student.name.full}],
                from: 'prom@schooltrackr.net',
                subject: "Your Wakefield 2015 Prom Ticket",
                text: "Hello, I sent this message using mandrill."
            }
        }, function(error, response)
        {
            //uh oh, there was an error
            if (error) console.log( JSON.stringify(error) );

            //everything's good, lets see what mandrill said
            else console.log(response);
        });
    }
}



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
    if (req.query.number) query.where({ number: req.query.number});
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
        query.populate('student associated').exec(function(err, students) {
            if (err) return next(err);
            res.send(students)
        });
    }
}

function deleteTicket(req, res, next) {
    Ticket.findById(req.params.id, function(err, ticket){
        return ticket.remove(function(err, success) {
            if (success) {
                res.send(204);
                return next()
            } else {
                return next(err)
            }
        })
    })
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
    server.del({path: PATH + '/:id', version: '1.0.0'}, deleteTicket);
    server.get({path: PATH + '/:id', version: '1.0.0'}, readOneTicket);
    server.get({path: PATH, version: '1.0.0'}, readAllTickets);

};