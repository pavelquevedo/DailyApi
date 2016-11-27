var orm = require('orm');
var connection = null;

var opts = {
  database: "dailyapi",
  protocol: "mysql",
  host: "allyouneediscode.c7npagn7amao.us-west-2.rds.amazonaws.com",
  user: "root",
  password: "allyouneediscode",
  query    : { pool: true },
  acquireTimeout: 1000000

}

/*var localOpts = {
  database: "daily_api",
  protocol: "mysql",
  host: "localhost",
  port: 3306,
  user: "root",
  password: ""
}*/

//var opts = process.env.CLEARDB_DATABASE_URL || localOpts;

module.exports.connectionString = opts;

module.exports.define = function(db){




	//Supervisor's model
	db.define('supervisor', {
		id: {type: 'serial', key: true},
		name : {type: 'text', size: 50, required: true},
		pass: {type: 'text', size: 128, required: true},
		active: {type: 'boolean', required: true},
		email: {type: 'text', size: 50, required: true},
		cod_vehiculo: {type: 'text', size: 25}
	});

	//Employee's model
	db.define('employee', {
		id: {type: 'serial', key: true},
		name : {type: 'text', size: 50, required: true},
		active: {type: 'boolean', required: true}
	});

	//One to one relationship between supervisor and employee
	db.models.employee.hasOne('supervisor', db.models.supervisor, {reverse: 'employees'});

	//State's model
	db.define('state', {
		id: {type: 'serial', key: true},
		name: {type: 'text', size: 25, required: true}
	});

	//County's model
	db.define('county', {
		id: {type: 'serial', key: true},
		name: {type: 'text', size: 25, required: true}
	});
	//One to one relationship between county and state
	db.models.county.hasOne('state', db.models.state, {reverse: 'counties'});

	//Invoice's model
	db.define('invoice', {
		id: {type: 'serial', key: true},
		image_url: {type: 'text', size: 255, required: true},
		total: {type: 'number', required: true}
	});

	//One to one relationships between invoice, state and county
	db.models.invoice.hasOne('state', db.models.state);
	db.models.invoice.hasOne('county', db.models.county);

	//Gas invoice's model
	db.define('gas_invoice', {
		id: {type: 'serial', key: true},
		miles: {type: 'number', required: true},
		galon_price: {type: 'number', required: true}
	});

	//One to one relationship between invoice and gas invoice
	db.models.gas_invoice.hasOne('invoice', db.models.invoice);

	//Lodgement invoice's model
	db.define('lodgment_invoice', {
		id: {type: 'serial', key: true},
		name: {type: 'text', size: 50, required: true},
		rate_per_night: {type: 'number', required: true}
	});

	//One to one relationship between invoice and lodgement invoice
	db.models.lodgment_invoice.hasOne('invoice', db.models.invoice);

	//Other invoice's model
	db.define('other_invoice', {
		id: {type: 'serial', key: true},
		place: {type: 'text', size: 50},
		description: {type: 'text', size: 255}
	});

	//One to one relationship between invoice and other invoice
	db.models.other_invoice.hasOne('invoice', db.models.invoice);

	//Status' model
	db.define('status', {
		id: {type: 'serial', key: true},
		name: {type: 'text', size: 25, required: true}
	});

	//Tree type model
	db.define('tree_type', {
		id: {type: 'serial', key: true},
		name: {type: 'text', size: 25, required: true}
	});

	db.define('root_type', {
		id: {type: 'serial', key: true},
		name: {type: 'text', size: 30, required: true}
	});

	//Contract's model
	db.define('contract', {
		id: {type: 'serial', key: true},
		company_name: {type: 'text', size: 50, required: true},
		contact_name: {type: 'text', size: 50, required: true},
		contact_number: {type: 'text', size: 20, required: true},
		trees: {type: 'integer'},
		acres: {type: 'number'},
		start_date: {type: 'date', time: true},
		finish_date: {type: 'date', time: true}
	});

	//One to many relationship between contract and status
	db.models.contract.hasOne('status', db.models.status);
	db.models.contract.hasOne('supervisor', db.models.supervisor, {reverse: 'contracts'});

	//Tract's model
	db.define('tract', {
		id: {type: 'serial', key: true},
		name: {type: 'text', size: 50, required: true},
		rl: {type: 'number'},
		rw: {type: 'number'},
		acres: {type: 'number'},
		trees_per_box: {type: 'number'},
		start_date: {type: 'date', time: true},
		finish_date: {type: 'date', time: true}
	});

	//One to many relationships
	db.models.tract.hasOne('contract', db.models.contract, {reverse: 'tracts'});
	db.models.tract.hasOne('state', db.models.state);
	db.models.tract.hasOne('county', db.models.county);
	db.models.tract.hasOne('tree_type', db.models.tree_type);
	db.models.tract.hasOne('root_type', db.models.root_type);
	db.models.tract.hasOne('status', db.models.status);
	db.models.tract.hasMany('employee', db.models.employee, {status_tract_employee: {type:'integer'}}, {key:true, reverse:'tracts'});

	//Daily type's model
	db.define('daily_type', {
		id: {type: 'serial', key: true},
		name: {type: 'text', size: 25}
	});

	//Daily's model
	db.define('daily', {
		id: {type: 'serial', key: true},
		start_date: {type: 'date', time: true},
		finish_date: {type: 'date', time: true},
		boxes: {type: 'integer'}
	});

	//One to many relationshps
	db.models.daily.hasMany("tract", db.models.tract, {status_daily_tract:{type:'integer'}}, {key: true});
	db.models.daily.hasMany("employee", db.models.employee, {status_daily_employee:{type:'integer'}}, {key:true});
	db.models.daily.hasOne('daily_type', db.models.daily_type);
	db.models.daily.hasOne('status_daily', db.models.status);

	db.define('daily_detail', {
		id: {type: 'serial', key: true},
		insert_date: {type: 'date', time: true},
		trees: {type: 'integer'}
	});

	db.models.daily_detail.hasOne("daily", db.models.daily);
	db.models.daily_detail.hasOne("tract", db.models.tract);
	db.models.daily_detail.hasOne("employee", db.models.employee);
}

	

module.exports.connect = function(cb){
	if (connection) return cb(null, connection);

	orm.connect(module.exports.connectionString, function(err, db){
		if(err) return cb(err);

		connection = db;

		module.exports.define(db);

		cb(null,db);
	});
}
