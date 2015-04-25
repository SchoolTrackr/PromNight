/**
 * Created by chandler on 3/11/15.
 */
var Ticket = require('../models/ticket.js');
var Student = require('../models/student.js');

//var UpdateAll = function() {
//    var query = Student.find()
//    query.exec(function(err, students) {
//        if (err) console.log(err)
//        students.forEach(function(student) {
//            student.hasCheckedIn = false
//            student.save()
//            console.log('Saved Student')
//        })
//    })
//}

function createStudent(req, res, next) {
    student = new Student({
        name: {
            first: req.body.first,
            last: req.body.last
        },
        grade: req.body.grade,
        isOutside: req.body.isOutside
    });
    student.save(function (err, success) {
        if (success) {
            res.send(201,success)
        } else {
            return next(err)
        }
    })
}

function readOneStudent(req, res, next) {
    Student.findById(req.params.id, function(err, student){
        if (err) {
            res.status(503, err)
        } else {
            res.send(student)
        }
    })
}

function addEmail(req, res, next) {
    Student.findById(req.body.id, function(err, student) {
        if (err) {
            res.status(503, err)
        } else {
            student.email = req.body.email;
            student.save();
            res.send(200, student)
        }
    })
}

function readAllStudents(req, res, next) {
    var query = Student.find();
    if (req.query.first) query.where({ 'name.first': req.query.first});
    if (req.query.last) query.where({ 'name.last': req.query.last});
    if (req.query.name) {
        if (req.query.name.indexOf(' ') > -1) {
            var fullName = req.query.name.split(' ');
            query.where({'name.first': new RegExp(fullName[0], 'i'), 'name.last': new RegExp(fullName[1], 'i')})
        } else {
            query.where().or([{ 'name.first': new RegExp(req.query.name, "i")}, { 'name.last': new RegExp(req.query.name, "i")}])
        }
    }
    if (req.query.grade) query.where({ grade: req.query.grade});
    if (req.query.hasTicket) query.where({ hasTicket: req.query.hasTicket });
    if (req.query.hasCheckedIn) query.where({ hasCheckedIn: req.query.hasCheckedIn });
    if (req.query.isOutside) query.where({ isOutside: req.query.isOutside });

    if (req.query.sort) {
        query.sort(req.query.sort)
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
        query.exec(function(err, students) {
            if (err) return next(err);
            res.send(students)
        });
    }
}

function updateStudent(req, res, next) {

}

function deleteStudent(req, res, next) {
    Student.findById(req.params.id, function(err, student){
        return student.remove(function(err, success) {
            if (success) {
                res.send(204);
                return next()
            } else {
                return next(err)
            }
        })
    })
}

PATH = '/api/students';

module.exports = function(server) {
    server.post({path: PATH, version: '0.0.1'}, createStudent);
    server.post({path: PATH + '/email', version: '0.0.1'}, addEmail);
    server.get({path: PATH, version: '0.0.1'}, readAllStudents);
    server.get({path: PATH + '/:id', version: '0.0.1'}, readOneStudent);
    server.put({path: PATH + '/:id', version: '0.0.1'}, updateStudent);
    server.del({path: PATH + '/:id', version: '0.0.1'}, deleteStudent)
};
