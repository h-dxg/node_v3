const express = require('express');
const router = express.Router();
router.use('/login', require('./login'));
router.use('/sys', require('./sys'));
router.use('/file', require('./file'));




module.exports = router;