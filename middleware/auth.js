var jwt = require('jsonwebtoken');
var config = require('../config/config');

var auth = function(req,res,next){
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	if(token){
		jwt.verify(token, config.secret, function(err, decoded){
			if(err){
				res.status(403).json({error:true, message:err});
			}else{
				req.decoded = decoded;
				next()
			}
		});
	}else{
		res.status(403).json({error:true, messsage:'Login needed'});
	}
}

module.exports = auth;