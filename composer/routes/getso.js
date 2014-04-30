/*
 * GET a Service Object - will show a ServiceObject as response
 */

// Revealing Module Pattern for Information-Hiding and to build a clear API for calls
// p_* indicates that this is a private member and should not directly be accessable from outside
var SOPresenter = (function () {

        /****************************************************************************************
        // ---------------------- Private Members for Information Hiding ------------------------
        ****************************************************************************************/

         // import the required packages for readFile and sendRequest
        var request = require('request');
        var configData = require('../config');
        var nodeBuilder = require('../nodeBuilder');

        // private vars
        var response_statusCode = "",
            response_body;

        // send a request to COMPOSE to create a service object and gets the response
        var p_sendRequest = function(req, res, soid, count, b_sendResponse, b_converting){

          // at first, configure the options for the request to COMPOSE
          var options = {
            method: 'GET',
              url: 'http://'+configData.getHost()+'/'+soid,
              headers: {
                  'Authorization': configData.getApiKey()
              }
          };

          // sencondly, create the callback for the request to get
          // the response from the request to COMPOSE
          function callback(error, response, body) {
            if (!error && response.statusCode == 200) {

                // if noe error occured and response is OK, insert further logic here
                
                if(b_converting == true) {
                  // convert a Service Object into a Node for the Composer
                  nodeBuilder.createServiceObjectNode(body, count); 
                }

            }
            if (b_sendResponse == true) {
              p_sendResponse2WebPage(res, response, body);
            }
          }

          // actually send the request and provide a callback to get the COMPOSE
          // response handled and shown on the webpage
          request(options, callback);  
        };

        // this function is used to encapsulate the COMPOSE-Request from the response to the requesting client
        var p_sendResponse2WebPage = function(res, composeResponse, body){
          // send all information foward to webpage for debug information
          res.send(composeResponse.statusCode, body);
        }

        // renders the getso.jade to html page with content from COMPOSE
        var p_renderPage = function(req, res, instructions){
          res.render('getso', { title: 'Show Service Object', text: instructions });
        }

        /****************************************************************************************
        // --------------------------------- Public Functions -----------------------------------
        ****************************************************************************************/
 
        // public function for creating a new service object
        function getSO(req, res, soid) {
            p_sendRequest(req, res, soid, 0, true, false);
        } 

        // public function for creating a new service object
        function convertSO(req, res, soid, count) {
            p_sendRequest(req, res, soid, count, false, true);
        } 

        // public function for deliver only the WebPage without requesting a service object creation
        function deliverWebPage(req, res){
          p_renderPage(req, res, 'Insert a Service Object ID and click the send button');
        }
 
        // Reveal public pointers to
        // public functions and properties 
        return {
            showServiceObject: getSO,
            convertServiceObject: convertSO,
            getWebPage: deliverWebPage,
        };
 
    })();

        /****************************************************************************************
        // ------------------ enter script here by requesting /getso/* -----------------------
        ****************************************************************************************/
exports.show = function(req, res){
  if(req.params[0] == "") {
    SOPresenter.getWebPage(req, res);
  } else {
    var soid = req.params[0];
    SOPresenter.showServiceObject(req, res, soid);
  }
};

exports.convertServiceObject = function(req, res, soid, count) {
  SOPresenter.convertServiceObject(req, res, soid, count);
}
