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
    models.invoice = db.models.invoice;
    models.gas_invoice = db.models.gas_invoice;
    models.lodgment_invoice = db.models.lodgment_invoice;
    models.other_invoice = db.models.other_invoice;
  }
}));

/*POST a single invoice*/
router.post('/', (req, res, next) => {
	console.log('POST: invoice', req.body);
	if(general.isEmptyObject(req.body)){
    	res.status(403).json({error: true, message: 'Petition empty'});
	}else{
		req.models.invoice.create(req.body, (err, createdItem) => {
	    	if(err){
	      		res.status(204).json({error: err});
		    }
		      res.status(201)
		          .json(createdItem);
		});
	}
});

/*POST a single gas invoice*/
router.post('/gas', (req, res, next) => {
	console.log('POST: gas invoice', req.body);
	if(general.isEmptyObject(req.body)){
		res.status(403).json({error: true, message: 'Petition empty'});
	}else{
		req.models.gas_invoice.create(req.body, (err, createdItem) => {
			if(err){
				res.status(204).json({error: err});
			}else{
				res.status(201)
		          .json(createdItem);
			}
		});
	}
});

/*POST a single lodgment invoice*/
router.post('/lodgment', (req, res, next) => {
	console.log('POST: lodgment invoice', req.body);
	if(general.isEmptyObject(req.body)){
		res.status(403).json({error: true, message: 'Petition empty'});
	}else{
		req.models.lodgment_invoice.create(req.body, (err, createdItem) => {
			if(err){
				res.status(204).json({error: err});
			}else{
				res.status(201)
		          .json(createdItem);
			}
		});
	}
});

/*POST a single other invoice*/
router.post('/other', (req, res, next) => {
	console.log('POST: gas invoice', req.body);
	if(general.isEmptyObject(req.body)){
		res.status(403).json({error: true, message: 'Petition empty'});
	}else{
		req.models.other_invoice.create(req.body, (err, createdItem) => {
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