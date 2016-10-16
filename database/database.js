var orm = require('orm');

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

	db.define('supervisor', {
		id: {type: 'serial', key: true},
		name : {type: 'text'},
		pass: {type: 'text'},
		email: {type: 'text'}
	});

	db.define('employee', {
		id: {type: 'serial', key: true},
		name : {type: 'text'},
		active: {type: 'text'},
	});

	db.models.employee.hasOne('supervisor', db.models.supervisor, {reverse: 'employees'});
}

	

module.exports.connect = function(cb){
	orm.connect(module.exports.connectionString, function(err, db){
		if(err) return cb(err);

		module.exports.define(db);

		cb(null,db);
	});
}
