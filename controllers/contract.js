"use strict";

const database = require('../database/database');
const express = require('express');
const orm = require('orm');
const router = express.Router();
const general = require('../config/general');

/*Connection and set the invoice's model to the request*/
router.use(orm.express(database.connectionString, {
  define: (db, models) => {
    database.define(db);
    //Load models to response
    models.contract = db.models.contract;
  }
}));