const express = require('express');

const reports = require('./reports');

const router = express.Router();

router.use('/reports', reports);

module.exports = router;
