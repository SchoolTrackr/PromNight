var moment = require('moment');
var User = require('../models/user.js');
var jwt  = require('jwt-simple');

var secret = process.env.Secret;

var exports = module.exports = {};

exports.genericError = function(err) {
    return {
        simple: "We've encountered an unexpected error",
        long: "Fear not! A team of highly trained monkeys have been dispatched to fix this issue",
        error: "Stacktrace: \n" + err,
        rawError: err
    }
};

exports.changePassword = function(req, res, next) {
    var currentPassword = req.body.cPassword,
        newPassword = req.body.nPassword,
        newPasswordConfirm = req.body.nPasswordc;
    User.comparePassword(function(currentPassword, err) {
        if (err) {
            res.send(401, 'Error')
        } else {
            User.findById(req.user._id, function(err, user){
                if (err) {
                    res.status(503, err)
                } else {
                    res.send(user)
                }
            })
        }
    })
};

exports.authenticate = function(req, res, next) {
    var expires = moment().add(12, 'hours').valueOf();
    email = req.body.email;
    password = req.body.password;
    User.findOne({ email:email }, function(err, user) {
        if (err) {
            return res.send(401, genericError(err));
        }
        if (!user) {
            return res.send(401, 'Bad Username');
        }
        if (!user.validPassword(password)) {
            return res.send(401, 'Bad Password');
        }

        var token = jwt.encode({iss: user._id, exp: expires}, secret);
        res.json({
            token: token,
            expires: expires,
            user: user
        })
    });
};

exports.verify = function(req, res, next) {
    var token = (req.body && req.body.access_token) || req.query.access_token || req.headers["authorization"];
    if (token) {
        var decoded = jwt.decode(token, secret);
        if (decoded.exp <= Date.now()) {
            res.send(400, "This token has expired, please re-authenticate")
        }
        User.findOne({ '_id': decoded.iss }, function(err, user) {
            if (!err) {
                req.user = user;
                return next()
            } else {
                res.send(401, "You're request didn't contain a valid token, please re-authenticate")
            }
        })
    } else {
        res.send(401, "You don't appear to have a valid token, please ensure you are authenticated")
    }
};
