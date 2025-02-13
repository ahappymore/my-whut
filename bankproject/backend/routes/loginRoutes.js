const express = require('express');
const { userlogin, operatorlogin, register } = require('../controllers/loginController');

const router = express.Router();
router.post('/userlogin', userlogin);
router.post('/operatorlogin', operatorlogin);

router.post('/register', register);

module.exports = router;
