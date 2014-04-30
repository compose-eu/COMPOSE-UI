'use strict';

/* Directive */

var soManagerAppDirectives = angular.module('soManagerAppDirectives.orientation', []);

soManagerAppDirectives.directive('ngDeviceOrientation', ['$interval','$window','$timeout',
	function($interval, $window, $timeout){
		return {
			restrict: 'EA',
			templateUrl: '/templates/ng-device-orientation.html',
			controller: ['$scope', 'SmartObject','$routeParams',  function($scope, SmartObject, $routeParams){
				$scope.smartObjectID = $routeParams.soid;
        		$scope.streamName= $routeParams.stream;
     			$scope.motionBuffer = new Array();						  						  				            
				$scope.initHandler = function(){
					if($scope.streamName === "location"){
						//Do GEO Stuff
						if ("geolocation" in $window.navigator) {
						  /* geolocation is available */
						  $scope.doEvent = "GeoLocation";
						  $scope.isSupported = "Yes!"
						  $interval(function(){
						  	$window.navigator.geolocation.getCurrentPosition(function(position){
								$scope.doGeo = {"lat":position.coords.latitude, "long": position.coords.longitude};
			            		SmartObject.push($scope.smartObjectID, $scope.streamName, $scope.doGeo).then(function(status){
			            			console.log("Success Data Push: " + status);
			            		});
						  	});
						  }, 2000);						  
						} else {
						  /* geolocation IS NOT available */
						  $scope.doEvent = "GeoLocation";
						  $scope.isSupported = "No!"						  						  
						}
					}else if($scope.streamName === "orientation"){
						//If SmartObject has orientation as channel Do DeviceMotion Stuff
						if ($window.DeviceMotionEvent) {
				            $scope.doEvent = "DeviceMotionEvent!";
						  	$scope.isSupported = "Yes!";
				            $window.addEventListener('devicemotion', function (eventData) {
								var info, xyz = "[X, Y, Z]";
								// Grab the acceleration from the results
								var acceleration = eventData.acceleration;

								// Grab the acceleration including gravity from the results
								acceleration = eventData.accelerationIncludingGravity;
								$scope.$apply(function(){
									$scope.doAccelGrav = {"x":acceleration.x.toFixed(4), "y": acceleration.y.toFixed(4), "z": acceleration.z.toFixed(4)};
				            		$scope.motionBuffer.push($scope.doAccelGrav);
								});			            			            	
					        }, false);
			            	$interval(function(){
			            		var elem = $scope.motionBuffer.pop();
			         			SmartObject.push($scope.smartObjectID, $scope.streamName, elem).then(function(status){
			            			console.log("Pushed data to server: " + elem);
			            		});
			            	}, 2000);
				        }else{
				            $scope.doEvent = "DeviceMotionEvent";
				        	$scope.isSupported = "No!"						  						  
				        }
					}
				}
			}],
			link: function(scope, element, attrs){
				scope.initHandler();
			}
		}
}]);


