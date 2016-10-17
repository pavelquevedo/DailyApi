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
				res.status(403).json({error:true, message: 'Wrong password'});
			}
		}else{
			res.status(403).json({error:true, message: 'Supervisor doesnt exists'});
		}	
	})
});

/* GET: supervisors listing. */
router.get('/', function(req, res, next) {
  console.log('GET: supervisors list', req.body);
	req.models.supervisor.find({}, function(err, supervisors){
	  	if(supervisors){
		  	res.status(200).json({supervisors: supervisors});
	  	}else{
	  		res.status(404).json({error: 'Supervisors not found'});
	  	}
  	});
});

/*GET: Single supervisor*/
router.get('/:id', function(req,res,next){
	console.log('GET: supervisor by ID', req.body);
	if(!req.params.id){
		if(!req.body){
			res.status(403).json({error: true, message: 'Petition empty'});
		}
	}
	req.models.supervisor.get(req.params.id, function(err, supervisor){
		if(supervisor){
			res.status(200).json({supervisor: supervisor});
		}else{
			res.status(403).json({error: true, message: 'Supervisor not found'});
		}
	})
});

/*GET: The supervisor's employees*/
router.get('/getEmployees/:id', function(req,res,next){
	console.log('GET: supervisors employees by ID', req.params.id);
	if(!req.params.id){
		if(!req.body){
			res.status(403).json({error: true, message: 'Petition empty'});
		}
	}

	req.models.supervisor.get(req.params.id, function(err, supervisor){
	    if(err) return next(err);
	    if(supervisor){
	    	supervisor.getEmployees(function(err, employees){
	      		if(employees){
	      			res.status(200).json({employees: employees});
	      		}else{
	      			res.status(403).json({error: true, message: 'Employees not found'});
	      		}
	    	});
	    }else{
	    	res.status(403).json({error: true, message: 'Supervisor not found'});
	    }
	});
});

/*POST: A single supervisor*/
router.post('/', function(req, res, next){
	console.log('POST: supervisor', req.body);
	if(!req.body){
		res.status(403).json({error: true, message: 'Empty body'});
	}

	var newUser = {
		name: req.body.name,
		pass: encrypt(req.body.pass),
		email: req.body.email
	}

	req.models.supervisor.find({ email: req.body.email }, function(err, supervisors){
		if(supervisors.length > 0){
			res.status(200).json({message: 'Supervisor already exists'});
		}else{
			req.models.supervisor.create(newUser, function(err, createdItem){
				if(err) return next(err);
				res.status(201)
					.json({createdItem: createdItem});
			});
		}
	});


});

/*DELETE: A single supervisor*/
router.delete('/:id', function(req, res, next){
	console.log('DELETE: supervisor by ID');
	if(!req.params.id){
		if(!req.body){
			res.status(403).json({error: true, message: 'Petition empty'});
		}
	}

	req.models.supervisor.get(req.params.id, function(err, supervisor){
		if(err) return next(err);
		if(supervisor){
			supervisor.remove(function(err){
				if(err) return next(err);
				res.status(200).json({message: 'Supervisor deleted'});
			})
		}else{
			res.status(403).json({error: true, message: 'Supervisor not found'});
		}
	});
});

module.exports = router;
