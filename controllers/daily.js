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
	models.driver = db.driver;	
  }
}));

/*GET: Active supervisor's daily*/
router.get('/activeDaily/:supervisor_id/:active_status/:in_progress_status', (req, res, next) =>{
	console.log('GET: tract detail', req.body);
	if (!req.params.supervisor_id || !req.params.active_status || !req.params.in_progress_status) {
		res.status(403).json({error: true, message: 'Petition empty'});
	}else{
		req.models.driver.execQuery('SELECT d.* FROM contract c '+
									'INNER JOIN supervisor s ON s.id = c.supervisor_id '+
									'INNER JOIN tract t ON t.contract_id = c.id '+
									'INNER JOIN daily_tract dt ON dt.tract_id = t.id '+
									'INNER JOIN daily d ON d.id = dt.daily_id '+
									'WHERE dt.status_daily_tract = '+req.params.active_status+
									' AND c.status_id = '+req.params.in_progress_status+
									' AND d.status_daily_id = '+req.params.in_progress_status+
									' AND s.id = '+req.params.supervisor_id, (err, data) => {
			if(err){
				res.status(204).json({err: err});
			}else{
				if (data.length > 0) {
					res.status(200).json(data[0]);	
				}else{
					res.status(200).json({message:'No data'});
				}				
			}
		});
	}
});

