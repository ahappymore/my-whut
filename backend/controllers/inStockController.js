const express = require('express');
const db = require('../config/db');  // 使用 mysql2 模块

// 入库操作 API
exports.inStock = (req, res) => {
    const inStockData = req.body; // 获取传输的批量入库数据
    console.log(inStockData);
    // 检查传递的数据是否有效
    if (!inStockData || !Array.isArray(inStockData) || inStockData.length === 0) {
        return res.status(400).json({ message: '请提供正确的入库数据' });
    }
    if (!inStockData[0].OperatorID) {
        return res.status(400).json({ message: '请提供操作人员的编号' });
    }
    // 依次处理每一条购买记录
    let currentIndex = 0;
    const processNextRecord = () => {
        if (currentIndex >= inStockData.length) {
            return res.status(200).json({ message: '批量入库操作成功完成' });
        }

        const record = inStockData[currentIndex];
        currentIndex++;
        const { PurchaseRecordID, product_id, PurchaseQuantity, section, ShelfNumber, ExpiryTime, OperatorID } = record;
        // 查询货存记录
        db.query('SELECT stock_quantity FROM product WHERE product_id = ?', [product_id], (err, stockResults) => {
            if (err) {
                console.error('查询库存记录出错:', err);

                return res.status(500).json({ message: '查询库存记录出错', error: err });
            }

            if (stockResults.length === 0) {
                return res.status(404).json({ message: `产品 ${product_id} 的库存记录未找到` });
            }

            const currentQuantity = stockResults[0].stock_quantity;

            // 查询仓库位置信息
            db.query('SELECT state FROM location WHERE section = ? AND ShelfNumber = ?', [section, ShelfNumber], (err, locationResults) => {
                if (err) {
                    console.error('查询仓库位置信息出错:', err);
                    return res.status(500).json({ message: '查询仓库位置信息出错', error: err });
                }
                if (locationResults.length === 0) {
                    return res.status(404).json({ message: '仓库位置未找到，入库失败' });
                }
                const state = locationResults[0].state;
                if (state === true) {
                    return res.status(400).json({ message: '该位置不可用，入库失败' });
                } else if (state === 0) {
                    console.log('仓库位置可用，继续入库操作。');
                } else {

                    return res.status(500).json({ message: '仓库位置信息中的状态值无效' });

                }
                console.log("到这里了");
                // 更新库存数量
                const newQuantity = currentQuantity + PurchaseQuantity;
                db.query('UPDATE product SET stock_quantity = ? WHERE product_id = ?', [newQuantity, product_id], (err) => {
                    if (err) {
                        console.error('更新库存数量出错:', err);
                        return res.status(500).json({ message: '更新库存数量出错', error: err });
                    }
                    db.query('UPDATE purchaserecord SET EntryTime = NOW(), OperatorID = ?, section = ?, ShelfNumber = ?, ExpiryTime = ? WHERE PurchaseRecordID = ?', [OperatorID, section, ShelfNumber, ExpiryTime, PurchaseRecordID], (err) => {
                        if (err) {
                            console.error('更新入库记录出错:', err);
                            return res.status(500).json({ message: '更新入库记录出错', error: err });
                        }
                        // 添加入库记录到库存记录表
                        db.query('INSERT INTO stock_records (product_id, stock_quantity, section, ShelfNumber, ExpiryTime) VALUES (?, ?, ?, ?, ?)', [product_id, PurchaseQuantity, section, ShelfNumber, ExpiryTime], (err) => {
                            if (err) {
                                console.error('添加库存记录出错:', err);
                                return res.status(500).json({ message: '添加库存记录出错', error: err });
                            }
                            console.log(`入库操作已完成,采购记录ID: ${PurchaseRecordID}`);
                            processNextRecord();  // 处理下一条记录

                            db.query('UPDATE location set state=1 where section= ? and ShelfNumber = ?', [section, ShelfNumber], (err) => {
                                if (err) {
                                    console.error('修改位置信息出错:', err);
                                    return res.status(500).json({ message: '修改位置信息出错', error: err });
                                }
                            });
                        });
                    });
                });
            });
        });
    };
    processNextRecord();  // 开始处理第一条记录
};



