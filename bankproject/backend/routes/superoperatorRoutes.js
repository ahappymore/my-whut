const express = require('express');
const { getops, deleteop, registerop } = require('../controllers/superoperatorController');

const router = express.Router();
router.get('/getops', getops);
router.post('/registerop', registerop);
router.post('/deleteop', deleteop);


module.exports = router;
