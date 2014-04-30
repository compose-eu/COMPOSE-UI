/*
 * Delivers a Webpage for Update Sensor Data with Geocoords to COMPOSE
 */

 // required package for readFile
var fs = require('fs');
var request = require('request');
var configData = require('../config');

// path to JSON-File to create a service object
var jsonFile = __dirname + '/store.data';

// Async-Load a JSON-Document to create a Service Object
var loadJsonFile = function(req, res, soid) {
  fs.readFile(jsonFile, function (err, thngDocument) {
      if (err) {
        console.log('Error: ' + err);
        return;
      }       
      // send plain object for operations abillity in browserscript
      renderPage(req, res, thngDocument, soid);       
  });
};

/*
// send a request to COMPOSE to create a service object and gets the response
var sendRequest = function(req, res, soid, streamid, longitude, latitude, thngDocument){
  
  // need to parse thngDocument to access attributes
  thngDocument = JSON.parse(thngDocument);

  // insert new data to corresponding JSON-File attributes
  thngDocument.channels[0]['current-value'] = longitude;
  thngDocument.channels[1]['current-value'] = latitude;

  // To update sensor data a put request is claimed 
  // firstly we configure the options for the request to COMPOSE with needed headers, url and data (JSON-File)
  var options = {
    method: 'PUT',
      url: 'http://testbed.compose-project.eu:8010/thngs/' +soid+ '/streams/' +streamid+ '/store.data',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': API_KEY          
      },
      body: JSON.stringify(thngDocument)
  };

  // sencondly, create the callback for the request to get
  // the response from COMPOSE of the put request
  function callback(error, response, body) {
      // If no error occurs send the COMPOSE Response
      if (!error) {
          var composeResponse = response.statusCode + '\n' + body;
          res.send(composeResponse);
          
      } 
  }

  // actually sends the request to COMPOSE with options and callback as defined above
  request(options, callback);  
};
*/

// renders the template .jade files to html and transport the needed data for the site
function renderPage(req, res, _storeData, soid) {
  res.render('updatesensordata', { title: 'Update Sensor Data', apikey: configData.getApiKey(), _storeData: _storeData, _soid: soid });
}

// enter script here by requesting GET /updatesensordata
exports.update = function(req, res) {
  var soid = req.query.soid;
  if(soid == undefined) {
    soid = "";
  }
  loadJsonFile(req, res, soid); 
};