// 获取仓库位置的 API
exports.getinLocations = async (req, res) => {
    // 查询 location 表获取所有可用的 section 和 ShelfNumber
    db.query('SELECT section, ShelfNumber FROM  location  where state = 0', (err, results) => {
        if (err) {
            console.error('Error fetching location data:', err);
            return res.status(500).json({ message: 'Error fetching location data', error: err });
        }

        // 创建一个对象，用于按 section 分类存储 ShelfNumber
        const locationsMap = {};

        // 遍历查询结果，按 section 分类 ShelfNumber
        results.forEach(row => {
            // 如果当前 section 不在 locationsMap 中，则初始化一个空数组
            if (!locationsMap[row.section]) {
                locationsMap[row.section] = [];
            }
            // 将该 ShelfNumber 添加到对应 section 的数组中
            locationsMap[row.section].push(row.ShelfNumber);
        });

        // 将 locationsMap 转换为符合要求的格式
        const locations = Object.keys(locationsMap).map(section => ({
            section: section,
            ShelfNumbers: locationsMap[section] // 获取对应 section 的所有 ShelfNumber
        }));
        console.log(locations);
        // 返回查询结果
        res.status(200).json({
            locations: locations  // 返回符合要求格式的 locations 数组
        });

    });
};



// 添加购买记录，主要是单开一页用于添加，剩下的应该是入库操作那里选择
exports.addPurchase = async (req, res) => {
    try {
        const { product_id, PurchaseQuantity, PurchasePrice, SupplierID } = req.body;
        console.log(product_id, PurchaseQuantity, PurchasePrice, SupplierID);
        // 验证输入字段是否齐全
        if (!product_id || !PurchaseQuantity || !PurchasePrice || !SupplierID) {
            return res.status(400).json({
                success: false,
                message: '缺少必要的字段，请检查输入数据是否完整。',
                missingFields: {
                    product_id: !product_id,
                    PurchaseQuantity: !PurchaseQuantity,
                    PurchasePrice: !PurchasePrice,
                    SupplierID: !SupplierID
                }
            });
        }

        // 检查产品编号是否存在
        const [productResult] = await db.promise().query(
            'SELECT 1 FROM product WHERE product_id = ?',
            [product_id]

        );


        if (productResult.length === 0) {
            return res.status(404).json({
                success: false,
                message: `产品编号 "${product_id}" 不存在，请检查后重试。`,
            });
        }
        // 检查供应商编号是否存在
        const [supplierResult] = await db.promise().query(
            'SELECT 1 FROM supplier WHERE SupplierID = ?',
            [SupplierID]
        );

        if (supplierResult.length === 0) {
            return res.status(404).json({
                success: false,
                message: `供应商编号 "${SupplierID}" 不存在，请检查后重试。`,
            });
        }

        //检查供应关系是否存在，是否有这个供应商在供应对应的产品
        const [supplierProductResult] = await db.promise().query(
            'SELECT 1 FROM supplier_product WHERE product_id = ? AND SupplierID = ?',
            [product_id, SupplierID]
        );

        if (supplierProductResult.length === 0) {
            return res.status(400).json({
                success: false,
                message: `供应商编号 "${SupplierID}" 和产品编号 "${product_id}" 之间不存在供应关系，请检查后重试。`,
            });
        }

        // 添加购买记录
        const [result] = await db.promise().query(
            'INSERT INTO purchaserecord (product_id, purchasequantity, purchaseprice, SupplierID) VALUES (?, ?, ?, ?)',
            [product_id, PurchaseQuantity, PurchasePrice, SupplierID]
        );
        res.status(201).json({
            success: true,
            message: '购买记录添加成功！',
            record_id: result.insertId
        });

    } catch (error) {
        console.error('Error adding purchase record:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误，请稍后重试。',
            error: error.message,
        });
    }

};
