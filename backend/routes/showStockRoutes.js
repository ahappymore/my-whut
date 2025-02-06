
const express = require('express');
const router = express.Router();

// 导入控制器
const { getStockRecords, updateStockRecord, deleteStockRecord, getProductTypes } = require('../controllers/showStockController');

// 获取所有库存记录 API
router.get('/getStockRecords', getStockRecords);

// 更新库存记录 API
router.put('/updateStockRecord', updateStockRecord);  // 使用 PUT 请求来更新记录

// 删除库存记录 API
router.delete('/deleteStockRecord/:product_id', deleteStockRecord);  // 使用 DELETE 请求，并通过 product_id 参数删除


router.get('/getProductTypes', getProductTypes);

module.exports = router;