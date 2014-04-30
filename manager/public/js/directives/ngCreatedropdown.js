'use strict';

/* Directive */

var soManagerAppDirectives = angular.module('soManagerAppDirectives.ddown', []);

soManagerAppDirectives.directive('ngCreatedropdown', [
	function(){
		return {
			restrict: 'EA',
			require: '^ngModel',
			scope:{
				ngModel: '=',
				ngData: '=',
			},
			template: '<select class="form-control" id="select" ng-model="ngData" ng-options="t.name for t in ngModel"><option value="">--- choose sensor type ---</option></select>'
		}
}]);


