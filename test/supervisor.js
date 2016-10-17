"use strict"

let request = require('supertest-as-promised');
const api = require('../app');
const host = api;
const expect = require('chai').expect;
//const _ require('lodash');


request = request(host);


describe('Ruta indice, Todos los supervisores', function(){
	describe('GET supervisors/', function(){
		it('Deberia retornar todos los supervisores', function(done){
			request
				.get('/supervisors')
				.set('Accept', 'application/json')
				.expect(200)
				.expect('Content-Type', /application\/json/)
				.end((err, res) => {
					let body = res.body;
					expect(body).to.have.property('supervisors');
					expect(body.supervisors).to.be.an('array').and.to.have.length.above(0);

					done(err);
				});
		});
	});
});

describe('Ruta para obtener un supervisor', function(){
	describe('GET supervisor: id', function(){
		it('Deberia retornar un supervisor segun su ID', function(done){
			request
				.get('/supervisors/2')
				.set('Accept', 'application/json')
				.expect(200)
				.expect('Content-Type', /application\/json/)
				.end((err, res) => {
					let body = res.body;
					expect(body).to.have.property('supervisor');
					expect(body.supervisor).to.have.property('id');
					expect(body.supervisor).to.have.property('name');
					expect(body.supervisor).to.have.property('pass');
					expect(body.supervisor).to.have.property('email');
					done(err);
				});
		});
	});
});

describe('Ruta para insertar un supervisor', function(){
	describe('POST supervisor', function(){
		it('Deberia retornar el supervisor creado', function(done){
			this.timeout(15000);
			let supervisor = {
				name: "Jose Luis",
				pass: "456",
				email: "jose@miemail.com",
			};

			request
				.post('/supervisors')
				.set('Accept', 'application/json')
				.send(supervisor)
				.expect(201)
				.expect('Content-Type', /application\/json/)
				.then((res) => {
					return request
						.delete('/supervisors/'+res.body.createdItem.id)
						.set('Accept', 'application/json')
						.expect(200)
						.expect('Content-Type', /application\/json/)
				})
				.then((res) => {
					console.log(res.body.message);
					expect(res.body).to.have.property('message')
					done()
				}, setTimeout(done, 15000));

		});
	});
});