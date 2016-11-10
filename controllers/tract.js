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
    models.tract = db.models.tract;
    models.tree_type = db.models.tree_type;
    models.root_type = db.models.root_type;
  }
}));

/*POST a single contract*/
router.post('/', (req, res, next) => {
	console.log('POST: tract', req.body);
	if(general.isEmptyObject(req.body)){
		res.status(403).json({error: true, message: 'Petition empty'});
	}else{
		console.log("Fecha ",req.body.start_date);
		//Parse date
		//var fecha = Date.parse(req.body.start_date);
		req.body.start_date = new Date(req.body.start_date);
		//Create tract
		req.models.tract.create(req.body, (err, createdItem) => {
			if(err){
				res.status(204).json({error: err});
			}else{
				res.status(201)
		          .json(createdItem);
			}
		});
	}
});

/* GET tree types listing. */
router.get('/tree_types', (req, res, next) => {
  console.log('GET: tree types', req.body);
  req.models.tree_type.find({}, function(err, trees){
    if(trees){
      res.status(200).json(trees);
    }else{
      res.status(404).json({error: 'Tree types not found'});
    }
  });
});

/*POST tree types*/
router.post('/tree_types', (req, res, next) => {
	console.log('POST: tract', req.body);
	if(general.isEmptyObject(req.body)){
		res.status(403).json({error: true, message: 'Petition empty'});
	}else{
		req.models.tree_type.create(req.body, (err, createdItems) => {
			if(err){
				res.status(204).json({error: err});
			}else{
				res.status(201)
		          .json(createdItems);
			}
		});
	}
});

/* GET tree types listing. */
router.get('/root_types', (req, res, next) => {
  console.log('GET: root types', req.body);
  req.models.root_type.find({}, function(err, roots){
    if(roots){
      res.status(200).json(roots);
    }else{
      res.status(404).json({error: 'Root types not found'});
    }
  });
});

module.exports = router;