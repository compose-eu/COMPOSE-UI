'use strict';

/* Directive */

var soManagerAppDirectives = angular.module('soManagerAppDirectives.qrcode', []);

soManagerAppDirectives.directive('ngQrcode', ['$timeout',
	function($timeout){
		return {
			restrict: 'A',
			scope:{
				ngData: '=',
			},
			link: function(scope, element, attrs){
				$timeout(function(){
					var options = JSON.stringify(scope.ngData);
					angular.element(element).qrcode({width: 10, height: 10, text: scope.ngData.text});
				}, 1000);
			}
		}
}]);


