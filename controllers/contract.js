"use strict";

const database = require('../database/database');
const express = require('express');
const orm = require('orm');
const router = express.Router();
const general = require('../config/general');
const _ = require('lodash');



/*Connection and set the contract's model to the request*/
router.use(orm.express(database.connectionString, {
  define: function(db, models){
    database.define(db);
    models.contract = db.models.contract;
  }
}));

/*POST: single/list contract*/
router.post('/', (req, res, next) => {
	console.log('POST: contract', req.body);
	if(general.isEmptyObject(req.body)){
		res.status(403).json({error: true, message: 'Petition empty'});
	}else{
		let contract = req.body;
		//Set dates
		contract.start_date = new Date(contract.start_date);
		contract.finish_date = new Date(contract.finish_date);
		req.models.contract.create(contract, (err, createdItem) => {
			if(err){
				res.status(204).json({error: err});
			}else{
				res.status(201)
		          .json(createdItem);
			}
		});
	}
});

/*PUT: single/list contract*/
router.put('/', (req, res, next) => {
	console.log('POST: contract', req.body);
	if(general.isEmptyObject(req.body)){
		res.status(403).json({error: true, message: 'Petition empty'});
	}else{
		req.models.contract.get(req.body.id, (err, contract) => {
			if(err){
				res.status(204).json({error: err});
			}else{
				contract.status_id = req.body.status_id;
				contract.finish_date = new Date(req.body.finish_date);
				//Save changes
				contract.save((err) => {
					if (err) {
						res.status(204).json({error: err});	
					}else{
						res.status(201)
		          			.json(contract);
					}
				});
			}
		});
	}
});

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

/* GET: supervisor's in progress contract. */
router.get('/inProgressContract/:supervisor_id/:in_progress_status', (req, res, next) => {
  console.log('GET: contract list', req.body);
	req.models.contract.find({supervisor_id: req.params.supervisor_id, status_id: req.params.in_progress_status}, function(err, contracts){
	  	if(contracts.length > 0){
		  	res.status(200).json(contracts[0]);
	  	}else{
	  		res.status(200).json({error: 'Contracts not found'});
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



module.exports = router;