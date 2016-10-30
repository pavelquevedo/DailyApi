var orm = require('orm');

/*var opts = {
  database: "heroku_3aa861ea011580e",
  protocol: "mysql",
  host: "us-cdbr-iron-east-04.cleardb.net",
  user: "b2dc16b66b1056",
  password: "38493abc"
}*/

var opts = {
  database: "daily_app",
  protocol: "mysql",
  host: "localhost",
  port: 3306,
  user: "root",
  password: ""
}


module.exports.connectionString = opts;

module.exports.define = function(db){

	//Supervisor's model
	db.define('supervisor', {
		id: {type: 'serial', key: true},
		name : {type: 'text', size: 50},
		pass: {type: 'text', size: 128},
		active: {type: 'boolean'},
		email: {type: 'text', size: 50},
		cod_vehiculo: {type: 'text', size: 25}
	});

	//Employee's model
	db.define('employee', {
		id: {type: 'serial', key: true},
		name : {type: 'text', size: 50},
		active: {type: 'boolean'}
	});

	//One to one relationship between supervisor and employee
	db.models.employee.hasOne('supervisor', db.models.supervisor, {reverse: 'employees'});

	//State's model
	db.define('state', {
		id: {type: 'serial', key: true},
		name: {type: 'text', size: 25}
	});

	//County's model
	db.define('county', {
		id: {type: 'serial', key: true},
		name: {type: 'text', size: 25}
	});

	//Invoice's model
	db.define('invoice', {
		id: {type: 'serial', key: true},
		image_url: {type: 'text', size: 255},
		total: {type: 'number'}
	});

	//One to one relationships between invoice, state and county
	db.models.invoice.hasOne('state', db.models.state);
	db.models.invoice.hasOne('county', db.models.county);

	//Gas invoice's model
	db.define('gas_invoice', {
		id: {type: 'serial', key: true},
		miles: {type: 'number'},
		galon_price: {type: 'number'}
	});

	//One to one relationship between invoice and gas invoice
	db.models.gas_invoice.hasOne('invoice', db.models.invoice);

	//Lodgement invoice's model
	db.define('lodgment_invoice', {
		id: {type: 'serial', key: true},
		name: {type: 'text', size: 50},
		rate_per_night: {type: 'number'}
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
		name: {type: 'text', size: 25}
	});

	//Tree type model
	db.define('tree_type', {
		id: {type: 'serial', key: true},
		name: {type: 'text', size: 25}
	});

	//Contract's model
	db.define('contract', {
		id: {type: 'serial', key: true},
		name: {type: 'text', size: 50},
		company_name: {type: 'text', size: 50},
		number: {type: 'text', size: 20},
		tracts: {type: 'integer'},
		trees: {type: 'integer'},
		acres: {type: 'number'},
		start_date: {type: 'date', time: true},
		finish_date: {type: 'date', time: true}
	});

	//One to many relationship between contract and status
	db.models.contract.hasOne('status', db.models.status);
	db.models.contract.hasOne('supervisor', db.models.supervisor);

	//Tract's model
	db.define('tract', {
		id: {type: 'serial', key: true},
		name: {type: 'text', size: 50},
		rl: {type: 'number'},
		rw: {type: 'number'},
		acres: {type: 'number'},
		start_date: {type: 'date', time: true},
		finish_date: {type: 'date', time: true}
	});

	//One to many relationships
	db.models.tract.hasOne('contract', db.models.contract, {reverse: 'tracts'});
	db.models.tract.hasOne('state', db.models.state);
	db.models.tract.hasOne('county', db.models.county);
	db.models.tract.hasOne('tree_type', db.models.tree_type);
	db.models.tract.hasOne('status', db.models.status);

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
	});

	//One to many relationshps
	db.models.daily.hasOne('tract', db.models.tract, {reverse: 'dailies'});
	db.models.daily.hasOne('daily_type', db.models.daily_type);
	db.models.daily.hasOne('status', db.models.status);

}

	

module.exports.connect = function(cb){
	orm.connect(module.exports.connectionString, function(err, db){
		if(err) return cb(err);

		module.exports.define(db);

		cb(null,db);
	});
}
