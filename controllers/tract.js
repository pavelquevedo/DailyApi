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
    models.driver = db.driver;
  }
}));

router.delete('/tract_employee', (req, res, next) => {
	console.log('DELETE DETAIL tract_employee');
	req.models.driver.execQuery('DELETE FROM tract_employee', (err, data) => {
		if(err){
			res.status(204).json({err: err});
		}else{
			res.status(200).json({success:true});
		}
	});
});

/*POST a single tract*/
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

/*PUT a single tract*/
router.put('/', (req, res, next) => {
	console.log('PUT: tract', req.body);
	if(general.isEmptyObject(req.body)){
		res.status(403).json({error: true, message: 'Petition empty'});
	}else{
		//Get tract
		req.models.tract.get(req.body.id, (err, tract) => {
			if(err){
				res.status(204).json({error: err});
			}else{
				//Update fields
				tract.status_id = req.body.status_id;
				tract.trees_per_box = req.body.trees_per_box;
				tract.finish_date = new Date(req.body.finish_date);
 				//Save changes
				tract.save((err) => {
					if(err){
						res.status(204).json({error: err});	
					}else{
						res.status(201)
		          			.json(tract);
					}
				});
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
router.post('/employeeDetail', (req, res, next) =>{
	console.log('POST: employee/tract detail', req.body);
	if(general.isEmptyObject(req.body)){
		res.status(403).json({error:true, message: 'Petition empty'});
	}else{
		//Get employees		
		var employees = req.body;

		var contador = 0;
		var total = employees.length;	

		//Insert employee's detail
		for (var i = 0; i < employees.length; i++) {
			//get employee id
			var currentEmployee = employees[i];
			//Exec query	
			req.models.driver.execQuery('INSERT INTO tract_employee(tract_id, employee_id, status_tract_employee) VALUES('+currentEmployee.tract_id+','+currentEmployee.id+','+currentEmployee.statusDailyEmployee+')', (err, data) => {
				if(err){
					contador = contador + 1;
					console.log(contador);
					//res.status(200).json({err: err});
					//throw err;
				}else{
					contador = contador + 1;
					console.log(contador);
					if (contador == total) {
						res.status(201).json({success:true});
					}
				}
			});

			//agregarDetalleTractEmployee(req.models.driver, tract_id, employeeId, status_tract_employee);

			//Get employee
			/*req.models.tract.get(tract_id, (err, tract) =>{
				if(err){
					console.log('error en get tract');
					//res.status(204).json({error: err});
				}else{
					req.models.employee.get(employeeId, (err, employee)=>{
						if(err){
							//res.status(204).json({error: err});
							console.log('error en get employee');
						}else{
							tract.addEmployee(employee, {status_tract_employee: 3}, (err) => {
								if(err){
									console.log('error en add employee');
									//res.status(204).json({error: err});
								}else{
									console.log('employee: ',employeeId);
								}
							});
						}
					});				
				}
			});*/		 	
		 }
		 
		
	}
});

/*GET: Active employee's tract*/
router.post('/dailyEmployees/:daily_id/:active_status', (req, res, next) =>{
	console.log('GET: Active employees tract', req.body);
	if(!req.params.active_status){
		res.status(403).json({error:true, message: 'Petition empty'});
	}else{
		//Set active tract
		req.models.driver.execQuery('select e.*, te.tract_id from employee e '+
										'inner join daily_employee de on de.employee_id = e.id '+
										'inner join tract_employee te on te.employee_id = e.id '+
										'where de.daily_id = '+ req.params.daily_id + 
										' and de.status_daily_employee = '+ req.params.active_status +
										' and te.status_tract_employee = '+ req.params.active_status, (err, data) => {
			if(err){
				res.status(204).json({err: err});
			}else{
				res.status(201).json(data);
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
						//console.log('Active status: ', req.params.active_status);
						let activeStatus = parseInt(req.params.active_status);
						let allTracts = tracts;
						let activeTract = _.filter(tracts, {status_tract_employee: activeStatus})[0];
						//If active tract is the same 'tract_id' sent
						if (activeTract.id == parseInt(req.params.tract_id)) {
							res.status(200).json({message:'Tract doesnt change'});
						}else{
							//console.log(activeTract);
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
										//console.log('existing tract: ', existingTract);
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
												//console.log(tract);
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
						
					}
				});
			}			
		});
	}
});

module.exports = router;