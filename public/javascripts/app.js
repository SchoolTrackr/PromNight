/**
 * Created by chandler on 3/11/15.
 */
var promNight = angular.module('PromNight', ['ui.router', 'promNight.authentication', 'ui.bootstrap', 'oitozero.ngSweetAlert', 'angularMoment']);
//var APIroot = 'https://promnight.schooltrackr.net/api';
var APIroot = 'http://prom.schooltrackr.net/api';
promNight.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise("/");
    $stateProvider
        .state('login', {
            url: '/login',
            templateUrl: "partials/login.html"
        })
        .state('core', {
            abstract: true,
            templateUrl: "partials/core.html"
        })
        .state('core.dashboard', {
            url: "/",
            templateUrl: "partials/core.dashboard.html"
        })
        .state('core.addTicket', {
            url: "/addTicket",
            templateUrl: "partials/core.addTicket.html"
        })
        .state('core.checkIn', {
            url: "/checkIn",
            templateUrl: "partials/core.checkIn.html"
        })
        .state('core.tickets', {
            url: "/tickets",
            templateUrl: "partials/core.tickets.html"
        });


});

promNight.controller('loginController', function($scope, AuthService) {
    $scope.credentials = {};
    $scope.login = function(credentials) {
        AuthService.login(credentials)
    }
});

promNight.controller('coreController', function($scope, AuthService, Session) {
    $scope.Session = Session;
});

promNight.controller('dashboardController', function($scope, Session, $http) {
    $scope.Session = Session;
    $scope.showWelcome = true;
    $scope.hideWelcome = function() {
        console.info('Welcome box should now be hidden');
        $scope.showWelcome = false
    };
    $scope.getStudentById = function(id) {
        return $http.get(APIroot+'/students/'+id+'?access_token='+Session.token).then(function(res) {
            console.log(res.data);
            return res.data
        })
    };
    $scope.recentTickets = {};
    $scope.getRecentTickets = function() {
        return $http.get(APIroot+'/tickets'+'?access_token='+Session.token+'&limit=5').then(function(res) {
            $scope.recentTickets = res.data;
            return res.data
        })
    };
    $scope.getRecentTickets();
});

promNight.controller('addTicketController', function($scope, Session, $http, SweetAlert) {
    $scope.addTicketForm = {};
    $scope.addStudentForm = {};
    $scope.addTicketForm.ticketPrice = 40;
    $scope.addStudentForm.grade = 12;
    $scope.getStudent = function(name, ticket) {
        return $http.jsonp(APIroot+'/students?callback=JSON_CALLBACK&access_token='+Session.token+'&name='+name+'&hasTicket='+ticket).then(function(res) {
            return res.data
        })
    };
    $scope.createTicket = function (form) {
        var request = {};
        if (form.associated) {
            request = {
                student: form.student._id,
                associated: form.associated._id,
                price: form.price,
                number: form.ticketNumber
            }
        } else {
            request = {
                student: form.student._id,
                price: form.ticketPrice,
                number: form.ticketNumber
            }
        }
        SweetAlert.swal({
                title: "Are you sure?",
                text: "You're about to add a ticket for "+form.student.name.full,
                type: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, Give them a Golden Ticket!",
                cancelButtonText: "No, This is incorrect",
                closeOnConfirm: false,
                closeOnCancel: false },
            function(isConfirm){
                if (isConfirm) {
                    $http.post(APIroot + '/tickets', request).success(function (res) {
                        SweetAlert.swal("Awesome!", "This student now has a ticket", "success");
                        $http.post(APIroot+'/students/email', {id: form.student._id, email: form.email}).success(function(res){
                            console.log(res)
                        });
                        $scope.addTicketForm.student = '';
                        $scope.addTicketForm.associated = '';
                        $scope.addTicketForm.email = '';
                        $scope.addTicketForm.ticketNumber = '';
                        console.log(res)
                    }).error(function (res) {
                        SweetAlert.swal("Uh Oh", "Something went wrong when trying to make this ticket", "error");
                        $scope.addTicketForm.student = '';
                        $scope.addTicketForm.associated = '';
                        $scope.addTicketForm.email = '';
                        $scope.addTicketForm.ticketNumber = '';
                        console.warn(res)
                    });
                } else {
                    SweetAlert.swal("Cancelled", "No ticket was created", "error");
                }
            });
    };
    $scope.addStudent = function (form) {
        var request = {
            first: form.name.first,
            last: form.name.last,
            grade: form.grade,
            isOutside: form.isOutside
        };
        SweetAlert.swal({
                title: "Are you sure?",
                text: "You're about to add a new student named "+form.name.first+' '+form.name.last,
                type: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, Add them!",
                cancelButtonText: "No, This is incorrect",
                closeOnConfirm: false,
                closeOnCancel: false },
            function(isConfirm){
                if (isConfirm) {
                    $http.post(APIroot + '/students', request).success(function (res) {
                        SweetAlert.swal("Awesome!", "This student now has a ticket", "success");
                        $scope.addStudentForm.name.first = '';
                        $scope.addStudentForm.name.last = '';
                        $scope.addStudentForm.grade = 12;
                        $scope.addStudentForm.isOutside = false;
                        console.log(res)
                    }).error(function (res) {
                        SweetAlert.swal("Uh Oh", "Something went wrong when trying to make this student", "error");
                        $scope.addStudentForm.name.first = '';
                        $scope.addStudentForm.name.last = '';
                        $scope.addStudentForm.grade = 12;
                        $scope.addStudentForm.isOutside = false;
                        console.warn(res)
                    });
                } else {
                    SweetAlert.swal("Cancelled", "No student was created", "error");
                }
            });
    };
});

