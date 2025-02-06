const express = require('express');
const { inStock, getinLocations, addPurchase } = require('../controllers/inStockController'); // 引入控制器

const router = express.Router();

// 入库操作 API
router.post('/inStock', inStock); // 使用控制器的函数
router.get('/getinLocations', getinLocations); // 使用控制器的函数
// 验证购买记录
router.post('/addPurchase', addPurchase);

module.exports = router;
