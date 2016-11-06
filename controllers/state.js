"use strict";

const database = require('../database/database');
const express = require('express');
const orm = require('orm');
const router = express.Router();
const general = require('../config/general');
var _ = require('lodash');

/*Connection and set the invoice's model to the request*/
router.use(orm.express(database.connectionString, {
  define: (db, models) => {
    database.define(db);
    //Load models to response
    models.state = db.models.state;
  }
}));

/* GET employees listing. */
router.get('/', function(req, res, next) {
  console.log('GET: states', req.body);
  req.models.state.find({}, function(err, states){
    if(states){
    	res.status(200).json(states);
    }else{
      res.status(404).json({error: 'States not found'});
    }
  });
});

/*GET: The state's counties*/
router.get('/getCounties/:id', function(req,res,next){
	console.log('GET: states counties by ID', req.params.id);
	if(!req.params.id){
		res.status(200).json({error: true, message: 'Petition empty'});
	}

	req.models.state.get(req.params.id, function(err, state){
	    if(err){
	    	res.status(200).json({error: true, message: err});
	    }else{
	    	if(state){
		    	state.getCounties(function(err, counties){
		      		if(err){
		      			res.status(200).json({error: true, message: err});
		      		}else{
		      			if(counties){
		      				res.status(200).json(counties);
			      		}else{
			      			res.status(200).json({error: true, message: 'Counties not found'});
			      		}
		      		}
		    	});
		    }else{
		    	res.status(200).json({error: true, message: 'State not found'});
		    }
	    }
	});
});

module.exports = router;