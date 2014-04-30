var configData = (function () {
 		
 		// API_KEY for all routes to embed in the corresponding COMPOSE-API requests
 		// p_* indicates that this is a private member and should not directly be accessable
        var p_API_KEY = 'API-key';
 		var p_host = 'api.servioticy.com';

        // Create the settings object
        var p_settings = {
            // path to find and load the nodes in the nodes directory
            httpRoot: "/red",
            // route to access the Composer UI
            httpAdminRoot:"/composer",
            // root url for nodes that provide HTTP endpoints. Default: ‘/’
            httpNodeRoot: "/api",
            // userDir must be empty / default otherwise the nodes 
            // nodes wouldn't be loaded                         <<<< FIX ME ( WHY ??? - ASK IN IRC )
            userDir:"" // /home/nol/.nodered/
        };
 
        function p_getApiKey() {
            return p_API_KEY;
        }

        function p_setApiKey(_newApiKey) {
            p_API_KEY = _newApiKey;

            // FIX ME WRITE NEW API_TOKEN TO FILE !!!!!!
        }

        function p_getHost() {
        	return p_host;
        }

        function p_getSettings() {
            return p_settings;
        }

        // --------------------------------------------------------------------
 
        function publicGetApiKey() {
            var data = p_getApiKey();
            return data;
        }

        function publicSetterApiKey(_newApiKey) {
            p_setApiKey(_newApiKey);
        }

        function publicGetHost() {
        	var data = p_getHost();
        	return data;
        }

        function publicGetSettings() {
            var data = p_getSettings();
            return data;
        }
 
 
        // Reveal public pointers to
        // private functions and properties
 
        return {
            getApiKey: publicGetApiKey,
            setApiKey: publicSetterApiKey,
            getHost: publicGetHost,
            getSettings: publicGetSettings
        };
 
    })();
module.exports = configData;