'use strict';

/* Controllers */

var soManagerAppControllers = angular.module('soManagerAppControllers', []);

//Controller for Main View of Smart Object Manager
soManagerAppControllers.controller('mngerCtrl', ['$scope','$rootScope','SmartObject',
  function($scope, $rootScope, SmartObject) {
      //***********************************
      //Retrieving of SmartObjects
      //************************************

      //First we need to retrieve the smartobject IDs of a given user
      //$scope.getsoIDs = SmartObject.listOfSO();
      $scope.smartobjects = [];
      SmartObject.listOfSO().then(function(dataArray){
        var soIDArray = dataArray;
        $scope.$apply(function () {
            $scope.smartobjects = dataArray; //reset Array
        });
        for(var i=0;i<soIDArray.length;i++){
          //Get JSON Object for each smartobject
          SmartObject.getSO(soIDArray[i]).then(function(smartObj){
            $scope.smartobjects.push(smartObj);
          });
        }
      });
}]);

//Controller for creating a new smart object
soManagerAppControllers.controller('createSOCtrl', ['$scope', 'SmartObject','$rootScope','$location','$timeout',
  function($scope, SmartObject, $rootScope, $location,$timeout) {
    $scope.headerText = 'Add Smart Object';
    $scope.subText = 'Please add a name and description.'
    $scope.smartObject = {};
    $scope.smartObject.soName = '';
    $scope.smartObject.description = '';
    $scope.smartObject.latitude = '';
    $scope.smartObject.longitude = '';
    $scope.success = false;
    $scope.sensorTemplates = SmartObject.getTemplates();
    $scope.selectedTemplate = "";

    $scope.createSO = function(){

      var newSO = SmartObject.create({
        "name": this.smartObject.soName,
        "description": this.smartObject.description,
        "sensorType": $scope.selectedTemplate
        //ToDo: Support Templates
      });
      //Redirect user after success to overview Page.
      newSO.then(function(status){
        if(status == 201){
          $scope.success = true;
          $timeout(function(){
            $location.path("/");
          }, 1500);
        }else{
          $scope.success = false;
          //ToDo: Handle SO Create Error
        }
      })
    }
}]);

soManagerAppControllers.controller('connectCtrl', ['$scope', 'SmartObject', '$routeParams',
 function($scope, SmartObject, $routeParams){
    $scope.smartObjectID = $routeParams.soid;
    $scope.streamName= $routeParams.stream;
    $scope.smartObjectName ="";
    $scope.connectedText = "This Device is connected successfully with the glue.things platform!";
    //Get SO Data
    SmartObject.getSO($scope.smartObjectID).then(function(smartObject){
      $scope.smartObjectName = smartObject.name;
    });     
 }]);



