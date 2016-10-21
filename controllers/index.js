var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	console.log('holis');	
  	res.status(200).json({message: 'hola mundo'});
  	next();
});

module.exports = router;
