
const express = require('express');
const router = express.Router();


const { getLocations } = require('../controllers/showinStockController'); // 引入控制器

// 导入控制器
const { getInStockRecords } = require('../controllers/showinStockController');

// 获取所有入库记录 API
router.get('/getInStockRecords', getInStockRecords);  // 使用控制器方法
router.get('/getLocations', getLocations); // 使用控制器的函数
module.exports = router;
