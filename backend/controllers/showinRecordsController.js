
const db = require('../config/db');  // 引入数据库连接

// 获取所有入库记录的函数,经过操作人员操作后的数据，就是操作记录
exports.getInRecords = async (req, res) => {
    // 从请求的查询参数中获取筛选条件
    const { operatorId, productId, supplierId } = req.query;

    // 构建查询的基本语句
    let query = `
    SELECT * FROM PurchaseView
    `;
    const params = [];

    // 如果有操作人员编号，则添加筛选条件
    if (operatorId) {
        query += ' AND OperatorID = ?';
        params.push(operatorId);
    }

    // 如果有产品编号，则添加筛选条件
    if (productId) {
        query += ' AND product_id = ?';
        params.push(productId);
    }

    // 如果有供应商编号，则添加筛选条件
    if (supplierId) {
        query += ' AND SupplierID = ?';
        params.push(supplierId);
    }

    // 执行查询
    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Error fetching inStock records:', err);
            return res.status(500).json({ message: 'Error fetching inStock records', error: err });
        }

        // 如果没有记录
        if (results.length === 0) {
            return res.status(404).json({ message: 'No inStock records found' });
        }

        console.log('InStock Records:', results);
        // 返回查询到的记录
        res.status(200).json(results);
    });
};



