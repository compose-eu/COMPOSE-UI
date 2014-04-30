/*
 * GET all Service Object ID - will show all Service Object ID's as response and
 * generate for each Service Object a Node for the Composer
 */

// Revealing Module Pattern for Information-Hiding and to build a clear API for calls
// p_* indicates that this is a private member and should not directly be accessable from outside
var SOConverter = (function () {

        /****************************************************************************************
        // ---------------------- Private Members for Information Hiding ------------------------
        ****************************************************************************************/

         // import the required packages for readFile and sendRequest
        var request = require('request');
        var configData = require('../config');
        var nodeBuilder = require('../nodeBuilder');
        var getSO = require('./getso');
        

        // send a request to COMPOSE to create a service object and gets the response
        var p_sendRequest = function(req, res){
          
          // at first, configure the options for the request to COMPOSE
          var options = {
            method: 'GET',
              url: 'http://'+configData.getHost()+'/',
              headers: {
                  'Authorization': configData.getApiKey()
              }
          };

          // sencondly, create the callback for the request to get
          // the response from the request to COMPOSE
          function callback(error, response, body) {
            var allServiceObjectIDs = "";

              if (!error && response.statusCode == 200) {

                  // if noe error occured and response is OK, insert further logic here

                  var serviceObjects = body.toString();
                  serviceObjects = serviceObjects.substring(1,serviceObjects.length-2).replace(/"/g,'').split(",");

                  // for each ID in response, getso() where the SO additionally gets converted
                  for (var i = serviceObjects.length - 1; i >= 0; i--) {
                    var soid = serviceObjects[i];
                    var returnServiceObject;

                    var count = (serviceObjects.length);

                    allServiceObjectIDs += serviceObjects[i]+" ";

                    // get Service Object by soID and convert it into a node for COMPOSER
                    getSO.convertServiceObject(req, res, soid, count);                      
                  }                  

                  res.send(response.statusCode, allServiceObjectIDs);
                    
              } else { // Satus: 404, 417, 419, 500, etc.

                // send all information foward to webpage for debug information
                res.send( body );
              }


          }

          // actually send the request and provide a callback to get the COMPOSE
          // response handled and shown on the webpage
          request(options, callback);
          
        };

        // renders the getso.jade to html page with content from COMPOSE
        var p_renderPage = function(req, res, instructions){
          res.render('getallsos', { title: 'Show All Service Object', text: instructions });
        }

        /****************************************************************************************
        // --------------------------------- Public Functions -----------------------------------
        ****************************************************************************************/
 
        // public function for creating a new service object
        function getAndConvertAllSOs(req, res) {
            p_sendRequest(req, res);
        } 

        // public function for deliver only the WebPage without requesting a service object creation
        function deliverWebPage(req, res){
          p_renderPage(req, res, 'Click the send button to get or the convert button to convert all Service Objects in Nodes for the composer');
        }
 
        // Reveal public pointers to
        // private functions and properties 
        return {
            convertServiceObjects: getAndConvertAllSOs,
            getWebPage: deliverWebPage
        };
 
    })();

        /****************************************************************************************
        // ------------------ enter script here by requesting /getallso/* -----------------------
        ****************************************************************************************/
exports.show = function(req, res){
  if(req.params[0] == "convert") {

    // synchron function calls, only re-initialize nodes after the convert progress is proceeded

        SOConverter.convertServiceObjects(req, res);
        //redNodes.load(configData.getSettings);

  } else if (req.params[0] == "show") {
    SOConverter.convertServiceObjects(req, res);
  } else {
    SOConverter.getWebPage(req, res);
  }
};

exports.convertAll = function() {
          var getSO = require('./getso');
          var request = require('request');
          var configData = require('../config');
          var nodeBuilder = require('../nodeBuilder');


          // at first, configure the options for the request to COMPOSE
          var options = {
            method: 'GET',
              url: 'http://'+configData.getHost()+'/',
              headers: {
                  'Authorization': configData.getApiKey()
              }
          };

          // sencondly, create the callback for the request to get
          // the response from the request to COMPOSE
          function callback(error, response, body) {
            var allServiceObjectIDs = "";

              if (!error && response.statusCode == 200) {

                  // if noe error occured and response is OK, insert further logic here

                  var serviceObjects = body.toString();
                  serviceObjects = serviceObjects.substring(1,serviceObjects.length-2).replace(/"/g,'').split(",");

                  // for each ID in response, getso() where the SO additionally gets converted
                  for (var i = serviceObjects.length - 1; i >= 0; i--) {
                    var soid = serviceObjects[i];
                    var returnServiceObject;

                    var count = (serviceObjects.length);

                    allServiceObjectIDs += serviceObjects[i]+" ";

                    // get Service Object by soID and convert it into a node for COMPOSER
                    //getSO.convertServiceObject(req, res, soid, count);  

                    // ----------------------------  Convert a Single SO !!!!!!!!!!!!!!!!!!!!!!!!
                    //-----------------------------------------------------------------------------

                    // at first, configure the options for the request to COMPOSE
                    var optionsSingleSO = {
                      method: 'GET',
                        url: 'http://'+configData.getHost()+'/'+soid,
                        headers: {
                            'Authorization': configData.getApiKey()
                        }
                    };

                    // sencondly, create the callback for the request to get
                    // the response from the request to COMPOSE
                    function callbackSingleSO(error, response, body) {
                      if (!error && response.statusCode == 200) {

                          // if noe error occured and response is OK, insert further logic here
                        
                            // convert a Service Object into a Node for the Composer
                            nodeBuilder.createServiceObjectNode(body, count); 
                          

                      }
                    }

                    // actually send the request and provide a callback to get the COMPOSE
                    // response handled and shown on the webpage
                    request(optionsSingleSO, callbackSingleSO);  

                  }                              
              } 
          }
          // actually send the request and provide a callback to get the COMPOSE
          // response handled and shown on the webpage
          request(options, callback);
}

