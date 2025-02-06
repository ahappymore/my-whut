const express = require('express');
const router = express.Router();
const db = require('../config/db'); // 数据库连接 (确保路径正确)

// 出库操作 API
exports.outStock = (req, res) => {
    const { SaleRecordID, product_id, SaleQuantity, StockID, OperatorID } = req.body;
    console.log('Received outbound request:', req.body);
    // 验证输入数据
    if (!SaleRecordID || !product_id || !SaleQuantity || !StockID || !OperatorID) {
        return res.status(400).json({ message: '请提供完整的出库数据' });
    }
    // 查询指定的 stock_record
    db.query('SELECT stock_quantity, section, ShelfNumber FROM stock_records WHERE StockID = ?', [StockID], (err, stockResult) => {
        if (err) {
            console.error('Error fetching stock record:', err);
            return res.status(500).json({ message: '查询库存记录出错', error: err });
        }

        if (stockResult.length === 0) {
            return res.status(404).json({ message: `未找到 stock_id ${StockID} 对应的库存记录` });
        }
        const currentStockQuantity = stockResult[0].stock_quantity; //找到这个货存记录对应的货存数量
        const currentSection = stockResult[0].section;    // 找到对应的存放的地址
        const currentShelfNumber = stockResult[0].ShelfNumber;

        // 查询产品的总库存，从商品总表中查询
        db.query('SELECT stock_quantity FROM product WHERE product_id = ?', [product_id], (err, totalStockResult) => {
            if (err) {
                console.error('查询产品库存记录出错:', err);
                return res.status(500).json({ message: '查询产品库存记录出错', error: err });
            }

            if (totalStockResult.length === 0) {
                return res.status(404).json({ message: `产品 ${product_id} 的库存记录未找到` });
            }

            const currentTotalStockQuantity = totalStockResult[0].stock_quantity;  //记录下仓库总数
            // 如果单个库存不足，销售记录不会消失，但是会减少，并且会产生一条新的销售记录
            if (currentStockQuantity < SaleQuantity) {
                const newProductTotalStockQuantity = currentTotalStockQuantity - currentStockQuantity; // 总库存等于原来的减去单个库存已经出去的
                const newSaleQuantity = SaleQuantity - currentStockQuantity;
                // 更新产品的总库存
                db.query('UPDATE product SET stock_quantity = ? WHERE product_id = ?', [newProductTotalStockQuantity, product_id], (err) => {
                    if (err) {
                        console.error('Error updating product stock:', err);
                        return res.status(500).json({ message: '更新产品库存记录出错', error: err });
                    }

                    // 删除 stock_records 中对应的库存记录
                    db.query('DELETE FROM stock_records WHERE StockID = ?', [StockID], (err) => {
                        if (err) {
                            console.error('Error deleting stock record:', err);
                            return res.status(500).json({ message: '删除库存记录出错', error: err });
                        }

                        // 更新 location 表的 state 状态
                        db.query('UPDATE location SET state = 0 WHERE section = ? AND ShelfNumber = ?', [currentSection, currentShelfNumber], (err) => {
                            if (err) {
                                console.error('Error updating location state:', err);
                                return res.status(500).json({ message: '更新位置状态出错', error: err });
                            }
                            console.log(`Location state updated for stock_id: ${StockID}`);
                        });
                        db.query('select SalePrice from SaleRecord where SaleRecordID=?', [SaleRecordID], (err, priceResult) => {
                            if (err) {
                                console.error('Error select SaleRecord:', err);
                                return res.status(500).json({ message: '更新销售记录出错', error: err });
                            }
                            if (priceResult.length > 0) {
                                const SalePrice = priceResult[0].SalePrice;
                                console.log(`SaleRecord updated for ID: ${SaleRecordID}, SalePrice: ${SalePrice}`);

                                // 插入一个 SaleRecord 表中的出库记录
                                db.query('insert into SaleRecord(product_id,SaleQuantity,SalePrice,section,ShelfNumber,OutTime,OperatorID) VALUES (?, ?, ?, ?, ?, NOW(), ?)',
                                    [product_id, currentStockQuantity, SalePrice, currentSection, currentShelfNumber, OperatorID], (err) => {
                                        if (err) {
                                            console.error('Error updating SaleRecord:', err);
                                            return res.status(500).json({ message: '更新销售记录出错', error: err });
                                        }
                                        console.log(`SaleRecord updated for ID: ${SaleRecordID}`);
                                    });

                                // 在这里处理 SalePrice 后续逻辑
                            } else {
                                console.log(`No SaleRecord found for ID: ${SaleRecordID}`);
                                return res.status(404).json({ message: '销售记录未找到' });
                            }
                            console.log(`SaleRecord updated for ID: ${SaleRecordID}`);
                        });
                        // 更新 SaleRecord 表中的销售数量
                        db.query('UPDATE SaleRecord SET SaleQuantity = ? WHERE SaleRecordID = ?', [newSaleQuantity, SaleRecordID], (err) => {
                            if (err) {
                                console.error('Error updating SaleRecord:', err);
                                return res.status(500).json({ message: '更新销售记录出错', error: err });
                            }
                            console.log(`SaleRecord updated for ID: ${SaleRecordID}`);
                        });

                        return res.status(200).json({ message: '出库操作成功' });
                    });
                });
            } else {
                // 如果库存足够，更新库存记录，并更新总库存,跟新出库记录
                const newStockQuantity = currentStockQuantity - SaleQuantity;
                const newProductTotalStockQuantity = currentTotalStockQuantity - SaleQuantity;
                // 更新产品的总库存
                db.query('UPDATE product SET stock_quantity = ? WHERE product_id = ?', [newProductTotalStockQuantity, product_id], (err) => {
                    if (err) {
                        console.error('Error updating product stock:', err);
                        return res.status(500).json({ message: '更新产品库存记录出错', error: err });
                    }
                    // 更新 stock_records 中的库存数量
                    db.query('UPDATE stock_records SET stock_quantity = ? WHERE StockID = ?', [newStockQuantity, StockID], (err) => {
                        if (err) {
                            console.error('Error updating stock record:', err);
                            return res.status(500).json({ message: '更新库存记录出错', error: err });
                        }
                        // 更新 SaleRecord 表中的出库时间和操作人员
                        db.query('UPDATE SaleRecord SET section=?,ShelfNumber=?,OutTime = NOW(), OperatorID = ? WHERE SaleRecordID = ?',
                            [currentSection, currentShelfNumber, OperatorID, SaleRecordID], (err) => {
                                if (err) {
                                    console.error('Error updating SaleRecord:', err);
                                    return res.status(500).json({ message: '更新销售记录出错', error: err });
                                }
                                // 如果库存量减为 0，更新 location 状态
                                if (newStockQuantity === 0) {
                                    db.query('DELETE FROM stock_records WHERE StockID = ?', [StockID], (err) => {
                                        if (err) {
                                            console.error('Error deleting stock record:', err);
                                            return res.status(500).json({ message: '删除库存记录出错', error: err });
                                        }
                                    });
                                    db.query('UPDATE location SET state = 0 WHERE section = ? AND ShelfNumber = ?', [currentSection, currentShelfNumber], (err) => {
                                        if (err) {
                                            console.error('Error updating location state:', err);
                                            return res.status(500).json({ message: '更新位置状态出错', error: err });
                                        }
                                        console.log(`Location state updated for stock_id: ${StockID}`);
                                    });
                                }
                                return res.status(200).json({ message: '出库操作成功' });
                            });
                    });
                });
            }
        });
    });
};

