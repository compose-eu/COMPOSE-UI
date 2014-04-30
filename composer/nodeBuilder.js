/*
 * A builder object to build nodes for the composer (NODE-RED). 
 * In common a node is a tuple consisting of a .html and .js file.
 * th HTML-File is desired for the presentation in the composer, 
 * otherwise the JavaScript-File. This File is used to add functionality
 * to the node. 
 *
 * In our case, we only need to build HTML-Files for the (Composite)-
 * Service Objects to represent them in the composer.
 */

var nodeBuilder = (function() {

	var fs = require('fs');
	var configData = require('./config');
  	var redNodes = require('./node_modules/node-red/red/nodes.js');
  	var jsonPath = require('JSONPath');
  	var csoOperations = require('./valueObjects/CompositeServiceObject');
  	var soOperations = require('./valueObjects/ServiceObject');
	

	/****************************************************************************************
    // ---------------------- Private Members for Information Hiding ------------------------
    ****************************************************************************************/
	var _id, _name, _description, _f_public, _createdAt, _updatedAt, _streams, _actions, _properties;

	var streamsAsNodeHTMLs;
	var countServices = 0;
	var convertedServices = 0;

	// Service Object JSON Object keys
 	var _url, _type, _data, _customFields;

 	// Coposite Service Object firs level JSON Object keys
	var _queries, _groups, _aliases, _preFilters, _streams, _postFilters, _actions, _links;

	// example CSO to test the converting
	var exampleCSO = {"id":"1397569000792cf4a04ca78984fb5851a3cff748143cf","public":"false","createdAt":1397569000792,"updatedAt":1397569000792,"name":"Proximity","description":"distance between two location points","aliases":[{"@nearDistance@":"0.0001"},{"@latitude@":"channels.latitude.current-value"},{"@longitude@":"channels.longitude.current-value"},{"@p@":"channels.p.current-value"},{"@latDistance@":"{$group1.@latitude@} - {$group2.@latitude@}"},{"@longDistance@":"{$group1.@longitude@} - {$group2.@longitude@}"},{"@distance@":"Math.sqrt(Math.pow(@latDistance@, 2) + Math.pow(@longDistance@, 2))"}],"groups":{"group1":{"soIds":["1396275265656b8c171d9ac304b78bda76585be57e1e3"],"stream":"location"},"group2":{"soIds":["1396273741944ca6a58d285034e4aa1f44de546b31b33"],"stream":"location"}},"streams":{"proximity":{"pre-filter":"","channels":{"p":{"current-value":"@distance@","type":"number"}},"post-filter":"{$proximity.} == null || {$proximity.channels.p.current-value} != {$@result@.channels.p.current-value}"},"near":{"channels":{"n":{"current-value":"{$proximity.@p@} <= @nearDistance@","type":"boolean"}},"post-filter":"{$near.} == null || {$near.channels.n.current-value} != {$@result@.channels.n.current-value}"}}}

	// Parser for Service Objects in JSON-Format to parse them to variables
	// for further use in the node build process.
	var p_parseServiceObject2Vars = function( _serviceObject, _countServices ) {

		_serviceObject = JSON.parse(_serviceObject);
		countServices = _countServices;
		convertedServices++;

		// regex for: a arbitrary character except 0-9, a-z and A-Z
		// this regex filters all special characters
		var nameRegex = /[^0-9a-zA-Z]/;

		_id = _serviceObject['id'];
		_name = _serviceObject['name'];
		// check and parse the _name into a aceptable form with regex
		_name = _name.replace(nameRegex,"");
		_name = _name.replace(" ", "");
		_description = _serviceObject['description'];
		_createdAt = _serviceObject['createdAt'];
		_updatedAt = _serviceObject['updatedAt'];
		



		// CHeck if service Object is a COMPOSITE one
		// IMPORTANT for further operations during the node building process
		if( checkForCompositeServiceObject( _serviceObject ) ) {
			/**************************************************************
			 *   Node Building Operations for COMPOSITE SERVICE OBJECTS   *
			 **************************************************************/

			_groups = _serviceObject['groups'];
			_aliases = _serviceObject['aliases'];

			// get involved SO's - extract info for reprsentation in nodes

			// operations on data ( extract with aliases )

			// multiple streams extract info for representation

			// .js-File modify !



			var streamsAsNodeHTMLs = p_parseCompositeServiceObjectStreams2NodeHTML( _serviceObject, p_buildNodeHTMLFile );
			p_buildNodeJSFile(_serviceObject);


		} else {
			/**************************************************************
			 *        Node Building Operations for SERVICE OBJECTS        *
			 **************************************************************/



			_url = _serviceObject['URL'];			
			_type = _serviceObject['type'];
			_data = _serviceObject['data'];		
			_customFields = _serviceObject['customFileds'];
			

	        var streamsAsNodeHTMLs = p_parseServiceObjectStreams2NodeHTML( _serviceObject, p_buildNodeHTMLFile );
			p_buildNodeJSFile(_serviceObject);
		}

	};

	var checkForCompositeServiceObject = function ( _serviceObject ) {

		var isCSO = false;
		var result = jsonPath.eval( _serviceObject, '$.groups' );

		if( result != '' ) {
			isCSO = true;
		} else {
			isCSO = false;
		}

		return isCSO;
	}

	// parse Streams from JSON-data 2 Node-HTML
	var p_parseServiceObjectStreams2NodeHTML = function( _serviceObject, callback ) {

		// array wich contains 2 diffenrent html tags constelations
		// the first one is the part for the node-expanded-view
		// the second one is for further information and target the information
		// bar on the right side in the COMPOSER
		var streamsAsNodeHTMLs= ['',''];

		// HTML-Head for every Service Objects Node
		streamsAsNodeHTMLs[0] = '<div>'+'\n'+
					        		'<label>';

		streamsAsNodeHTMLs[1] = '<div>'+'\n'+
							        '<label>'+
							        	'<div>';

		// parse streams of a Service Objects
		var streams = _serviceObject['streams'];

		// get Stream names in streams in a Service Objects
		var streamNames = Object.keys( streams );
//		console.log( '\n\nstream names: '+streamNames );

		// exract channesl from specific Stream
		var channelsJSON;
		streamNames.forEach( function ( streamName ) {
			var stream = streams[ streamName ];
			channelsJSON = jsonPath.eval( stream,'$.channels' );

/*			var lastValues;
			soOperations.getStreamData(_id, streamName, '', function ( _lastValues ){
				lastValues = _lastValues;
//				console.log('so_lastValues response:'+lastValues);
			});
*/

//			console.log( 'channelsJSON: \n' +JSON.stringify( channelsJSON ) );

			var channels;
			channelsJSON.forEach( function (element) {
				// variable channels is a array and contains channel keys
				channels = Object.keys( element );
//				console.log( 'channels in '+streamName+': '+channels );
				// ea channel in channels build html-stuff and query lastupdate value !
			});

//			for (var i = 0; i < streamNames.length; i++) {
				var streamType = streams[streamName]['type'];
	//			console.log( 'stream type: ' +streamType );

				var streamDescription = streams[streamName]['description'];
	//			console.log( 'stream description: ' +streamDescription );
				// HTML-Tags for the expanded NODE-View
	    		streamsAsNodeHTMLs[0] = streamsAsNodeHTMLs[0].concat('<div style="box-sizing:border-box; -moz-box-sizing:border-box; width:100%; float:left;">'+
						        								'Stream: <strong>' +streamName+ '</strong> '+
											        			'</div>'+
													        	'<div style="box-sizing:border-box; -moz-box-sizing:border-box; width:100%; float:left;">'+
													        		'Channels: ');

				// additional infromation for the Help-Text in the information-bar on the right side on thr COMPOSER
				
		        streamsAsNodeHTMLs[1] = streamsAsNodeHTMLs[1].concat('<p> Stream name: <strong>' +streamName+ '</strong></p>' +
														        	'<p> Stream type: ' +streamType+ '</p><p> Stream description: ' +streamDescription+ '</p>'+
														        	'<p> Channels: </p>');

	//	        console.log( '\n\nin for loop before foreach channels: ' + csoStreamsAsNodeHTMLs[0] );

	//			for (var j = 0; j < channels.length; j++) {
				channels.forEach( function (channelsElement) {
					channelType = jsonPath.eval( streams, '$.'+streamNames+'.channels.'+channelsElement+'.type' );
					channelUnit = jsonPath.eval( streams, '$.'+streamNames+'.channels.'+channelsElement+'.unit' );

	//				console.log( 'channeltype: '+ channelType+ ' channelUnit: '+ channelUnit );

/*					var lastValue;
					if(lastValues != '' || lastValues != undefined ) {
						lastValue = jsonPath.eval( lastValues['data'][0], '$.channels.'+channelsElement+'.current-value' );
						console.log('\n\nlastValue: '+lastValue+'\n');
					} else {						
						lastValue = 'no value available yet!';
					}
*/

					// concat the channels and the corrsponding values
					// change channelType & channelUnit with lastUpdated Values if some exists
					streamsAsNodeHTMLs[0] = streamsAsNodeHTMLs[0].concat( channelsElement+ ' = ' + 'get.lastValue() ' );
					streamsAsNodeHTMLs[1] = streamsAsNodeHTMLs[1].concat( '<p> '+channelsElement+ ' is a ' +channelType+ ' in ' +channelUnit+' </p>' );

	//				console.log( '\n## NODE_channels concat: ' +streamsAsNodeHTMLs[0].concat( +channelsElement+ ' : ' + 'get.LASTVALUE()! ' ) );									        				
				});

				streamsAsNodeHTMLs[0] = streamsAsNodeHTMLs[0].concat( '</div>' );

//			};

		});		

//		console.log( '\n\n AFTER foreach channels: ' + csoStreamsAsNodeHTMLs[0] );

		// write the missing closing tags
		streamsAsNodeHTMLs[0] = streamsAsNodeHTMLs[0].concat('</label>'+'\n'+'</div>'+'\n');
		streamsAsNodeHTMLs[1] = streamsAsNodeHTMLs[1].concat('</label>'+'\n'+'</div>'+'\n');
		
		callback( streamsAsNodeHTMLs, _serviceObject );
				
	};

	// parse Streams from JSON-data 2 Node-HTML
	var p_parseCompositeServiceObjectStreams2NodeHTML = function( _serviceObject, callback ) { 

		// array wich contains 2 diffenrent html tags constelations
		// the first one is the part for the node-expanded-view
		// the second one is for further information and target the information
		// bar on the right side in the COMPOSER
		var csoStreamsAsNodeHTMLs= ['',''];

		// HTML-Head for every Service Objects Node
		csoStreamsAsNodeHTMLs[0] = '<div>'+'\n'+
					        		'<label>';

		csoStreamsAsNodeHTMLs[1] = '<div>'+'\n'+
							        '<label>'+
							        	'<div>';

		// parse streams of a Service Objects
		var streams = _serviceObject['streams'];

		// get Stream names in streams in a Service Objects
		var streamNames = Object.keys( streams );
//		console.log( '\n\nstream names: '+streamNames );

		// exract channesl from specific Stream
		var channelsJSON;
		streamNames.forEach( function ( streamName ) {
			var stream = streams[ streamName ];
			channelsJSON = jsonPath.eval( stream,'$.channels' );

/*			var lastValues;
			csoOperations.getStreamData(_id, streamName, '', function ( _lastValues ){
				console.log('# cso lastValues: '+_lastValues);
				if(_lastValues == undefined) {
					lastValues = 'no value available yet!'
				} else {
					lastValues = _lastValues;
				}
			});
*/

//			console.log( 'channelsJSON: \n' +JSON.stringify( channelsJSON ) );

			var channels;
			channelsJSON.forEach( function (element) {
				// variable channels is a array and contains channel keys
				channels = Object.keys( element );
//				console.log( 'channels in '+streamName+': '+channels );
				// ea channel in channels build html-stuff and query lastupdate value !
			});

//			for (var i = 0; i < streamNames.length; i++) {
				var streamType = streams[streamName]['type'];
	//			console.log( 'stream type: ' +streamType );

				var streamDescription = streams[streamName]['description'];
	//			console.log( 'stream description: ' +streamDescription );
				// HTML-Tags for the expanded NODE-View
	    		csoStreamsAsNodeHTMLs[0] = csoStreamsAsNodeHTMLs[0].concat('<div style="box-sizing:border-box; -moz-box-sizing:border-box; width:100%; float:left;">'+
						        								'Stream: <strong>' +streamName+ '</strong> '+
											        			'</div>'+
													        	'<div style="box-sizing:border-box; -moz-box-sizing:border-box; width:100%; float:left;">'+
													        		'Channels: ');

				// additional infromation for the Help-Text in the information-bar on the right side on thr COMPOSER
				
		        csoStreamsAsNodeHTMLs[1] = csoStreamsAsNodeHTMLs[1].concat('<p> Stream name: <strong>' +streamName+ '</strong></p>' +
														        	//'<p> Stream type: ' +streamType+ '</p><p> Stream description: ' +streamDescription+ '</p>'+
														        	'<p> Channels: </p>');

	//	        console.log( '\n\nin for loop before foreach channels: ' + csoStreamsAsNodeHTMLs[0] );

	//			for (var j = 0; j < channels.length; j++) {
				channels.forEach( function (channelsElement) {
					channelType = jsonPath.eval( streams, '$.'+streamNames+'.channels.'+channelsElement+'.type' );
					channelUnit = jsonPath.eval( streams, '$.'+streamNames+'.channels.'+channelsElement+'.unit' );

	//				console.log( 'channeltype: '+ channelType+ ' channelUnit: '+ channelUnit );

					// concat the channels and the corrsponding values
					// change channelType & channelUnit with lastUpdated Values if some exists
					csoStreamsAsNodeHTMLs[0] = csoStreamsAsNodeHTMLs[0].concat( channelsElement+ ' = ' + 'get.LASTVALUE()! ' );
					csoStreamsAsNodeHTMLs[1] = csoStreamsAsNodeHTMLs[1].concat( '<p> '+channelsElement+ ' is a ' +channelType+ ' in ' +channelUnit+' </p>' );

	//				console.log( '\n## NODE_channels concat: ' +streamsAsNodeHTMLs[0].concat( +channelsElement+ ' : ' + 'get.LASTVALUE()! ' ) );									        				
				});

				csoStreamsAsNodeHTMLs[0] = csoStreamsAsNodeHTMLs[0].concat( '</div>' );

//			};

		});		

//		console.log( '\n\n AFTER foreach channels: ' + csoStreamsAsNodeHTMLs[0] );

		// write the missing closing tags
		csoStreamsAsNodeHTMLs[0] = csoStreamsAsNodeHTMLs[0].concat('</label>'+'\n'+'</div>'+'\n');
		csoStreamsAsNodeHTMLs[1] = csoStreamsAsNodeHTMLs[1].concat('</label>'+'\n'+'</div>'+'\n');
		
		callback( csoStreamsAsNodeHTMLs, _serviceObject );
		

	};

	var p_parseActions = function( actions ){
		// parse actions
		return actions;
	};

	var p_parseCustomFields = function( costumFields ){
		// parse CustomFields
		return costumFields;
	};

	var p_parseProperties = function( properties ){
		// parse properties
		return properties;
	};

	// converts the unix time as milliseconde since 1970/01/01 to a normal Date format
	var p_calculateDateFromUnix = function( unixtime ){
		return new Date(unixtime);
	};

	// Builder for the Node HTML-File
	// uses the information about a servic object to insert them in the
	// html representation to display them inside the composer in the corresponding
	// node. 
	var p_buildNodeHTMLFile = function( streamsAsNodeHTMLs, _serviceObject ) {

//		console.log( '\n\n>> '+streamsAsNodeHTMLs[0] ); 
		
		var html_Scaffold_serviceObject = 

		// expanded Node-View

		'<script type="text/x-red" data-template-name=\"'+( checkForCompositeServiceObject(_serviceObject) ? ("CSO_"+_name) : _name )+'\">'+'\n'+
		    '<div style="width=100%;">'+'\n'+
		        '<label>'+
        			'<strong>'+ ( checkForCompositeServiceObject(_serviceObject) ? ("CSO "+_name) : _name ) +'</strong>'+
	        	'</label>'+'\n'+
		    '</div>'+'\n'+
		    '<div>'+'\n'+
		        '<label>'+
		        	'<div style="box-sizing:border-box; -moz-box-sizing:border-box; width:100%; float:left;">'+
		        		'Description: '+_description+
		        	'</div>'+
	        	'</label>'+'\n'+
		    '</div>'+'\n'+
		    '<div>'+'\n'+
		        '<label>'+
		        	'<div style="box-sizing:border-box; -moz-box-sizing:border-box; width:100%; float:left;">'+
		        		'created at: '+ p_calculateDateFromUnix( _createdAt )+
	        		'</div>'+
        		'</label>'+'\n'+
		    '</div>'+'\n'+
		    streamsAsNodeHTMLs[0]+'\n'+
		'</script>'+'\n'+

		// information-bar section

		'<script type="text/x-red" data-help-name=\"'+( checkForCompositeServiceObject(_serviceObject) ? ("CSO_"+_name) : _name )+'\">'+'\n'+
		    '<p>Service description: '+_description+'</p>'+'\n'+
		    '<p>Service ID: '+_id+'</p>'+'\n'+
		    '<p>last upddated at: '+ p_calculateDateFromUnix( _updatedAt )+'</p>'+'\n'+
		    streamsAsNodeHTMLs[1]+'\n'+
		'</script>'+'\n'+

		// additional javascript for some properties

		'<script type="text/javascript">'+'\n'+
		    'RED.nodes.registerType(\''+( checkForCompositeServiceObject(_serviceObject) ? ("CSO_"+_name) : _name )+'\',{'+'\n'+
		        'category: \'input\','+'\n'+
		        'defaults: {'+'\n'+
		            'name: {value:\''+( checkForCompositeServiceObject(_serviceObject) ? ("CSO_"+_name) : _name )+'\'},'+'\n'+
		        '},'+'\n'+
		        'color:"Silver",'+'\n'+
		        'inputs:0,'+'\n'+
		        'outputs:1,'+'\n'+
		        'icon: "hash.png",'+'\n'+
		        'label: function() {'+'\n'+
		            'return this.name;'+'\n'+
		        '},'+'\n'+
		        'labelStyle: function() {'+'\n'+
		            'return this.name?"node_label_italic":"";'+'\n'+
		        '},'+'\n'+
		        'oneditprepare: function() {'+'\n'+
		            '/* insert here some edit functionalities for specific */'+'\n'+
		            '/* tags, accessed via IDs */'+'\n'+
		        '}'+'\n'+
		    '});'+'\n'+
		'</script>';

		p_saveAsFile(html_Scaffold_serviceObject, ".html", _serviceObject);
	};

	var p_buildNodeJSFile = function(_serviceObject) {
		var js_Scaffold_serviceObject = 
		'var RED = require(process.env.NODE_RED_HOME+"/red/red");\n'+
		'function '+( checkForCompositeServiceObject(_serviceObject) ? ("CSO_"+_name) : _name )+'(n) {\n'+
		    'RED.nodes.createNode(this,n);\n'+
		    'this.topic = n.topic;\n'+
		    'var msg = {};\n'+
		    'msg.topic = this.topic;\n'+
		    'msg.payload = \"'+_description+'\"\n'+
		    'this.send(msg);\n'+
		    'this.on("close", 	function() {\n'+
								'});\n'+
		'}\n'+
		'RED.nodes.registerType(\"'+( checkForCompositeServiceObject(_serviceObject) ? ("CSO_"+_name) : _name )+'\",'+( checkForCompositeServiceObject(_serviceObject) ? ("CSO_"+_name) : _name )+');';

		p_saveAsFile(js_Scaffold_serviceObject, ".js", _serviceObject);
	}

	// writes the dynamic generated html representation of a service objects
	// as file into the for node-red corresponding node directory.
	// Object is to get service objects as nodes usable in the composer.
	var p_saveAsFile = function( nodeHTML, extension, _serviceObject ) {

		// fs.save as HTML-File in the node-red node directory
		var path = "./node_modules/node-red/nodes/custom/";
		var fileName = path+( checkForCompositeServiceObject(_serviceObject) ? ("CSO_"+_name) : _name )+'_'+_id+extension;

		fs.writeFile(fileName, nodeHTML, function (err) {
			if (err) throw err;

			//console.log('\"' +_name+'\" got\'s converted! countServices:'+countServices+' convertedServices: '+convertedServices);

			

			if(countServices <= convertedServices) {
				fs.exists(fileName, function(exists) {
					if(exists) {
						//re-init
						redNodes.load(configData.getSettings);
						convertedServices = 0;
					}
				});
			}
		
		});

	};

	/****************************************************************************************
    // --------------------------------- Public Functions -----------------------------------
    ****************************************************************************************/

    // public function for creating a new service object
    function createSONode( serviceObject, countServices ) {
        p_parseServiceObject2Vars( serviceObject, countServices );
    }

    // Reveal public pointers to
    // private functions and properties 
    return {
        createServiceObjectNode: createSONode,
    };
	

})();

module.exports = nodeBuilder;