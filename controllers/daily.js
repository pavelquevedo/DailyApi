"use strict";

const database = require('../database/database');
const express = require('express');
const orm = require('orm');
const router = express.Router();
const general = require('../config/general');
const _ = require('lodash');

/*Connection and set the dailies' model to the request*/
router.use(orm.express(database.connectionString, {
  define: function(db, models){
    database.define(db);
    models.daily = db.models.daily;
  }
}));

/*POST: single/list daily*/
router.post('/', (req, res, next) => {
	console.log('POST: daily', req.body);
	if(general.isEmptyObject(req.body)){
		res.status(403).json({error: true, message: 'Petition empty'});
	}else{
		let newDaily = req.body;
		//Set dates
		newDaily.start_date = new Date(newDaily.start_date);
		newDaily.finish_date = new Date(newDaily.finish_date);
		req.models.contract.daily(newDaily, (err, createdItem) => {
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