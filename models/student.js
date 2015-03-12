/**
 * Created by chandler on 3/11/15.
 */
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var studentSchema = mongoose.Schema({
    name: {
        first: { type: String },
        last: { type: String }
    },
    grade: { type: Number, required: true},
    modified: { type: Date, default: Date.now },
    ticket: { type: Schema.Types.ObjectId, ref: 'Ticket' },
    hasTicket: { type: Boolean, default: false },
    isOutside: { type: Boolean, default: false }
});

studentSchema.pre('save', function(next, done) {
    if (this.ticket) {
        this.hasTicket = true
    }
    next();

});

studentSchema
    .virtual('name.full')
    .get(function() {
        return this.name.first + ' ' + this.name.last;
    });

studentSchema
    .virtual('firstName')
    .set(function (firstName) {
        this.set('name.first', firstName)
    });
studentSchema
    .virtual('lastName')
    .set(function (lastName) {
        this.set('name.last', lastName)
    });

studentSchema.set('toJSON', {
    virtuals: true
});
studentSchema.set('toObject', {
    virtuals: true
});

module.exports = mongoose.model('Student', studentSchema);
