
const db = require('../config/db');  // 引入数据库连接

exports.getStockRecords = async (req, res) => {
    const { product_name, type_name } = req.query;  // 获取前端传递的筛选条件

    let query = `
    SELECT 
    *
    FROM demandview
  `;

    const queryParams = [];  // 用于存储动态的查询参数

    // 根据条件拼接查询语句
    if (product_name) {
        query += ` AND product_name LIKE ?`;  // 添加商品名称的筛选条件
        queryParams.push(`%${product_name}%`);  // 将商品名称参数添加到查询参数数组中
    }

    if (type_name) {
        query += ` AND product_types.type_name LIKE ?`;  // 添加产品类型的筛选条件
        queryParams.push(`%${type_name}%`);  // 将产品类型参数添加到查询参数数组中
    }

    // 执行查询
    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error('Error fetching Stock records:', err);
            return res.status(500).json({ message: 'Error fetching Stock records', error: err });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No Stock records found' });
        }

        console.log('Stock Records:', results);
        res.status(200).json(results);
    });
};


exports.updateStockRecord = (req, res) => {
    const { product_id, product_name, type_id, min_quantity, remarks } = req.body;

    if (!product_id || !product_name || !type_id || min_quantity === undefined || remarks === undefined) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // 修改库存记录的 SQL 查询
    const query = `
        UPDATE product 
        SET product_name = ?, type_id = ?, min_quantity = ?, remarks = ?
        WHERE product_id = ?
    `;

    db.query(query, [product_name, type_id, min_quantity, remarks, product_id], (err, results) => {
        if (err) {
            console.error('Error updating stock record:', err);
            return res.status(500).json({ message: 'Error updating stock record', error: err });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Stock record not found' });
        }

        console.log('Updated stock record:', results);
        res.status(200).json({ message: 'Stock record updated successfully' });
    });
};

// 删除库存记录
exports.deleteStockRecord = (req, res) => {
    const { product_id } = req.params;

    // 首先查询库存数量
    const query = 'SELECT stock_quantity FROM product WHERE product_id = ?';

    db.query(query, [product_id], (err, results) => {
        if (err) {
            console.error('Error checking stock quantity:', err);
            return res.status(500).json({ message: 'Error checking stock quantity', error: err });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Stock record not found' });
        }

        const stock_quantity = results[0].stock_quantity;

        if (stock_quantity > 0) {
            return res.status(400).json({ message: 'Cannot delete record with non-zero stock quantity' });
        }

        // 删除库存记录的 SQL 查询
        const deleteQuery = 'DELETE FROM product WHERE product_id = ?';

        db.query(deleteQuery, [product_id], (err, results) => {
            if (err) {
                console.error('Error deleting stock record:', err);
                return res.status(500).json({ message: 'Error deleting stock record', error: err });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Stock record not found' });
            }

            console.log('Deleted stock record:', results);
            res.status(200).json({ message: 'Stock record deleted successfully' });
        });
    });
};


exports.getProductTypes = (req, res) => {
    const query = "SELECT DISTINCT type_name FROM product_types"; // 假设你的产品类型表是 product_type
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching product types:", err);
            return res.status(500).json({ message: "Error fetching product types", error: err });
        }

        const types = results.map(row => ({ type_name: row.type_name }));
        console.log("Mapped product types:", types);  // 打印映射后的产品类型数据
        res.status(200).json(types);  // 返回类型对象数组
    });
};