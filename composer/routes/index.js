
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Prototype Service Object Management Dashboard' });
};