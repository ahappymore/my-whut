const express = require('express');
const router = express.Router();
const { addSupplier, getSupplier, getSupplierProducts, addSupplierProduct, getSuppliers } = require('../controllers/addSupplierController');

// 添加供应商
router.post('/addSupplier', addSupplier);
router.get('/getSupplier', getSupplier);
router.get('/getSupplierProducts', getSupplierProducts);
router.post('/addSupplierProduct', addSupplierProduct);
router.get('/getSuppliers', getSuppliers);

module.exports = router;
