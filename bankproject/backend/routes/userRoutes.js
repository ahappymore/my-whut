const express = require('express');
const { getUserInfo, updateUserInfo, getcard } = require('../controllers/userController');

const router = express.Router();
router.get('/getUserInfo', getUserInfo);

router.post('/updateUserInfo', updateUserInfo);

router.get('/getcard', getcard);


module.exports = router;
