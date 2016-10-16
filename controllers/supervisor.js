var database = require('../database/database');
var express = require('express');
var orm = require('orm');
var router = express.Router();
var opts = {
  database: "daily_app",
  protocol: "mysql",
  host: "localhost",
  port: 3306,
  user: "root",
  password: ""
}
/*Connection and set the supervisor's model to the request*/
router.use(orm.express(database.connectionString, {
  define: function(db, models){
    database.define(db);
    models.supervisor = db.models.supervisor;
  }
}));

/* GET: supervisors listing. */
router.get('/', function(req, res, next) {
  console.log('GET: supervisors', req.body);
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
	console.log('GET:id', req.body);
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
	console.log('GET: supervisors employees', req.params.id);
	if(!req.params.id){
		if(!req.body){
			res.status(403).json({error: true, message: 'Petition empty'});
		}
	}

	req.models.supervisor.get(req.params.id, function(err, supervisor){
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

	req.models.supervisor.create(req.body, function(err, createdItem){
		res.status(201)
			.json({createdItem: createdItem});
	});
});

module.exports = router;
