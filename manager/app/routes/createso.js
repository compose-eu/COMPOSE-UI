/*
 * POST Create a Service Object - will produce a ServiceObject ID as response
 */

 // import the required packages for readFile and sendRequest
var fs = require('fs');
var request = require('request');

// path to JSON-File to create a service object
var jsonFile = __dirname + '/app/routes/create.json';

// Your API Key
var API_KEY = 'N2M4ZDgxZjAtMGRiOC00MzI0LWJmYjEtZTBjNjZlNTRjZjUzOTcwYTE0NWMtMTIzMi00YTNiLWFiYWEtMmRhNmM1MDJiMDI2';

// Async-Load a JSON-Document to create a Service Object
var loadJsonFile = function(req, res, composeResponse) {
  fs.readFile(jsonFile, 'utf8', function (err, thngDocument) {
      if (err) {
        console.log('Error: ' + err);
        return;
      } 
      var data = JSON.parse(thngDocument);
      data = JSON.stringify(data);
  
      // after JSON-File for create a service object is loaded
      // perfrom the request to COMPOSE
      sendRequest(req, res, data, composeResponse);
  });
};

// send a request to COMPOSE to create a service object and gets the response
var sendRequest = function(req, res, _data, composeResponse){
  
  // at first, configure the options for the request to COMPOSE
  var options = {
    method: 'POST',
      url: 'http://testbed.compose-project.eu:8010/thngs/create.json',
      headers: {
          'content-type': 'application/json',
          'Authorization': API_KEY
      },
      body: _data
  };

  // sencondly, create the callback for the request to get
  // the response from the request to COMPOSE
  function callback(error, response, body, composeResponse) {
      if (!error && response.statusCode == 201) {
          composeResponse = response.statusCode + '\n' + body;

          // call res.render with the data in the response from COMPOSE
          getComposeResponse(req, res, composeResponse);
      }
  }

  // actually send the request and provide a callback to get the COMPOSE
  // response handled and shown on the webpage
  request(options, callback);  
};

// renders the createso.jade to html page with content from COMPOSE
var getComposeResponse = function(req, res, composeResponse){
  res.send(composeResponse);
}

// enter script here by requesting /createso
exports.create = function(req, res){
  var composeResponse = '';
  loadJsonFile(req, res, composeResponse);
};