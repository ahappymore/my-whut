
const db = require('../config/db');  // 引入数据库连接

// 获取所有入库记录的函数
exports.getOutStockRecords = async (req, res) => {
    // 查询入库记录表（purchaserecord），筛选 EntryTime 为空的记录

    db.query('SELECT * from SaleRecordsView', (err, results) => {
        if (err) {
            console.error('Error fetching outStack records:', err);
            return res.status(500).json({ message: 'Error fetching outStack records', error: err });
        }

        // 如果没有记录
        if (results.length === 0) {
            return res.status(404).json({ message: 'No outStack records found' });
        }

        console.log('outStock Records:', results);
        // 返回查询到的记录
        res.status(200).json(results);
    });
};