promNight.controller('checkInController', function($scope) {
    $scope.checkIn = function(id) {
        $http.get(APIroot+'/tickets/'+id+'checkIn').success(function() {
            console.info('Successfully checked in ticket')
        }).error(function() {
            console.warn('There was an error while checking in this ticket')
        })
    }
});

promNight.controller('ticketsController', function($scope, $http, Session, SweetAlert, $modal) {
    $scope.tickets = {};
    $scope.getTickets = function() {
        return $http.get(APIroot+'/tickets'+'?access_token='+Session.token+'&limit=2000&sort=-number').then(function(res) {
            $scope.tickets = res.data;
            return res.data
        })
    };
    $scope.getTickets();
    $scope.deleteTicket = function(ticket) {
        SweetAlert.swal({
                title: "Are you sure?",
                text: "You're about to delete the ticket for "+ticket.student.name.full,
                type: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, Delete the ticket!",
                confirmButtonColor: "#DD6B55",
                cancelButtonText: "No, This is incorrect",
                closeOnConfirm: false,
                closeOnCancel: false },
            function(isConfirm){
                if (isConfirm) {
                    $http.delete(APIroot + '/tickets/'+ticket._id).success(function (res) {
                        SweetAlert.swal("Success", "The ticket has been deleted", "success");
                        $scope.getTickets();
                        console.log(res)
                    }).error(function (res) {
                        SweetAlert.swal("Uh Oh", "Something went wrong when trying to delete this ticket", "error");
                        $scope.getTickets();
                        console.warn(res)
                    });
                } else {
                    SweetAlert.swal("Cancelled", "No ticket was deleted", "error");
                }
            });

    };
    $scope.editTicket = function(ticket) {
        console.log(ticket);
        var editTicketModal = $modal.open({
            templateUrl: 'editTicketModal.html',
            controller: 'editTicketController',
            resolve: {
                ticket: function() {
                    return ticket
                }
            }
        });
        editTicketModal.result.then(function (selectedItem) {
            $scope.selected = selectedItem;
        }, function () {
            console.info('Modal dismissed at: ' + new Date());
        });
    }
});

promNight.controller('editTicketController', function($scope, $http, Session, ticket, $editTicketModal) {
    $scope.ticket = ticket;
    $scope.getStudent = function(name, ticket) {
        return $http.jsonp(APIroot+'/students?callback=JSON_CALLBACK&access_token='+Session.token+'&name='+name+'&hasTicket='+ticket).then(function(res) {
            return res.data
        })
    };
    $scope.save = function () {
        $editTicketModal.close();
    };

    $scope.cancel = function () {
        $editTicketModal.dismiss();
    };
});

promNight.run(function(AuthService, $state, $timeout){
    console.group('Running application checks');
    var authenticated = AuthService.isAuthenticated();
    if (authenticated == false) {
        $timeout(function(){
            $state.go('login')
        });
        console.log('User is not authenticated')
    }
    console.groupEnd()
});