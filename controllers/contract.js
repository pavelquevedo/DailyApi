"use strict";

var database = require('../database/database');
var express = require('express');
var orm = require('orm');
var router = express.Router();
var general = require('../config/general');
var _ = require('lodash');



/*Connection and set the contract's model to the request*/
router.use(orm.express(database.connectionString, {
  define: function(db, models){
    database.define(db);
    models.contract = db.models.contract;
  }
}));

/* GET: supervisors listing. */
router.get('/', (req, res, next) => {
  console.log('GET: contract list', req.body);
	req.models.contract.find({}, function(err, contracts){
	  	if(contracts){
		  	res.status(200).json(contracts);
	  	}else{
	  		res.status(404).json({error: 'Contracts not found'});
	  	}
  	});
});

/* GET: supervisors listing. */
router.get('/getTracts/:contract_id', (req, res, next) => {
  	console.log('GET: tract list by supervisor_id', req.body);
  	if(!req.params.contract_id){
		res.status(403).json({error: true, message: 'Petition empty'});
	}
	req.models.contract.get(req.params.contract_id, (err, contract) => {
	  	if(contract){
	  		contract.getTracts((err,tracts) => {
	  			if(err){
	  				res.status(403).json(err);
	  			}
	  			res.status(200).json(tracts);
	  		});		  	
	  	}else{
	  		res.status(404).json({error: 'Contract not found'});
	  	}
  	});
});

router.post('/', (req, res, next) => {
	console.log('POST: contract', req.body);
	if(general.isEmptyObject(req.body)){
		res.status(403).json({error: true, message: 'Petition empty'});
	}else{
		req.models.contract.create(req.body, (err, createdItem) => {
			if(err){
				res.status(204).json({error: err});
			}else{
				res.status(201)
		          .json(createdItem);
			}
		});
	}
});

module.exports = router;