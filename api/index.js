const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const endpoints = require('./src/endpoints');

const api = express();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

api.use(cors({ origin: "http://localhost:5173", credentials: true }));
api.use(limiter);
api.use(helmet());
api.use(cookieParser());
api.use(morgan('combined'));
api.use("/api", endpoints);

api.listen(3000, () => {
    console.log('API running on port 3000');
});
