'use strict';

/* Controllers */

var soManagerAppDirectives = angular.module('soManagerAppDirectives', []);

soManagerAppDirectives.directive('ngShowdata', [
	function(){
		return {
			restrict: 'EA',
			require: '^ngModel',
			scope:{
				ngModel: '=',
			},
			template: '<h6>Data Stream Name: {{stream.name}}</h6>'
		}
}]);


