"use strict";

const database = require('../database/database');
const express = require('express');
const orm = require('orm');
const router = express.Router();
const general = require('../config/general');
const _ = require('lodash');

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

/*POST: empoyee/tract detail*/
router.post('/employeeDetail/:employee_id/:tract_id/:status_tract_employee', (req, res, next) =>{
	console.log('POST: employee/tract detail', req.body);
	if(!req.params.employee_id || !req.params.tract_id || !req.params.status_tract_employee){
		res.status(403).json({error:true, message: 'Petition empty'});
	}else{
		req.models.tract.get(req.params.tract_id, (err, tract) =>{
			if(err){
				res.status(204).json({error: err});
			}else{
				req.models.employee.get(req.params.employee_id, (err, employee)=>{
					if(err){
						res.status(204).json({error: err});
					}else{
						tract.addEmployee(employee, {status_tract_employee: req.params.status_tract_employee}, (err) => {
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

/*GET: Active employee's tract*/
router.get('/activeTract/:employee_id/:active_status', (req, res, next) =>{
	console.log('GET: Active employees tract');
	if(!req.params.employee_id || !req.params.active_status){
		res.status(403).json({error:true, message: 'Petition empty'});
	}else{
		req.models.employee.get(req.params.employee_id, (err, employee) => {
			if(err){
				res.status(204).json({error: err});
			}else{
				employee.getTracts((err, tracts) =>{
					let activeTract = _.filter(tracts, {status_tract_employee: parseInt(req.params.active_status)})[0];
					if (activeTract) {
						activeTract.employee_id = parseInt(req.params.employee_id);
						res.status(200).json(activeTract);
					}else{
						res.status(200).json({error:'Tract not found'});
					}
				});
			}
		});
	}
});

/*PUT: Tract's active employee*/
router.put('/employeeDetail/:employee_id/:tract_id/:active_status/:inactive_status', (req, res, next) => {
	console.log('PUT: employee/tract detail', req.body);
	if(!req.params.employee_id || !req.params.tract_id || !req.params.active_status || !req.params.inactive_status){
		res.status(403).json({error:true, message: 'Petition empty'});
	}else{
		req.models.employee.get(req.params.employee_id, (err, employee)=>{
			if(err){
				res.status(204).json({error: err});
			}else{
				employee.getTracts((err, tracts) =>{
					if(err){
						res.status(204).json({error: err});		
					}else{
						console.log('Active status: ', req.params.active_status);
						let activeStatus = parseInt(req.params.active_status);
						let allTracts = tracts;
						let activeTract = _.filter(tracts, {status_tract_employee: activeStatus})[0];
						console.log(activeTract);
						//Change status
						activeTract.extra.status_tract_employee = parseInt(req.params.inactive_status);
						//Save detail	
						activeTract.save((err)=>{
							if(err){
								res.status(204).json({error: err});	
							}else{
								if(_.filter(allTracts, {id: parseInt(req.params.tract_id)}).length > 0){
									let existingTract = _.filter(allTracts, {id: parseInt(req.params.tract_id)})[0];
									//Print
									console.log('existing tract: ', existingTract);
									//Update status
									existingTract.extra.status_tract_employee = parseInt(req.params.active_status);
									//Save
									existingTract.save((err) =>{
										if(err){
											throw err;
										}else{
											res.status(201).json({success: true});
										}
									})	
								}else{
									req.models.tract.get(req.params.tract_id, (err, tract)=>{
										if(err){
											res.status(204).json({error: err});		
										}else{
											console.log(tract);
											tract.addEmployee(employee, {status_tract_employee: parseInt(req.params.active_status)}, (err)=>{
												if(err){
													res.status(204).json({error:err});
												}else{
													res.status(201).json({success:true});
												}
											});
										}
									});	
								}
								
							}
						});
					}
				});
			}			
		});
	}
});

module.exports = router;