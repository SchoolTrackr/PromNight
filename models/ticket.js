/**
 * Created by chandler on 3/11/15.
 */
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var ticketSchema = mongoose.Schema({
    bought: { type: Date, default: Date.now },
    members: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
    associated: [{ type: Schema.Types.ObjectId, ref: 'Ticket'}],
    price: { type: Number, default: 40 }
});

module.exports = mongoose.model('Ticket', ticketSchema);
