/*
 * Delivers a Webpage for Update Sensor Data with Geocoords to COMPOSE
 */

// renders the template .jade files to html and transport the needed data for the site
function renderPage(req, res){
  res.render('showupdatesubscription', { title: 'Show Subscription Updates'});
}

function sendUpdate2Page(req, res, latitude, longitude) {
  res.send({ lat: latitude, log: longitude });
}

// enter script here by requesting GET /showupdatesubscription
exports.show = function(req, res){
  renderPage(req, res); 
};

// enter script here by requesting GET /showupdatesuscription
exports.update = function(req, res){
  var p = req.query.p;
  console.log(req.method + " proximity: " + p );
  console.log(req.body.p);
  res.send(204);
  //sendUpdate2Page(req, res, latitude, longitude); 
};