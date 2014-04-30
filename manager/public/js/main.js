'use strict';
/* App Module */

var soManagerApp = angular.module('soManagerApp', ['ngResource', 'ngRoute','soManagerAppControllers','soManagerAppDirectives.ddown','soManagerAppDirectives.orientation', 'soManagerAppServices', 'soManagerAppDirectives.qrcode', 'googlechart',]);

soManagerApp.config(['$routeProvider','$locationProvider',
  function($routeProvider, $locationProvider) {
    //================================================
    // Define all the routes
    //================================================
    $routeProvider
      //Start page, where the user gets a list of registered SO and can add new ones
      .when('/', {
        templateUrl: 'templates/start.html', 
        controller: 'mngerCtrl',
      })
      //Step 1 of registration flow for a service object
      .when('/create/step-1/', {
        templateUrl: '/templates/step-1.html',
        controller: 'createSOCtrl',
      })
      //Step 2 of registration flow for a service object
      // .when('/create/step-2', {
      //   templateUrl: '/templates/step2.html',
      //   controller: 'createSOCtrl',
      // })
      .when('/show/:soid/', {
        templateUrl: '/templates/show.html',
        controller: 'showSOCtrl'
      })
      .when('/connect/:soid/:stream/',{
        templateUrl: '/templates/mobile.html',
        controller: 'connectCtrl',
      })
      .otherwise({
          redirectTo: '/'
      });
      //$locationProvider.html5Mode(true);
    //================================================
	}]);