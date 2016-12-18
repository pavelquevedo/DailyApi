var database = require('../database/database');
var express = require('express');
var orm = require('orm');
var router = express.Router();
var config = require('../config/config');
var general = require('../config/general');

/*Connection and set the supervisor's model to the request*/
router.use(orm.express(database.connectionString, {
  define: function(db, models){
    database.define(db);
    models.supervisor = db.models.supervisor;
  }
}));

var crypto = require('crypto'),
	algorithm = 'aes-256-ctr',
	password = 'D41LY'


function encrypt(text){
	var cipher = crypto.createCipher(algorithm, password);
	var crypted = cipher.update(text, 'utf8', 'hex');
	crypted += cipher.final('hex');
	return crypted;
}

/*POST: A single supervisor*/
router.post('/', function(req, res, next){
	console.log('POST: supervisor', req.body);
	if(general.isEmptyObject(req.body)){
		res.status(403).json({error: true, message: 'Empty body'});
	}

	var newUser = {
		name: req.body.name,
		pass: encrypt(req.body.pass),
		active: req.body.active,
		email: req.body.email,
		cod_vehiculo: req.body.cod_vehiculo
	}

	req.models.supervisor.find({ email: req.body.email }, function(err, supervisors){
		if(supervisors.length > 0){
			res.status(200).json({message: 'Supervisor already exists'});
		}else{
			req.models.supervisor.create(newUser, function(err, createdItem){
				if(err) return next(err);
				res.status(201)
					.json(createdItem);
			});
		}
	});
});

module.exports = router;