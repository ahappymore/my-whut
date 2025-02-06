const express = require("express");
const router = express.Router();
const { outStock, getoutStockOptions, addSaleRecord } = require("../controllers/outStockController");


// 出库操作
router.post("/outStock", outStock);
router.get("/getoutStockOptions", getoutStockOptions);
router.post("/addSaleRecord", addSaleRecord);
module.exports = router;
