module.exports = function(db,cb){

	db.define('employee', {
		id: {type: 'serial', key: true},
		name : {type: 'text'},
		active: {type: 'text'},
	},
	{
		methods: {
			serialize: function(){
				return {
					id: this.id,
					name: this.name,
					active: this.active
				}
			}
		}	
	}).hasOne('supervisor', db.models.supervisor, {reverse: 'employees'});

	return cb();
}