
const express = require('express');
const router = express.Router();

// 导入控制器
const { getOutStockRecords } = require('../controllers/showoutStockController');

// 获取所有入库记录 API
router.get('/getOutStockRecords', getOutStockRecords);  // 使用控制器方法

module.exports = router;
