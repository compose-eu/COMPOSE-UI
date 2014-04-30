/*
 * Value Objects for Composite Service Objects
 *
 * For an comfortable handling of Composite Service Objects in the COMPOSE DASHBOARD this Value Objects is a collection of all functionality.
 *
 * All further functionality should be accessed via this object. Therefore all necessary require-calls will included in this script-File
 * to make them accessable via one single entry point for all other further usage.
 */

var CompositeServiceObject = (function() {
	var configData = require('../config');

	var _id, _name, _description, _queries, _groups, _aliases, _preFilters,
		_streams, _postFilters, _actions, _links;

	// HTTP Method and uri for COMPOSE request
	var _method, _uri;

	// callback container for COMPOSE Response behaviour
	var success, failure;


	var createScaffoldJSON = function( _name, _description, _serviceObjectsList, callback){
		// create Composite Service Object on COMPOSE Plattform

		var createScaffoldJSON = 	{
										"name" : ""+_name,
										"description" : ""+_description,										
										"aliases" : "",
										"groups" : "",
										"streams" : "",
									};

		//callback(createScaffoldJSON);
		addAliases2ScaffoldJSON(createScaffoldJSON, _serviceObjectsList, callback);

	};

	var addAliases2ScaffoldJSON = function(_scaffoldJSON, _serviceObjectsList, callback) {

		_scaffoldJSON['aliases'] = 	[
								        { "@nearDistance@": "0.0001" },
								        { "@latitude@": "channels.latitude.current-value" },
								        { "@longitude@": "channels.longitude.current-value" },
								        { "@p@": "channels.p.current-value" },
								        { "@latDistance@": "{$group1.@latitude@} - {$group2.@latitude@}" },
								        { "@longDistance@": "{$group1.@longitude@} - {$group2.@longitude@}" },
								        { "@distance@": "Math.sqrt(Math.pow(@latDistance@, 2) + Math.pow(@longDistance@, 2))" }
								    ];

		//callback(_scaffoldJSON);
		
		addGroups2ScaffoldJSON(_scaffoldJSON, _serviceObjectsList, callback);
		
	};

	var addGroups2ScaffoldJSON = function(_scaffoldJSON, _serviceObjectsList, callback) {
		var soids = new Array();

		for (var i = 0; i <= _serviceObjectsList.length - 1; i++) {
			soids.push( _serviceObjectsList[i] );
		};
			

		_scaffoldJSON['groups'] = 	{
								        "group1": {
								            "soIds": [
								                soids[0]								            
								            ],
								            "stream": "location"
								        },
								        "group2": {
								            "soIds": [
								                soids[1]
								            ],
								            "stream": "location"
								        }
								    };

		//callback(_scaffoldJSON);
		buildCompositeServiceObjectStreams(_streams, _scaffoldJSON, _serviceObjectsList, callback);
	};

	var buildCompositeServiceObjectStreams = function( _streams ,_scaffoldJSON, _serviceObjectsList, callback) {

		var preFilterCondition = "";//"{$group1.}!=null && {$group2.}!=null";
		var postFilterCondition = "";//"{$proximity.} == null || {$proximity.channels.p.current-value} != {$@result@.channels.p.current-value}";

		// PRE- & POST-FILTER ARE STREAM SPECIFIC =>> HAVE TO BE PART OF Stream VARIABLE WITH CORRESPONDING VALUES !!!

		_scaffoldJSON['streams'] = 	{
								        "proximity": {
								            "pre-filter": ""+preFilterCondition,
								            "channels": {
								                "p": {
								                    "current-value": "@distance@",
								                    "type": "number"
								                }
								            },
								            "post-filter": ""+postFilterCondition
								        },
								        "near": {
								            "channels": {
								                "n": {
								                    "current-value": "{$proximity.@p@} <= @nearDistance@",
								                    "type": "boolean"
								                }
								            },
								            "post-filter": "{$near.} == null || {$near.channels.n.current-value} != {$@result@.channels.n.current-value}"
								        }
								    }

		callback(_scaffoldJSON);
	};

	this.deleteCSO = function(id) {
		var method = 'DELETE';
		var uri = '/'+id;



	};

	this.updateSensor = function() {
		// update Sensor post-filters to COMPOSE Plattform
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
									    "destination": "http://"+configData.getHost()+"/"+ _destination +"/@latitude@/@longitude@", 
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

		console.log('-->> '+subscriptionScaffold);
									

/*		var subscriptionJSONScaffold =  {
										    "type":"http.callback", 
										    "callbackUrl": _destinationUrl+"/showupdatesubscription/p", 
									        "method":"GET" 										     
										};
*/										



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
			    if(response.statusCode == 204) {
			    	myCallBack('');
			    } else {
			    	myCallBack(body);
			    }

			    console.log('\nrequest-function: '+response+'\n');

			    // call res.render with the data in the response from COMPOSE
			    //res.send(response.statusCode, body);
			}

		  	if(res != '') {
			  // send Response anyway (also at 403, 404, 417, 419, 500 )
			  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
			  process.nextTick(function(){
			  	res.send(response.statusCode, body)
			  });
			}
			//myCallBack('{ statusCode: '+response.statusCode+',content: '+body+' }');
		}

		// actually send the request and provide a callback to get the COMPOSE
		// response handled and shown on the webpage
		request(options, callback);  
    };

	/****************************************************************************************
    // ------------------------------ Control-Flow Functions --------------------------------
    ****************************************************************************************/

    // public function for creating a new service object
    function createCSO(req, res, _name, _description, _serviceObjectsList) {
    	createScaffoldJSON( _name, _description, _serviceObjectsList, function(data) {
			//console.log( JSON.stringify(data) + ' \n~~~~~>>> in CompositeServiceObject.js ... createCSO-function\n');
			request2COMPOSE( res, 'POST', '/', data, function(data) {
				subscribeToServiceObjects(req, res, data['id'], _serviceObjectsList, new Array("location", "location"), function(method, uri, subscriptionScaffold){
					request2COMPOSE( res, method, uri, subscriptionScaffold, function(data) {
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

    function updateCSO() {

    };

    function deleteCSO() {

    };

    function getCSO() {

    };

    function getCSOStreams() {

    };

    function createSubscription4CSO( req, res, _csoID, _streamID, _destination ) {
    	var uri = '/'+_csoID+'/streams/'+_streamID+'/subscriptions';

    	// build aliases from Object information
    	var _aliases = '';

    	console.log( _destination );

    	subscriptionOnCompositeServiceObject( _destination, _aliases, function(data) {
    		request2COMPOSE( res, 'POST', uri, data, function(data) {
    			console.log('\n\nCOMPOSE RES 4 CSO Subscription:\n\n' + data +'~~~~~>>> in CompositeServiceObject.js ... createSubscription4CSO-function\n')
    		});
    	});
    	

    };

    function subscribeToSO() {

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
		create : createCSO,
		delete : deleteCSO,
		update : updateCSO,
		get : getCSO,
		getStreams : getCSOStreams,
		getStreamData : getStoredStreamData,		
		createSubscription : createSubscription4CSO,
		subscribeToServiceObjects : subscribeToSO
	}

})();

// exports the CompositeServiceObject as usable Module
module.exports = CompositeServiceObject;