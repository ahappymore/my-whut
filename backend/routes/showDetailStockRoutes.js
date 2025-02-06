
const express = require('express');
const router = express.Router();

// 导入控制器
const { showDetail } = require('../controllers/showDetailStockController');

const { getLocations } = require('../controllers/showDetailStockController'); // 引入控制器
router.get('/getLocations', getLocations); // 使用控制器的函数
// 获取所有入库记录 API
router.get('/showDetail', showDetail);  // 使用控制器方法

module.exports = router;
