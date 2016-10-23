"use strict";

const database = require('../database/database');
const express = require('express');
const orm = require('orm');
const router = express.Router();
const general = require('../config/general');

/*Connection and set the invoice's model to the request*/
router.use(orm.express(database.connectionString, {
  define: (db, models) => {
    database.define(db);
    //Load models to response
    models.contract = db.models.contract;
  }
}));

/*POST a single contract*/
router.post('/', (req, res, next) => {
	console.log('POST: lodgment invoice', req.body);
	if(general.isEmptyObject(req.body)){
		res.status(403).json({error: true, message: 'Petition empty'});
	}else{
		req.models.contract.create(req.body, (err, createdItem) => {
			if(err){
				res.status(204).json({error: err});
			}else{
				res.status(201)
		          .json({createdItem: createdItem});
			}
		});
	}
});

/*GET: Single contract*/
router.get('/:id', (req,res,next) => {
	console.log('GET: contract by ID', req.body);
	if(!req.params.id){
		res.status(403).json({error: true, message: 'Petition empty'});
	}else{
		req.models.contract.get(req.params.id, function(err, contract){
			if(contract){
				res.status(200).json({contract: contract});
			}else{
				res.status(403).json({error: true, message: 'Contract not found'});
			}
		});	
	}
	
});

module.exports = router;