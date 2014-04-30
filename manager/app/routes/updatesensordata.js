/*
 * Delivers a Webpage for Update Sensor Data with Geocoords to COMPOSE
 */

 // required package for readFile
var fs = require('fs');
// path to JSON-File to create a service object
var jsonFile = __dirname + '/store.data';
// Your API Key
var API_KEY = 'N2M4ZDgxZjAtMGRiOC00MzI0LWJmYjEtZTBjNjZlNTRjZjUzOTcwYTE0NWMtMTIzMi00YTNiLWFiYWEtMmRhNmM1MDJiMDI2';

// Async-Load a JSON-Document to create a Service Object
var loadJsonFile = function(req, res, _storeData) {
  fs.readFile(jsonFile, function (err, thngDocument) {
      if (err) {
        console.log('Error: ' + err);
        return;
      } 
      //var data = JSON.parse(thngDocument);
      //_storeData = JSON.stringify(data);
      renderSite(req, res, thngDocument); 
  });
};

function renderSite(req, res, _storeData){
  res.render('updatesensordata', { title: 'Update Sensor Data',
                                   apikey: API_KEY,
                                   storeData: _storeData
                                 });
}

// enter script here by requesting GET /updatesensordata
exports.update = function(req, res){
  var storeData = '';
  loadJsonFile(req, res, storeData);
};