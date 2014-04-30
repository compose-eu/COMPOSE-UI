/*
 * POST Create a Service Object - will produce a ServiceObject ID as response
 */

// Revealing Module Pattern for Information-Hiding and to build a clear API for calls
// p_* indicates that this is a private member and should not directly be accessable from outside
var SOCreator = (function () {

        /****************************************************************************************
        // ---------------------- Private Members for Information Hiding ------------------------
        ****************************************************************************************/

         // import the required packages for readFile and sendRequest
        var fs = require('fs');
        var request = require('request');
        var configData = require('../config');        

        // Async-Load a JSON-Document to create a Service Object
        var p_loadCreateJsonScaffold = function(req, res) {
            var p_jsonFile = __dirname + '/create'+req.query.streams+'.json';
            fs.readFile(p_jsonFile, 'utf8', function (err, _thngDocument) {
                if (err) {
                  console.log('Error: ' + err);
                  return;
                }
                // after JSON-File for create a service object is loaded
                // perfrom the request to COMPOSE
                p_createServiceObjectJSON(req, res, _thngDocument);
            });
          
          
        };

        var p_createServiceObjectJSON = function( req, res, _thngDocument ) {
          // create JSON-File for Service Object creation
          // regarding to various sensor types (loction (gps), orientation (gyroscope), ethernet)
          _thngDocument = JSON.parse(_thngDocument);

          // TODO !!! add value into jsonfile before send request

          _thngDocument['name'] = req.query.name;
          _thngDocument['description'] = req.query.description;

          p_sendRequest(req, res, _thngDocument);
        }

        // send a request to COMPOSE to create a service object and gets the response
        var p_sendRequest = function(req, res, _thngDocument){
          
          // at first, configure the options for the request to COMPOSE
          var options = {
            method: 'POST',
              url: 'http://'+configData.getHost()+'/',
              headers: {
                  'content-type': 'application/json',
                  'Authorization': configData.getApiKey()
              },
              body: JSON.stringify(_thngDocument)
          };

          // sencondly, create the callback for the request to get
          // the response from the request to COMPOSE
          function callback(error, response, body) {
              if (!error && response.statusCode == 201) {

                  /*// parse service object id for easy update sensor data call
                  createdService = JSON.parse(body);
                  var responseURLForID =  "/updatesensordata?soid=" + createdService['id'];
                  var linkName = "Update Sensore Data to " + createdService['id'];
                  */

                  // call res.render with the data in the response from COMPOSE
                  //res.send(response.statusCode, body);
              }
              res.send(response.statusCode, body);
          }

          // actually send the request and provide a callback to get the COMPOSE
          // response handled and shown on the webpage
          request(options, callback);  
        };

        // renders the createso.jade to html page with content from COMPOSE
        var p_renderPage = function(req, res, composeResponse){
          res.render('createso', { title: 'Create Service Object', composeRes: composeResponse });
        }

        /****************************************************************************************
        // --------------------------------- Public Functions -----------------------------------
        ****************************************************************************************/
 
        // public function for creating a new service object
        function createSO(req, res) {
            p_loadCreateJsonScaffold(req, res);
        } 

        // public function for deliver only the WebPage without requesting a service object creation
        function deliverWebPage(req, res){
          p_renderPage(req, res, 'Create a Service Object...');
        }
 
        // Reveal public pointers to
        // private functions and properties 
        return {
            createServiceObject: createSO,
            getWebPage: deliverWebPage
        };
 
    })();

        /****************************************************************************************
        // ------------------ enter script here by requesting /createso/* -----------------------
        ****************************************************************************************/
exports.create = function(req, res){
  if(req.params[0] == "create") {
    SOCreator.createServiceObject(req, res);
  } else {
    SOCreator.getWebPage(req, res);    
  }
};