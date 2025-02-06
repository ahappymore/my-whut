
const express = require('express');
const router = express.Router();

// 导入控制器
const { getInRecords } = require('../controllers/showinRecordsController');

// 获取所有入库记录 API
router.get('/getInRecords', getInRecords);  // 使用控制器方法

module.exports = router;
