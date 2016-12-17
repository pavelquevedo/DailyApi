var database = require('../database/database');
var express = require('express');
var orm = require('orm');
var router = express.Router();
var general = require('../config/general');
var _ = require('lodash');


/*Connection and set the employee's model to the request*/
router.use(orm.express(database.connectionString, {
  define: function(db, models){
    database.define(db);
    models.employee = db.models.employee;
    models.driver = db.driver;
  }
}));

/*GET: employees top days/week*/
router.get('/topDaysWeek/:id', function(req, res, next) {
  console.log('GET: employees top days/week', req.body);
  if (!req.params.id) {
    res.status(403).json({error: true, message: 'Petition empty'}); 
  }else{
    var query = 'SELECT CAST(dd.insert_date as date) daily_date, sum(dd.trees) trees FROM daily_detail dd '+
                'INNER JOIN daily_employee de ON de.daily_id = dd.daily_id and de.employee_id = dd.employee_id '+
                'WHERE de.employee_id = '+req.params.id+' GROUP BY de.employee_id, CAST(dd.insert_date as date) LIMIT 5';
      //Exec query  
      console.log(query);
      req.models.driver.execQuery(query, function(err, data){
        if(err){
          res.status(204);
        }else{
          res.status(200).json(data);
        }
      });
  }
});

/*GET: employees top tree_types*/
router.get('/topTreeTypes/:id', function(req, res, next) {
  console.log('GET: employees top tree_type', req.body);
  if (!req.params.id) {
    res.status(403).json({error: true, message: 'Petition empty'}); 
  }else{
    var query = 'SELECT tt.name as tree_type, SUM(dd.trees) trees FROM daily_detail dd '+
                'INNER JOIN daily d ON d.id = dd.daily_id '+
                'INNER JOIN contract c ON c.id = d.contract_id '+
                'INNER JOIN tract t ON t.contract_id = c.id '+
                'INNER JOIN tree_type tt ON tt.id = t.tree_type_id '+
                'INNER JOIN employee e ON e.id = dd.employee_id '+
                'WHERE e.id = '+req.params.id+' GROUP BY tt.id LIMIT 5';
      //Exec query  
      console.log(query);
      req.models.driver.execQuery(query, function(err, data){
        if(err){
          res.status(204);
        }else{
          res.status(200).json(data);
        }
      });
  }
});

/* GET employees listing. */
router.get('/', function(req, res, next) {
  console.log('GET: employees', req.body);
  req.models.employee.find({}, function(err, employees){
    if(employees){
      employees = _.filter(employees, {'active': true});
      console.log(employees);
      res.status(200).json(employees);
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
      .json(employee);
    }else{
      res.status(404).json({error: true, message: 'Employee not found'});
    }
	});
});

/**POST a single employee*/
router.post('/', function(req, res, next){
	console.log('POST: employee', req.body);
	if(general.isEmptyObject(req.body)){
    res.status(403).json({error: true, message: 'Petition empty'});
	}

  req.models.employee.create(req.body, function(err, createdItems){
    if(err){
      res.status(204).json({error: true, message: err});
    }
      res.status(201)
          .json(createdItems);
  });

});

/*UPDATE a single employee*/
router.put('/', function(req, res, next){
  console.log('PUT: employee', req.body);
  if(general.isEmptyObject(req.body)){
    res.status(200).json({error: true, message: 'Petition empty'});
  }

  var id = req.body.id;
  console.log("Id: ",id);

  req.models.employee.get(id, function(err, employee){
    if(employee){
      employee.supervisor_id = req.body.supervisor_id;
      employee.save(function(err){
        if(err){
          res.status(204).json({error: true, message: err});
        }else{
          res.status(200)
            .json(employee);
        }
      })
    }else{
      res.status(404).json({error: true, message: 'Employee not found'});
    }
  });
});


  /*UPDATE a single employee*/
router.delete('/:id', function(req, res, next){
  console.log('DELETE: employee (change active status)', req.body);
  if(!req.params.id){
    res.status(200).json({error: true, message: 'Petition empty'});
  }

  req.models.employee.get(req.params.id, function(err, employee){
    if(employee){
      employee.active = false;
      employee.save(function(err){
        if(err){
          res.status(204).json({error: true, message: err});
        }else{
          res.status(200)
            .json(employee);
        }
      })
    }else{
      res.status(404).json({error: true, message: 'Employee not found'});
    }
  });

});

module.exports = router;