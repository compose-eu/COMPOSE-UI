/*
 * POST Create a Service Object - will produce a ServiceObject ID as response
 */

// Revealing Module Pattern for Information-Hiding and to build a clear API for calls
// p_* indicates that this is a private member and should not directly be accessable from outside
var CSOCreator = (function () {

        /****************************************************************************************
        // ---------------------- Private Members for Information Hiding ------------------------
        ****************************************************************************************/

         // import the required packages for readFile and sendRequest
        var fs = require('fs');
        var request = require('request');
        var configData = require('../config');     

        var p_createCompositeServiceObjectJSON = function() {
          var createCSOJSON =  '{'+
                '"name":"'+ req.query.name +'",'+
                '"description": "'+ req.query.description +'",'+
                '"streams": {'+
                  '"presence": {'+
                    '"channels": {'+
                      '"inside": {'+
                        '"current-value": "true",'+
                        '"type":"boolean"'+
                      '}'+
                    '}'+
                  '}'+
                '}'+
              '}';
          // create JSON-File for Service Object creation
          // regarding to various sensor types (loction (gps), orientation (gyroscope), ethernet)
          //_thngDocument = JSON.parse(createCSOJSON);
          return createCSOJSON;
        }

        // send a request to COMPOSE to create a service object and gets the response
        var p_sendRequest = function(req, res, _thngDocument){
          console.log(_thngDocument);
          // at first, configure the options for the request to COMPOSE
          var options = {
            method: 'POST',
              url: 'http://'+configData.getHost()+'/',
              headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  'Authorization': configData.getApiKey()
              },
              body: _thngDocument
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

        // renders the createCSO.jade to html page with content from COMPOSE
        var p_renderPage = function(req, res, composeResponse){
          res.render('subscribetocso', { title: 'Subscribe to Composite Service Object', composeRes: composeResponse });
        }

        /****************************************************************************************
        // --------------------------------- Public Functions -----------------------------------
        ****************************************************************************************/
 
        // public function for creating a new service object
        function createCSO(req, res) {
            p_sendRequest(req, res, p_createCompositeServiceObjectJSON(req, res));
        } 

        // public function for deliver only the WebPage without requesting a service object creation
        function deliverWebPage(req, res){
          p_renderPage(req, res, 'Subscribe to Composite Service Object...');
        }
 
        // Reveal public pointers to
        // private functions and properties 
        return {
            createCompositeServiceObject: createCSO,
            getWebPage: deliverWebPage
        };
 
    })();

        /****************************************************************************************
        // ------------------ enter script here by requesting /createCSO/* -----------------------
        ****************************************************************************************/
exports.subscribe = function(req, res){
  if(req.params[0] == "subscribe") {

    // USE valueObject related OBJECTS AS API FOR COMPOSE RELATED CALLS
    var CompositeServiceObject = require('../valueObjects/CompositeServiceObject');
    CompositeServiceObject.createSubscription( req, res, req.query.csoID, req.query.streamID, req.query.destination );

    //CSOCreator.createCompositeServiceObject(req, res);
  } else {
    CSOCreator.getWebPage(req, res);    
  }
};