var database = require('../database/database');
var express = require('express');
var orm = require('orm');
var router = express.Router();
var general = require('../config/general');

/*Connection and set the employee's model to the request*/
router.use(orm.express(database.connectionString, {
  define: function(db, models){
    database.define(db);
    models.employee = db.models.employee;
    models.driver = db.driver;
  }
}));

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

module.exports = router;