exports.getoutStockOptions = (req, res) => {
    const { product_id } = req.query;
    console.log("对应的产品编号是", product_id);
    // 查询 stock_records 中对应的库存记录
    db.query('SELECT StockID, stock_quantity,ExpiryTime FROM stock_records WHERE product_id = ?', [product_id], (err, results) => {
        if (err) {
            console.error('Error fetching stock records:', err);
            return res.status(500).json({ message: '查询库存记录出错', error: err });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: `未找到产品 ${product_id} 的库存记录` });
        }

        // 返回对应的库存记录（StockID 和 stock_quantity）
        res.status(200).json({
            stockOptions: results  // 格式为 [{ StockID, stock_quantity,ExpiryTime }, ...]

        });
        console.log(results);
    });
};



exports.addSaleRecord = async (req, res) => {
    const { product_id, SaleQuantity, SalePrice } = req.body;

    if (!product_id || !SaleQuantity || !SalePrice) {
        return res.status(400).json({ message: '缺少必要的字段' });
    }

    try {
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

        // 插入销售记录到数据库
        const query = 'INSERT INTO salerecord (product_id, SaleQuantity, SalePrice) VALUES (?, ?, ?)';
        const values = [product_id, SaleQuantity, SalePrice];
        const [results] = await db.promise().query(query, values);

        return res.status(200).json({ message: '销售记录添加成功', SaleRecordID: results.insertId });
    } catch (err) {
        console.error('数据库错误：', err);
        return res.status(500).json({ message: '数据库错误，请稍后重试' });
    }
};



