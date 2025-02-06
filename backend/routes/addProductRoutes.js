const express = require('express');
const router = express.Router();
const { addProduct } = require('../controllers/addProductController');

// 添加产品
router.post('/addProduct', addProduct);

module.exports = router;
