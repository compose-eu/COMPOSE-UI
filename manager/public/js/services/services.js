'use strict';

var soManagerAppServices = angular.module('soManagerAppServices', ['ngResource']);

soManagerAppServices.factory('SmartObject', ['$resource','$http','$q',
	function( $resource, $http, $q){
		//var apiToken = "ZTU2NGIxODAtYTE0ZS00YjA2LWFhN2MtNmY3YjZiNWQ4ZjM2OTk1Y2VlOTctYWMyZS00MDg4LTkyMTctZDEyMDRlMzM1NzFm"; //testaccount
		var apiToken = "ZWU5Y2YyMDAtZmEwOC00Mjg5LWEzYmEtOWU2N2VkMDJhYzAxNGY5YmQ1NDMtM2VlYS00N2EwLTlhNDMtOTMzNmY5ODlhNGMy"; //demoaccount
		var composeAPI = "http://api.servioticy.com";

		$http.defaults.headers.common.Authorization = apiToken;
		$http.defaults.headers.common.Accept = "application/json";

		var templates = [{name:"GPS-Sensor"}, {name:"Gyroscope"}];

		function getApi(){
			return apiToken;
		}

		function createSO(smartobject){
			var _createSODeferred = $q.defer();
			var postObject;
			if(smartobject.sensorType.name == templates[0].name){ //GPS
				postObject = {  
				   "name": "", 
				   "description": "", 
				   "URL": "Web Object URL ",
				   "public": "true",
				   "streams": {
				        "location": {
				            "channels": {
				                "latitude": {
				                    "type": "Number",
				                    "unit": "degrees"
				                },
				                "longitude": {
				                    "type": "Number",
				                    "unit": "degrees"
				                }
				            },
				            "description": "GPS outdoor location",
				            "type": "sensor"
				        },
				        "status":{
				        	"channels":{
				        		"state":{
				        			"type": "Number",
				        			"unit": "integer"
				        		}
				        	},
				        	"description": "state of smart object (active or inactive)",
				        	"type": "abstract"
				        }
				    },
				    "customFields": {},
				    "actions": [],
				    "properties": []
				}
			}else if(smartobject.sensorType.name == templates[1].name){ //Gyroscope
				postObject = {  
				   "name": "", 
				   "description": "", 
				   "URL": "",
				   "public":"true",
				   "streams": {
				         "orientation": {
				            "channels": {
				                "x": {
				                    "type": "Number",
				                    "unit": "degrees"
				                },
				                "y": {
				                    "type": "Number",
				                    "unit": "degrees"
				                },
				                "z": {
				                    "type": "Number",
				                    "unit": "degrees"
				                }
				            },
				            "description": "Gyroscope Sensor",
				            "type": "Sensor"
				        },
				        "status":{
				        	"channels":{
				        		"state":{
				        			"type": "Number",
				        			"unit": "integer"
				        		}
				        	},
				        	"description": "state of smart object (active or inactive)",
				        	"type": "abstract"
				        }
				    },
				    "customFields": {},
				    "actions": [],
				    "properties": []
				}
			}
			postObject.name = smartobject.name;
			postObject.description = smartobject.description;
			$http({method: 'POST',data: postObject,headers: {"Content-Type": "application/json"}, url: composeAPI}).
			    success(function(data, status, headers, config) {
			      // this callback will be called asynchronously
			      // when the response is available
			      console.log(data);
			      _createSODeferred.resolve(status);
				}).
			    error(function(data, status, headers, config) {
			      // called asynchronously if an error occurs
			      // or server returns response with an error status.
			     // _getSOData.reject("Error: " + status);
			     _createSODeferred.reject(status);
			});
			return _createSODeferred.promise;
		}

		function getSOData(id){
				var _getSOData = $q.defer();
				$http({method: 'GET', url: composeAPI+"/"+id}).
				    success(function(data, status, headers, config) {
				      // this callback will be called asynchronously
				      // when the response is available
				      console.log(data);
				      _getSOData.resolve(data);
					}).
				    error(function(data, status, headers, config) {
				      // called asynchronously if an error occurs
				      // or server returns response with an error status.
				      _getSOData.reject("Error: " + status);
				});
				return _getSOData.promise;
		}

		function getSOList(){
			var _getSmartObjectIds = $q.defer();
			//reset caching Array
			//smartobjectIDs = new Array();
			$http({method: 'GET', url: composeAPI}).
			    success(function(data, status, headers, config) {
			      // this callback will be called asynchronously
			      // when the response is available
			      console.log(data);
/*			      for(var i=0;i<data.length;i++){
			      	smartobjectIDs.push(data[i]);
			      }*/
			      	_getSmartObjectIds.resolve(data);
				}).
			    error(function(data, status, headers, config) {
			      // called asynchronously if an error occurs
			      // or server returns response with an error status.
			      _getSmartObjectIds.reject("Data error!");
				});
			//Return Promise!
			return _getSmartObjectIds.promise;
		}

		function getTemplates(){
			return templates;
		}

		function getStreamData(id, stream, time){
			time = (time==null ? "" : time); // check if since date is defined
			var _defStreamData = $q.defer();
			$http({method:'GET', url: composeAPI + "/"+ id+"/streams/"+stream+"/"+time}).
				success(function(data, status, headers, config){
					_defStreamData.resolve(data);
				}).
				error(function(data, status, headers, config){
					_defStreamData.reject("Error retrieving SO stream data for " + id);
				});
			return _defStreamData.promise;
		}

		function pushStreamData(id,stream, data){
			var _pushData = $q.defer();
			if(stream === "location"){
				var pushJSON = {
				    "channels": {
				        "latitude": {
				            "current-value": data.lat,
				            "unit": "degrees"
				        },
				        "longitude": {
				            "current-value": data.long,
				            "unit": "degrees"
				        }
				    },
				    "lastUpdate": (new Date()).getTime()
				};
			$http({method:'PUT',data: pushJSON, headers: {"Content-Type": "application/json"}, url: composeAPI + "/"+ id+"/streams/"+stream}).
				success(function(data, status, headers, config){
					_pushData.resolve(data);
				}).
				error(function(data, status, headers, config){
					_pushData.reject(data);
				});
			}else if(stream === "orientation"){
				var pushJSON = {
				    "channels": {
				        "x": {
				            "current-value": data.x,
				            "unit": "degrees"
				        },
				        "y": {
				            "current-value": data.y,
				            "unit": "degrees"
				        },
				        "z": {
				            "current-value": data.z,
				            "unit": "degrees"
				        }
				    },
				    "lastUpdate": (new Date()).getTime()
				};
				$http({method:'PUT',data: pushJSON,headers: {"Content-Type": "application/json"}, url: composeAPI + "/"+ id+"/streams/"+stream}).
				success(function(data, status, headers, config){
					_pushData.resolve(status);
				}).
				error(function(data, status, headers, config){
					_pushData.reject(status);
				});
			}
			return _pushData.promise;
		}

		return{
			create: createSO,
			listOfSO: getSOList,
			getSO: getSOData,
			getApiToken : getApi,
			getTemplates : getTemplates,
			getStreamData: getStreamData,
			push: pushStreamData,
		}

	}]);

soManagerAppServices.factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});