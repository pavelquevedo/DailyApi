module.exports = function(db,cb){
	
	db.define('supervisor', {
		id: {type: 'serial', key: true},
		name : {type: 'text'},
		pass: {type: 'text'},
		email: {type: 'text'}
	},
	{
		methods: {
			serialize: function(){
				var employees;
				console.log('empleados:'+this.employees.length);
				if(this.employees){
					trabajadores = this.employees.map(function(c){
						return c.serialize();
					});
				}else{
					employees = [];
				}

				return {
					id: this.id,
					name: this.name,
					pass: this.pass,
					email: this.email,
					employees: employees
				}
			}
		}
	}
	);

	return cb();
}