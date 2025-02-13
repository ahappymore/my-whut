const express = require('express');
const { getusers, edituser, deleteuser, changePassword, addCard } = require('../controllers/operatorController');

const router = express.Router();
router.get('/getusers', getusers);
router.post('/edituser', edituser);

router.post('/deleteuser', deleteuser);
router.post('/changePassword', changePassword);
router.post('/addCard', addCard);

module.exports = router;
