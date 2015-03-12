/**
 * Created by chandler on 3/11/15.
 */
authentication = angular.module('promNight.authentication', ['LocalStorageModule', 'ui.router']);
authentication.config(function(localStorageServiceProvider){
    localStorageServiceProvider.setPrefix('promnight.authentication')
});

authentication.constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
});
authentication.constant('AUTH_LEVELS', {
    superUser: 0,
    checkIn: 1,
    dashboard: 2
});
authentication.service('Session', function() {
    this.create = function (token, expires, user) {
        this.token = token;
        this.expires = expires;
        this.user = user;
    };
    this.destroy = function () {
        this.token = null;
        this.expires = null;
        this.user = null;
    }
});
authentication.factory('AuthService', function ($http, Session, localStorageService, $rootScope, AUTH_EVENTS, $state) {
    var authService = {};
    authService.login = function (credentials) {
        return $http.post(APIroot + '/auth/authenticate', credentials).then(function (res) {
            Session.create(res.data.token, res.data.expires, res.data.user);
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess, Session.user);
            localStorageService.set('session', Session);
            $state.go('core.dashboard');
            return res.data.user;
        })
    };
    authService.logout = function () {
        Session.destroy();
        localStorageService.clearAll();
        $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
    };

    authService.isAuthenticated = function () {
        return !!Session.user
    };

    authService.isAuthorized = function (level) {
        return Session.user.accessLevel >= level;
    };
    return authService
});

authentication.run(function(localStorageService, Session, $rootScope, AUTH_EVENTS) {
    console.group('Starting Authentication Initialization Process...');
    if(localStorageService.isSupported) {
        console.log('Local Storage is supported');
        if (localStorageService.get('session')) {
            var savedSession= localStorageService.get('session');
            if (savedSession.expires > Date.now()) {
                console.log('Session is valid, continuing');
                Session.create(savedSession.token, savedSession.expires, savedSession.user);
                $rootScope.$broadcast(AUTH_EVENTS.loginSuccess, Session.user);
            } else {
                console.log('This session has expired, removing');
                localStorageService.remove('session')
            }
        } else {
            console.log("Couldn't find a valid session");
        }
    } else {
        console.warn('LocalStorage is not supported on this browser. This may have undesired effects.')
    }
    console.groupEnd()
});