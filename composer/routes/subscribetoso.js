/*
 * POST Create a Service Object - will produce a ServiceObject ID as response
 */

 // import the required packages for readFile and sendRequest
var fs = require('fs');
var request = require('request');

// import the required packages for configurations and to send Request
var configData = require('../config');

// path to JSON-File to create a service object
var jsonFile = __dirname + '/subscriptions.data';

// Async-Load a JSON-Document to create a Service Object
var loadJsonFile = function(req, res, soid, streamid) {
 	fs.readFile(jsonFile, 'utf8', function (err, thngDocument) {
  		if (err) {
    		console.log('Error: ' + err);
	    	return;
  		} 
  		renderPage(req, res, thngDocument);
  
      // after JSON-File for create a service object is loaded
      // perfrom the request to COMPOSE
  		//sendRequest(req, res, data, soid, streamid);
	});
};

/*
// send a request to COMPOSE to create a service object and gets the response
var sendRequest = function(req, res, _data, soid, streamid){
	var host = "http://testbed.compose-project.eu";
  var port = "8010";
  var uri = "/thngs/" +soid+ "/streams/" +streamid+ "/subscriptions";

  // at first, configure the options for the request to COMPOSE
	var options = {
		  method: 'POST',
   		url: host+':'+port+uri,
    	headers: {
        	'Content-Type': 'application/json',
        	'Authorization': API_KEY
    	},
    	body: JSON.stringify(_data)
	};

  // sencondly, create the callback for the request to get
  // the response from the request to COMPOSE
	function callback(error, response, body) {
    	if (!error) {
          var composeResponse = response.statusCode + '\n' + body;

          // call res.render with the data in the response from COMPOSE
          res.send(composeResponse);
    	}

      if (error && response.statusCode != 201) {
        res.send("Oops, problem creating the subscription. Error: "+response.statusCode+" \n "+body);
      }
	}

	request(options, callback);  
};
*/

// renders the createso.jade to html page with content from COMPOSE
var renderPage = function(req, res, _subscriptions){
  res.render('subscribetoso', { title: 'Subscribe to a Service Object', apikey: configData.getApiKey(), _subscriptions: _subscriptions });
}

// enter script here by GET requesting /createso
exports.subscribe = function(req, res){    
    loadJsonFile(req, res);
};