//Controller for showing Information of one Smart object
soManagerAppControllers.controller('showSOCtrl', ['$scope', 'SmartObject', 'socket','$routeParams', '$location','$interval',
  function($scope, SmartObject, socket, $routeParams, $location, $interval){
      //Variables
      $scope.headerText = 'Smart Object Manager';
      $scope.addSOText = 'Add Smart Object';
      $scope.smartObjectID = $routeParams.soid;
      $scope.smartobject = {};
      $scope.streamData = {};
      $scope.limitDateForData = ((new Date()).getTime()-30*24*60*60*1000);
      $scope.channelForData = {};
      $scope.chartLimit = 6;
      $scope.streamNames = []; //At the beginning only one stream exists Smart Object to Stream is a 1-to-1 relationship
      $scope.channelNames = [];
      $scope.showRaw = "";
      $scope.noData = false; //For the beginning, we assume that there is some sort of data available 
      $scope.orientation = [];
      $scope.showRawData = function(name){
        console.log(name);
        if($scope.showRaw == name){
          $scope.showRaw = "";
        }else{
          $scope.showRaw = name;
        }
      }   
      //Get SO Data
      SmartObject.getSO($scope.smartObjectID).then(function(smartObject){
          $scope.smartobject = smartObject;
          $scope.streamNames =  Object.keys($scope.smartobject.streams);
          $scope.qrData = {
            "text": window.location.origin + "/#/connect/"+$scope.smartObjectID+"/"+$scope.streamNames[0],
          } ;
      });
      $scope.$watchCollection('[smartobject, streamNames]', function(newValues){
        var smartobject = newValues[0];
        var streamNames = newValues[1];
        if(smartobject.id === $scope.smartObjectID && streamNames.length>0){//lets re-check if the retrieved object and smartobjectID are equal!
          //Subscribe for this phone!
          //socket.on('connect', function () { // TIP: you can avoid listening on `connect` and listen on events directly too!
            var socketData = {
              "soID": $scope.smartObjectID,
              "streamName": $scope.streamNames[0]
            };
            socket.emit('subscribe', socketData, function (data) {//simple success callback
              console.log(data); // data will be 'a string'
            });
          //});
          if(streamNames[0] === "orientation"){
            //Get SO Stream Data for gyroscope - only last value
            SmartObject.getStreamData($scope.smartObjectID, $scope.streamNames[0], "lastUpdate").then(function(data){
              if(data.data === undefined){
                //No Data there
                $scope.noData = true;
              }
              $scope.streamData = data.data;
                $interval(function(){
                  SmartObject.getStreamData($scope.smartObjectID, $scope.streamNames[0], "lastUpdate").then(function(data){
                  if(data.data === undefined){
                    //No Data there
                    $scope.noData = true;
                  }
                  $scope.streamData = data.data;
                }) } , 2000);

            });       
        } else if(streamNames[0] === "location"){
          //Get SO Stream Data for gps-sensor - get all values 
          SmartObject.getStreamData($scope.smartObjectID, $scope.streamNames[0], null).then(function(data){
              if(data.data === undefined){
                //No Data there
                $scope.noData = true;
              }
              $scope.streamData = data.data;
                $interval(function(){
                  SmartObject.getStreamData($scope.smartObjectID, $scope.streamNames[0], null).then(function(data){
                  if(data.data === undefined){
                    //No Data there
                    $scope.noData = true;
                  }
                  $scope.streamData = data.data;
                })} , 2000);

            });
        }
      }
      });

      $scope.apitoken = SmartObject.getApiToken();

      $scope.latitude  = {};
      $scope.latitude.data = {};
      $scope.latitude.type = "LineChart";
      $scope.latitude.options = {
          'title': '',
          'legend': {
            'position':'top',
          },
          'animation':{
            'duration': 1000,
            'easing': 'out',
          },
          'hAxis':{
            'title': 'Date'
          },
          'vAxis':{
            'title': 'Geo-Position'
          },
      };   
      $scope.longitude = {};
      $scope.longitude.data = {};
      $scope.longitude.type = "LineChart";
      $scope.longitude.options = {
          'title': '',
          'legend': {
            'position':'top',
          },
          'animation':{
            'duration': 1000,
            'easing': 'out',
          },
          'hAxis':{
            'title': 'Date'
          },
          'vAxis':{
            'title': 'Geo-Position'
          },
      };              
      //Data Retrieving (AJAX Calls HERE!)
      socket.on('updateSO', function(data){
        console.log(data);
      });
  $scope.$watch('streamNames', function(newVal, oldVal){
    var stream = newVal[0];
      if(stream !== "undefined"){

        if(newVal[0] === "location"){//Initialize stuff to plot Latitude, longitude          
          // //streamData changes
          $scope.$watchCollection('streamData', function(newVal){
            if(newVal.length > 0){
              var data = $scope.streamData;
              var latitudeArray = [];
              var longitudeArray = [];
              for( var i=0;i<data.length;i++){
                latitudeArray.push({"date": data[i].lastUpdate, "value": data[i].channels.latitude["current-value"]});
                longitudeArray.push({"date": data[i].lastUpdate, "value": data[i].channels.longitude["current-value"]});
              }
              //Create chart
              $scope.latitude.data = {"cols": [
                {id: "t", label: "Date", type: "date"},
                {id: "s", label: "Latitude", type: "number"},
                ], "rows": []};
              $scope.longitude.data = {"cols": [
                {id: "t", label: "Date", type: "date"},
                {id: "s", label: "Latitude", type: "number"},
                ], "rows": []};

              for(var i=data.length-1;i>=0;i--){
                var date = data[i].lastUpdate;
                if(date.toString().length === 10){
                  var rowLat = {c:[
                      {v: new Date(data[i].lastUpdate*1000)}, 
                      {v: data[i].channels.latitude["current-value"]},
                  ]};
                  var rowLong = {c:[
                        {v: new Date(data[i].lastUpdate*1000)}, 
                        {v: data[i].channels.longitude["current-value"]},
                    ]};
                }else{
                var rowLat = {c:[
                              {v: new Date(data[i].lastUpdate)}, 
                              {v: data[i].channels.latitude["current-value"]},
                          ]};
                var rowLong = {c:[
                                {v: new Date(data[i].lastUpdate)}, 
                                {v: data[i].channels.longitude["current-value"]},
                            ]};  

                }            
                $scope.latitude.data.rows.push(rowLat);
                $scope.longitude.data.rows.push(rowLong);
                $scope.noData = false;
              }


            }

           });
        }else if(newVal[0] === "orientation"){
          //Initialize things to show Gyroscope data!
          $scope.$watch('streamData', function(newVal, oldVal){

            if(newVal.length > 0){
                $scope.orientation = new Array();
                //For the beginning show Gyroscope data in raw format!
                for (var i = 0; i <newVal.length; i++) {
                  $scope.orientation.push({"x": newVal[i].channels.x["current-value"], "y": newVal[i].channels.y["current-value"], "z": newVal[i].channels.z["current-value"]})         
                };
            }
          });
        }
      }
  });
     
}]);
