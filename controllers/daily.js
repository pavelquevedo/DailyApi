"use strict";

const database = require('../database/database');
const express = require('express');
const orm = require('orm');
const router = express.Router();
const general = require('../config/general');
const _ = require('lodash');

/*Connection and set the dailies' model to the request*/
router.use(orm.express(database.connectionString, {
  define: (db, models) => {
    database.define(db);
    models.daily = db.models.daily;
	models.daily_detail = db.models.daily_detail;	
  }
}));

/*GET: daily_detail sum trees*/
router.get('/detail/:daily_id/:employee_id/:tract_id', (req, res, next) =>{
	console.log('GET: daily_detail sum trees', req.body);
	if (!req.params.daily_id || !req.params.employee_id || !req.params.tract_id) {
		res.status(403).json({error: true, message: 'Petition empty'});
	}else{
		req.models.daily_detail.find({daily_id: req.params.daily_id, 
			employee_id: req.params.employee_id, tract_id: req.params.tract_id}, (err, details) => {
			if(err){
				res.status(204).json({error: err});			
			}else{
				res.status(200).json(details);
			}
		});
	}
});

/*POST: daily_detail*/
router.post('/detail', (req, res, next) => {
	console.log('POST: daily_detail', req.body);
	if(general.isEmptyObject(req.body)){
		res.status(403).json({error: true, message: 'Petition empty'});
	}else{
		let newDailyDetail = req.body;
		//Set dates
		newDailyDetail.insert_date = new Date(newDailyDetail.insert_date);
		//Create daily detail
		req.models.daily_detail.create(newDailyDetail, (err, createdItem) => {
			if(err){
				res.status(204).json({error: err});
			}else{
				res.status(201)
		          .json(createdItem);
			}
		});
	}
});

/*GET: Daily's employees*/
router.get('/employees/:id', (req, res, next) => {
	console.log('GET: Dailys employees', req.body);
	if (!req.params.id) {
		res.status(403).json({error: true, message: 'Petition empty'});
	}else{
		req.models.daily.get(req.params.id, (err, daily) => {
			if(err){
				res.status(204).json({error: err});			
			}else{
				console.log(daily);
				daily.getEmployee((err, employees) =>{
					if(err){
						res.status(204).json({error: err});
					}else{
						res.status(200).json(employees);
					}
				});
			}
		});
	}

});

/*GET: Daily's tracts*/
router.get('/tracts/:id', (req, res, next) => {
	console.log('GET: Dailys tracts', req.body);
	if (!req.params.id) {
		res.status(403).json({error: true, message: 'Petition empty'});
	}else{
		req.models.daily.get(req.params.id, (err, daily) => {
			if(err){
				res.status(204).json({error: err});			
			}else{
				console.log(daily);
				daily.getTract((err, tracts) =>{
					if(err){
						res.status(204).json({error: err});
					}else{
						res.status(200).json(tracts);
					}
				});
			}
		});
	}
});

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
		req.models.daily.create(newDaily, (err, createdItem) => {
			if(err){
				res.status(204).json({error: err});
			}else{
				res.status(201)
		          .json(createdItem);
			}
		});
	}
});

router.post('/employeeDetail/:daily_id/:employee_id/:status_id', (req, res, next) =>{
	console.log('POST: daily_employee detail', req.body);
	if(!req.params.employee_id || !req.params.daily_id || !req.params.status_id){
		res.status(403).json({error:true, message: 'Petition empty'});
	}else{
		req.models.daily.get(req.params.daily_id, (err, daily) =>{
			if(err){
				res.status(204).json({error: err});
			}else{
				req.models.employee.get(req.params.employee_id, (err, employee) =>{
					if (err){
						res.status(204).json({error: err});
					}else{
						daily.addEmployee(employee, {status_daily_employee: req.params.status_id}, (err) => {
							if(err){
								res.status(204).json({error: err});		
							}else{
								res.status(201).json({success:true});
							}
						});	
					}					
				});				
			}
		});
	}
});

router.post('/tractDetail/:daily_id/:status_id', (req, res, next) =>{
	console.log('POST: daily_tract detail', req.body);
	if(!req.params.status_id || !req.params.daily_id){
		res.status(403).json({error:true, message: 'Petition empty'});
	}else{
		req.models.daily.get(req.params.daily_id, (err, daily) =>{
			if(err){
				res.status(204).json({error: err});
			}else{
				//Add tract/daily details
				for (let i = 0; i < req.body.length; i++) {
					req.models.tract.get(req.body[i].id, (err, tract) =>{
						if (err) {
							res.status(204).json({error: err});		
						}else{
							daily.addTract(tract, {status_daily_tract: req.params.status_id}, (err) => {
								if (err) {
									res.status(204).json({error: err});					
								}
							});		
						}
					});
				}
				res.status(201).json({success:true});
			}
		});
	}
});


module.exports = router;