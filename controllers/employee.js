var database = require('../database/database');
var express = require('express');
var orm = require('orm');
var router = express.Router();

/*Connection and set the employee's model to the request*/
router.use(orm.express(database.connectionString, {
  define: function(db, models){
    database.define(db);
    models.employee = db.models.employee;
  }
}));

/* GET employees listing. */
router.get('/', function(req, res, next) {
  console.log('GET: employees', req.body);
  req.models.employee.find({}, function(err, employees){
    if(employees){
      res.status(200).json({employees: employees});
    }else{
      res.status(404).json({error: 'Employees not found'});
    }
  });
});

/*GET a single employee. */
router.get('/:id', function(req, res, next){
	console.log('GET:id', req.params.id);
	if(!req.params.id){
		if(!req.body){
			res.status(403).json({error: true, message: 'Petition empty'});
		}
	}
	req.models.employee.get(req.params.id, function(err, employee){
		if(employee){
      res.status(200)
      .json({employee: employee});
    }else{
      res.status(404).json({error: true, message: 'Employee not found'});
    }
	});
});

router.post('/', function(req, res, next){
	console.log('POST: employee', req.body);
	if(!req.body){
    res.status(403).json({error: true, message: 'Petition empty'});
	}

  req.models.employee.create(req.body, function(err, createdItem){
    if(err){
      res.status(204).json({error: true, message: 'Error posting employee'});
    }
      res.status(201)
          .json({createdItem: createdItem});
  });

});

module.exports = router;