/*GET: tract detail*/
router.post('/finishDaily/:daily_id/:inactive_status', (req, res, next) =>{
	console.log('GET: tract detail', req.body);
	if (!req.params.daily_id || !req.params.inactive_status) {
		res.status(403).json({error: true, message: 'Petition empty'});
	}else{
		req.models.driver.execQuery('UPDATE daily_employee SET status_daily_employee = '+req.params.inactive_status+
									' WHERE daily_id = '+req.params.daily_id, (err, data) => {
			if(err){
				res.status(204).json({err: err});
			}else{
				req.models.driver.execQuery('UPDATE daily_tract SET status_daily_tract = '+req.params.inactive_status+
											' WHERE daily_id = '+req.params.daily_id, (err, data) => {
					if (err) {
						res.status(204).json({err: err});	
					}else{
						req.models.driver.execQuery('UPDATE daily SET status_daily_id = '+req.params.inactive_status+
											' WHERE id = '+req.params.daily_id, (err, data) => {
							if (err) {
								res.status(204).json({err: err});	
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


/*GET: tract detail*/
router.get('/tractDetail/:daily_id/:active_status', (req, res, next) =>{
	console.log('GET: tract detail', req.body);
	if (!req.params.daily_id || !req.params.active_status) {
		res.status(403).json({error: true, message: 'Petition empty'});
	}else{
		req.models.driver.execQuery('SELECT t.*, s.name as state, c.name as county, tt.name as treeType, rt.name as rootType, SUM(dd.trees) as trees, SUM(dd.trees / t.trees_per_box) as boxes FROM tract t '+
									'INNER JOIN daily_tract dt ON dt.tract_id = t.id '+
									'INNER JOIN state s ON s.id = t.state_id '+
									'INNER JOIN county c ON c.id = t.county_id '+
									'INNER JOIN tree_type tt ON tt.id = t.tree_type_id '+
									'INNER JOIN root_type rt ON rt.id = t.root_type_id '+
									'INNER JOIN daily_detail dd ON dd.tract_id = t.id AND dd.daily_id = dt.daily_id '+
									'WHERE dt.status_daily_tract = '+req.params.active_status+
									' AND dt.daily_id = '+req.params.daily_id+
									' GROUP BY t.id, s.id, c.id', (err, data) => {
			if(err){
				res.status(204).json({err: err});
			}else{
				res.status(201).json(data);
			}
		});

	}
});

/*GET: tract detail*/
router.get('/tractDetail/:daily_id', (req, res, next) =>{
	console.log('GET: tract detail', req.body);
	if (!req.params.daily_id) {
		res.status(403).json({error: true, message: 'Petition empty'});
	}else{
		req.models.driver.execQuery('SELECT t.*, s.name as state, c.name as county, tt.name as treeType, rt.name as rootType, SUM(dd.trees) as trees, SUM(dd.trees / t.trees_per_box) as boxes FROM tract t '+
									'INNER JOIN daily_tract dt ON dt.tract_id = t.id '+
									'INNER JOIN state s ON s.id = t.state_id '+
									'INNER JOIN county c ON c.id = t.county_id '+
									'INNER JOIN tree_type tt ON tt.id = t.tree_type_id '+
									'INNER JOIN root_type rt ON rt.id = t.root_type_id '+
									'INNER JOIN daily_detail dd ON dd.tract_id = t.id AND dd.daily_id = dt.daily_id '+
									'WHERE dt.daily_id = '+req.params.daily_id+
									' GROUP BY t.id, s.id, c.id', (err, data) => {
			if(err){
				res.status(204).json({err: err});
			}else{
				res.status(201).json(data);
			}
		});

	}
});

/*GET: daily_detail sum trees*/
router.get('/detail/:daily_id/:employee_id', (req, res, next) =>{
	console.log('GET: daily_detail sum trees', req.body);
	if (!req.params.daily_id || !req.params.employee_id) {
		res.status(403).json({error: true, message: 'Petition empty'});
	}else{
		req.models.driver.execQuery('SELECT dd.*, t.name as tract_name, t.trees_per_box FROM daily_detail dd '+
									'INNER JOIN tract t ON t.id = dd.tract_id '+
									'WHERE dd.daily_id ='+req.params.daily_id+' AND dd.employee_id = '+req.params.employee_id, (err, data) => {
			if(err){
				res.status(204).json({err: err});
			}else{
				res.status(201).json(data);
			}
		});
	}
});

/*PUT: daily_tract detail*/
router.put('/dailyTract/:daily_id/:tract_id/:closed_status', (req, res, next) =>{
	console.log('PUT: dailyTract detail', req.body);
	if (!req.params.daily_id || !req.params.tract_id) {
		res.status(403).json({error: true, message: 'Petition empty'});
	}else{
		req.models.driver.execQuery('UPDATE daily_tract SET status_daily_tract = '+req.params.closed_status+
									' WHERE daily_id = '+req.params.daily_id+' AND tract_id = '+req.params.tract_id, 
									(err, data) => {
			if(err){
				res.status(204).json({err: err});
			}else{
				res.status(201).json(data);
			}
		});
	}
});

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

/*PUT: daily_detail*/
router.put('/detail/', (req, res, next) =>{
	console.log('PUT: daily_detail', req.body);
	if(general.isEmptyObject(req.body)){
		res.status(403).json({error: true, message: 'Petition empty'});
	}else{
		let id = req.body.id;
		//Create daily detail
		req.models.daily_detail.get(id, (err, dailyDetail) => {
			if(err){
				res.status(204).json({error: err});
			}else{
				dailyDetail.trees = req.body.trees;
				dailyDetail.save((err) => {
					if(err){
						res.status(204).json({error: err});
					}else{
						res.status(201)
		          			.json(dailyDetail);		
					}
				});				
			}
		});
	}
});

/*DELETE: daily_detail*/
router.delete('/detail/:id', (req, res, next) => {
	console.log('DELETE: daily_detail', req.body);
	if(!req.params.id){
		res.status(403).json({error: true, message: 'Petition empty'});
	}else{
		req.models.daily_detail.get(req.params.id, (err, dailyDetail) => {
			if(err){
				res.status(204).json({error: err});
			}else{
				dailyDetail.remove((err) => {
					if(err){
						res.status(204).json({error: err});
					}else{
						res.status(200)
		          			.json(dailyDetail);		
					}
				});				
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
						employees = _.filter(employees, {status_daily_employee:3});
						res.status(200).json(employees);
					}
				});
			}
		});
	}

});

/*GET: Daily's tracts*/
router.get('/tracts/:id/:active_status', (req, res, next) => {
	console.log('GET: Dailys tracts', req.body);
	if (!req.params.id || !req.params.active_status) {
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
						tracts = _.filter(tracts, {status_daily_tract: parseInt(req.params.active_status)});
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

/*PUT: single/list daily*/
router.put('/', (req, res, next) => {
	console.log('PUT: daily', req.body);
	if(general.isEmptyObject(req.body)){
		res.status(403).json({error: true, message: 'Petition empty'});
	}else{
		req.models.daily.get(req.body.id, (err, daily) => {
			if(err){
				res.status(204).json({error: err});
			}else{
				daily.boxes = req.body.boxes;

				daily.save((err) => {
					if (err) {
						res.status(204).json({error: err});		
					}else{
						res.status(201).json(daily);
					}
				});
			}
		});
	}
});

router.post('/employeeDetail/:daily_id', (req, res, next) =>{
	console.log('POST: daily_employee detail', req.body);
	if(!req.params.daily_id || general.isEmptyObject(req.body)){
		res.status(403).json({error:true, message: 'Petition empty'});
	}else{
		req.models.daily.get(req.params.daily_id, (err, daily) =>{
			if(err){
				res.status(204).json({error: err});
			}else{
				//get employees
				var employees = req.body;

				var contador = 0;
				var total = employees.length;

				//Insert employee's detail
				for (var i = 0; i < employees.length; i++) {
					
					var currentEmployee = employees[i];
					
					req.models.driver.execQuery('INSERT INTO daily_employee(employee_id, daily_id, status_daily_employee) VALUES('+currentEmployee.id+','+req.params.daily_id+','+currentEmployee.statusDailyEmployee+')', (err, data) => {
						if(err){
							res.status(204).json({err: err});
						}else{
							contador = contador + 1;
							console.log(contador);
							if (contador == total) {
								res.status(201).json({success:true});
							}
						}
					});

					/*console.log('status daily employee: ', currentEmployee.statusDailyEmployee);
					//Get employee
					req.models.employee.get(currentEmployee.id, (err, employee) =>{
						//Print
						
						//status
						var status_daily_employee = currentEmployee.statusDailyEmployee;
						if (err){
							res.status(204).json({error: err});
						}else{
							daily.addEmployee(employee, {status_daily_employee: currentEmployee.statusDailyEmployee}, (err) => {
								
								if(err){
									res.status(204).json({error: err});		
								}else{
									currentEmployee = null;
								}
							});	
						}					
					});*/
				}							
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
				var contador = 0;
				var total = req.body.length;
				//Add tract/daily details
				for (let i = 0; i < req.body.length; i++) {
					req.models.tract.get(req.body[i].id, (err, tract) =>{
						if (err) {
							res.status(204).json({error: err});		
						}else{
							daily.addTract(tract, {status_daily_tract: req.params.status_id}, (err) => {
								if (err) {
									res.status(204).json({error: err});					
								}else{
									contador = contador + 1;
									if (contador == total) {
										res.status(201).json({success:true});
									}
								}
							});		
						}
					});
				}
			}
		});
	}
});


module.exports = router;