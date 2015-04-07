/**
 * Created by chandler on 3/11/15.
 */
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var Student  = require('../models/student.js');

var ticketSchema = mongoose.Schema({
    bought: { type: Date, default: Date.now },
    student: { type: Schema.Types.ObjectId, ref: 'Student' },
    associated: { type: Schema.Types.ObjectId, ref: 'Student'},
    number: { type: Number, default: 0 },
    price: { type: Number, default: 40 }
});

ticketSchema.pre('save', function(next, done) {
    var ticket = this;
    Student.findById(ticket.student, function(err, student) {
        student.ticket = ticket._id;
        student.hasTicket = true;
        student.save()
    });
    if (ticket.associated) {

    }
    next()
});

module.exports = mongoose.model('Ticket', ticketSchema);
