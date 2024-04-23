const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const endpoints = require('./src/endpoints');

const api = express();

api.use(cookieParser());
api.use(morgan('combined'));
api.use("/api", endpoints);

api.listen(3000, () => {
    console.log('API running on port 3000');
});
