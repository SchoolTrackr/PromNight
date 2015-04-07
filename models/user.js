// load the things we need
var mongoose     = require('mongoose');
var bcrypt       = require('bcrypt');
var Schema   = mongoose.Schema,
    ObjectId = Schema.ObjectId;
SALT_WORK_FACTOR = 10;

// define the schema for our user model
var userSchema = mongoose.Schema({
    name: {
            first: { type: String },
            last: { type: String }
    },
    email: { type: String },
    password: { type: String },
    role: { type: String, default: 'user' },
    preflight: { type: Boolean, default: false},
    pilot: { type: Boolean, default: true }
});

userSchema
    .virtual('name.full')
    .get(function() {
        return this.name.first + ' ' + this.name.last;
    });

userSchema
    .virtual('firstName')
    .set(function (firstName) {
        this.set('name.first', firstName)
    });
userSchema
    .virtual('lastName')
    .set(function (lastName) {
        this.set('name.last', lastName)
    });

userSchema
    .virtual('pilotPass')
    .set(function (pilotPass) {
        this.set('password', this.generateHash(pilotPass))
    });

userSchema.set('toJSON', {
    virtuals: true
});

userSchema.pre('save', function (next) {
    var user = this;

    // only hash the password if the password has changed
    if (!this.isModified('password')) {
        return next();
    }
    bcrypt.hash(user.password, 8, function(err, hash) {
        if (err) return next(err);

        user.password = hash;
        next();
    });
});

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), function(err, success) {
        if (err) console.log(err);
        return success
    });
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

// Password verification
userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if(err) return cb(err);
        cb(null, isMatch);
    });
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);