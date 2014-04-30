/*
 * Value Objects for Service Objects
 *
 * For an comfortable handling of Service objects in the COMPOSE DASHBOARD this Value Objects is a collection of all functionality.
 *
 * All further functionality should be accessed via this object. Therefore all necessary require-calls will included in this script-File
 * to make them accessable via one single entry point for all other further usage.
 */

var ServiceObject = (function(){
	var configData = require('../config');

	var _id, _name, _description, _url, _f_public, _created, _updated,
		_type, _data, _streams, _customFields, _actions, _properties;


		// HTTP Method and uri for COMPOSE request
	var _method, _uri;

	// callback container for COMPOSE Response behaviour
	var success, failure;


	var createScaffoldJSON = function( _name, _description, _serviceObjectsList, callback){
		// create Composite Service Object on COMPOSE Plattform

		var createScaffoldJSON = 	{  
									   "name": _name, 
									   "description": _description, 
									   "URL": "",
									   "public":"true",
									   "streams": {},
									   "customFields": {},
									   "actions": [],
									   "properties": []
									}

		//callback(createScaffoldJSON);
		addActions2ScaffoldJSON(createScaffoldJSON, _serviceObjectsList, callback);

	};

	var addActions2ScaffoldJSON = function(_scaffoldJSON, _serviceObjectsList, callback) {

		_scaffoldJSON['actions'] = 	[];

		//callback(_scaffoldJSON);
		
		addGroups2ScaffoldJSON(_scaffoldJSON, _serviceObjectsList, callback);
		
	};

	var addProperties2ScaffoldJSON = function(_scaffoldJSON, _serviceObjectsList, callback) {
			

		_scaffoldJSON['properties'] = [];

		//callback(_scaffoldJSON);
		addServiceObjectStreams( streams, _scaffoldJSON, _serviceObjectsList, callback);
	};

	var addServiceObjectStreams = function( streams,_scaffoldJSON, _serviceObjectsList, callback) {

		var orientation = 	{
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
						            "description": "Gyroskope Sensor.",
						            "type": "Sensor"
						        }
						    };

		var location = 	{
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
					            "description": "Location Sensor",
					            "type": "Sensor"
							}
						};

		_scaffoldJSON['streams'] = (streams === "location") ? location : orientation;

		callback(_scaffoldJSON);
	};

	this.deleteServiceObject = function(id) {
		var method = 'DELETE';
		var uri = '/'+id;



	};

	/*
	*	Method to send a Sensor Update to COMPOSE Back-End
	*
	*	Parameters:
	*		unixtime 	= the time in millis (since 1970) when the update is fired
	*		values 		= a JSON where the channel name is keys for the new current-value
	*/
	this.updateSensor = function( unixtime, values, myCallback ) {
		var updateScaffoldJSON = 	{
								    "channels": {
								        "latitude": {
								            "current-value": 50.818395,
								            "unit": "degrees"
								        },
								        "longitude": {
								            "current-value": 4.40313,
								            "unit": "degrees"
								        }
								    },
								    "lastUpdate": 1199192940
								};

		valueKeys = Object.keys( values );
		valueKeys.forEach( function ( valueChannel ) {
			updateScaffoldJSON['channels'][valueChannel]['current-value'] = values[valueChannel];
		});

		updateScaffoldJSON['lastUpdate'] = unixtime;

		myCallback(updateScaffoldJSON);
	};

	// destination is the url of the CSO itself
	// _serviceObjectsList is a list of soIDs of SOs
	// _serviceObjectsStreamList is a List of streamIDs of SOs
	var subscribeToServiceObjects = function(req, res, _destination, _serviceObjectsList, _serviceObjectsStreamList, myCallback) {
		var soids = new Array();
		var streamids = new Array();

		for (var i = 0; i <= _serviceObjectsList.length - 1; i++) {
			soids.push( _serviceObjectsList[i] );
		};

		for (var i = 0; i <= _serviceObjectsStreamList.length - 1; i++) {
			streamids.push( _serviceObjectsStreamList[i] );
		};

		// subscribe to all involved SO's
		var subscriptionScaffold =	{
									    "callback":"http", 
									    "destination": "http://"+configData.getHost()+"/"+ _destination +"?lat=@latitude@&lon=@longitude@", 
									    "customFields": { 
									        "aliases": [ 
									            { "##": "{$.channels.", "!!": ".current-value}" }, 
									            {"@latitude@": "##latitude!!"}, 
									            {"@longitude@": "##longitude!!"} 
									        ], 
									        "method":"GET" 
									    } 
									}

		for (var i = 0; i <= _serviceObjectsList.length - 1; i++) {

			var uri = '/'+soids[i]+'/streams/'+streamids[i]+'/subscriptions';
			var method = 'POST';

			myCallback(method, uri, subscriptionScaffold);

			//request2COMPOSE(req, res, method, uri, subscriptionScaffold, function(data) {
			//	console.log("\n\nCOMPOSE RESPONSE AFTER SUBSCRIPTION: \n\n"+data+" ~~~~~>>> in CompositeServiceObject.js ... subscribeToServiceObjects-function\n");
			//});
		};
		

	};

	this.subscriptionOnCompositeServiceObject = function( _destinationUrl, _aliases, callback ) {
		// create a subscription on this CSO for further useage

		// get channel from stream

		// build a generic subscription for _streams and corresponding channels

		var subscriptionJSONScaffold =  {
										    "callback":"http", 
										    "destination": _destinationUrl+"?@p@", 
										    "customFields": { 
										        "aliases": [ 
										            { 
										            	"##": "{$.channels.",
										            	"!!": ".current-value}"
										            }, 
										            {"@p@": "##p!!"}
										        ], 
										        "method":"GET" 
										    } 
										};

		// fire callback
		callback( subscriptionJSONScaffold );
	};

	this.convert2Node = function() {
		// convert Service Object to a Node for the Composer
	};

	this.showServiceObjectWebPage = function() {
		// delivers as WebPage for the Service Object in a HTML representation
	};

	/* builds and fires a acceptable request through the COMPOSE API with generic aspects
	*
	* req - req-Object
	* res - res-Object
	* _mehod - HTTP-Method to call
	* _uri - appendix for Host (see config.js)
	* _thngDocument - data for the body part of this Request
	* myCallBack - callback which is fired when the request success
	*
	*/
	this.request2COMPOSE = function( res, _method, _uri, _thngDocument, myCallBack){
		var request = require('request');
        var configData = require('../config');
          
		// at first, configure the options for the request to COMPOSE
		var options = {
		method: _method,
		  url: 'http://'+configData.getHost()+_uri,
		  headers: {
		      'Content-Type': 'application/json',
		      'Accept': 'application/json',
		      'Authorization': configData.getApiKey()
		  },
		  body: JSON.stringify(_thngDocument)
		};

		// sencondly, create the callback for the request to get
		// the response from the request to COMPOSE
		function callback(error, response, body) {
			if (!error && (response.statusCode == 201 || response.statusCode == 202 || response.statusCode == 204 || response.statusCode == 200)) {

			    //console.log( body + ' \n~~~~~>>> in CompositeServceObject.js ... request2Compose-function\n');
			    myCallBack(body);			    

			    console.log('\nrequest-function: '+response.statusCode+'\n'+body+'\n');

			    // call res.render with the data in the response from COMPOSE
			    //res.send(response.statusCode, body);
			}

		  	if(res != '') {
			  // send Response anyway (also at 403, 404, 417, 419, 500 )
			  res.send(response.statusCode, body);
			}
//			myCallBack(body);
		}

		// actually send the request and provide a callback to get the COMPOSE
		// response handled and shown on the webpage
		request(options, callback);  
    };

	/****************************************************************************************
    // ------------------------------ Control-Flow Functions --------------------------------
    ****************************************************************************************/

    // public function for creating a new service object
    function createSO(req, res, _name, _description, _serviceObjectsList) {
    	createScaffoldJSON( _name, _description, _serviceObjectsList, function(data) {
			//console.log( JSON.stringify(data) + ' \n~~~~~>>> in CompositeServiceObject.js ... createCSO-function\n');
			request2COMPOSE(req, res, 'POST', '/', data, function(data) {
				subscribeToServiceObjects(req, res, data['id'], _serviceObjectsList, new Array("location", "location"), function(method, uri, subscriptionScaffold){
					request2COMPOSE(req, res, method, uri, subscriptionScaffold, function(data) {
						console.log("\n\nCOMPOSE RESPONSE AFTER SUBSCRIPTION: \n\n"+data+" ~~~~~>>> in CompositeServiceObject.js ... subscribeToServiceObjects-function\n");
					});
				});
			});
    	});

        //request2COMPOSE(req, res, 'POST', '/', create(req.query.name, req.query.description));
    } 

    // public function for deliver only the WebPage without requesting a service object creation
    function deliverWebPage(req, res){
      p_renderPage(req, res, 'Create a Service Object...');
    }

    function updateSO() {

    };

    function deleteSO() {

    };

    function getSO() {

    };

    function getSOStreams() {

    };

    function createSubscription4SO( req, res, _csoID, _streamID, _destination ) {
    	var uri = '/'+_csoID+'/streams/'+_streamID+'/subscriptions';

    	// build aliases from Object information
    	var _aliases = '';

    	subscriptionOnCompositeServiceObject( _destination, _aliases, function(data) {
    		request2COMPOSE( req, res, 'POST', uri, data, function(data) {
    			console.log('\n\nCOMPOSE RES 4 CSO Subscription:\n\n' + data +'~~~~~>>> in CompositeServiceObject.js ... createSubscription4CSO-function\n')
    		});
    	});
    	

    };

    // timeModifier is lastUpdate because unixtime is not implemented yet
    function getStoredStreamData( soid, streamid, timeModifier, myCallback ) {
    	var uri = '/'+soid+'/streams/'+streamid+'/lastUpdate';
    	var method = 'GET';

    	request2COMPOSE( '', method, uri, '', myCallback );
    };

    /****************************************************************************************
    * --------------------------- Command 2 Control-Flow Mapping ---------------------------*
    ****************************************************************************************/

    // pubic API for calls from outside of the CompositeServiceObject module
	return {
		create : createSO,
		delete : deleteSO,
		update : updateSO,
		get : getSO,
		getStreams : getSOStreams,
		getStreamData : getStoredStreamData,		
		createSubscription : createSubscription4SO
	}

})();

module.exports = ServiceObject;