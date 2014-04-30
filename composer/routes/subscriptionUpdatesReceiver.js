/*
 * Delivers a Webpage for Updates from Sensor Data with Geocoords to COMPOSE
 */
// Revealing Module Pattern for Information-Hiding and to build a clear API for calls
// p_* indicates that this is a private member and should not directly be accessable from outside
var updateReceiver = (function () {

        /****************************************************************************************
        // ---------------------- Private Members for Information Hiding ------------------------
        ****************************************************************************************/

         // import the required packages for configurations and to send Request
        var configData = require('../config');

        // container for data;
        var locationData

        // send a request to COMPOSE to create a service object and gets the response
        var p_receivedUpdates = function(req, res){

        	var data = [];
		  	for (var i = req.params.length - 1; i >= 0; i--) {
		  		data = req.params[i].split('/');
                locationData = { 
                                    "latitude": data[0],
                                    "longitude": data[1]
                                };
		  	};

            // answer COMPOSE-API-Server
            // Status 204 - No Content
            res.end(204); 
        };

        // forwarding Update-Data to Node in the COMPOSER 
        var p_provideUpdates4Composer = function() {
            return locationData;            
        }

        /****************************************************************************************
        // ---------------------------- Public Accessable Calls ---------------------------------
        ****************************************************************************************/
 
        // public function for creating a new service object
        function updatesHandler(req, res) {
            p_receivedUpdates(req, res);

            // print all updates to console
            for (var i = lat.length - 1; i >= 0; i--) {
            	console.log("Latitude: " +lat[i]+ "\t Longitude: " +lon[i]+ "\n");
            };
        }

        function deliverUpdates() {
            return p_provideUpdates4Composer();
        }
 
        // Reveal public pointers to
        // private functions and properties 
        return {
            receivedUpdates: updatesHandler,
            getUpdates: deliverUpdates
        };
 
    })();

        /****************************************************************************************
        // ------------ enter script here by requesting /showupdatesubscription/ ----------------
        ****************************************************************************************/
// enter script here by requesting GET /showupdatesubscription/
exports.receive = function(req, res){	
	if(req.params[0] == undefined || req.params[0] == '') {
    	res.end(404);
  } else {
	    updateReceiver.receivedUpdates(req, res);    
  }
};