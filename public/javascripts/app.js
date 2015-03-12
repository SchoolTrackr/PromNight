/**
 * Created by chandler on 3/11/15.
 */
var promNight = angular.module('PromNight', ['ui.router', 'promNight.authentication']);
var APIroot = 'https://promnight.schooltrackr.net/api';

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

promNight.controller('dashboardController', function($scope, Session) {
    $scope.Session = Session;
    $scope.showWelcome = true;
    $scope.hideWelcome = function() {
        console.info('Welcome box should now be hidden');
        $scope.showWelcome = false
    }
});

promNight.controller('addTicketController', function($scope) {

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