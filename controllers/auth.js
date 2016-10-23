var database = require('../database/database');
var express = require('express');
var orm = require('orm');
var router = express.Router();
var jwt = require('jsonwebtoken');
var config = require('../config/config');


var crypto = require('crypto'),
	algorithm = 'aes-256-ctr',
	password = 'D41LY'


function encrypt(text){
	var cipher = crypto.createCipher(algorithm, password);
	var crypted = cipher.update(text, 'utf8', 'hex');
	crypted += cipher.final('hex');
	return crypted;
}

function decrypt(text){
	var decipher = crypto.createDecipher(algorithm, password);
	var dec = decipher.update(text, 'hex', 'utf8');
	dec += deipher.final('utf8');
	return dec;
}

/*Connection and set the supervisor's model to the request*/
router.use(orm.express(database.connectionString, {
  define: function(db, models){
    database.define(db);
    models.supervisor = db.models.supervisor;
  }
}));

/*GET: Supervisor login*/
router.post('/login', function(req, res, next){
	console.log('GET: supervisor login', req.body);
	if(!req.body){
		res.status(403).json({error:true, message: 'Body empty'});
	}
	req.models.supervisor.find({email: req.body.email}, function(err, supervisors){
		if(err) return next(err);
		if(supervisors.length > 0){
			var supervisor = supervisors[0];
			if(supervisor.pass == encrypt(req.body.pass)){
				var token = jwt.sign(supervisor, config.secret, {
					expiresIn: '24hr'
				});

				res.status(201).json({token: token});	
			}else{
				res.status(200).json({error:true, message: 'Wrong password'});
			}
		}else{
			res.status(200).json({error:true, message: 'Supervisor doesnt exists'});
		}	
	})
});

module.exports = router;