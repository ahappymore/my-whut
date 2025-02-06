const db = require('../config/db');  // 引入数据库配置文件

// 查询库存记录的控制器
exports.showDetail = (req, res) => {
    const { product_id, section, ShelfNumber, ExpiryTime, sortOrder, daysUntil } = req.query;
    console.log("接收到数据", product_id, daysUntil);
    // 构建基本查询语句
    let query = `SELECT
    sr.StockID,sr.product_id,product.product_name,sr.stock_quantity,sr.section,sr.ShelfNumber,sr.ExpiryTime 
    FROM stock_records sr
    join product 
    on product.product_id=sr.product_id 
    WHERE 1=1`;  // 初始条件为 true
    let queryParams = [];

    // 根据前端传递的条件，动态构建查询
    if (product_id) {
        query += ' AND product_id = ?';
        queryParams.push(product_id);
    }
    if (section) {
        query += ' AND section = ?';
        queryParams.push(section);
    }
    if (ShelfNumber) {
        query += ' AND ShelfNumber = ?';
        queryParams.push(ShelfNumber);
    }
    if (ExpiryTime) {
        query += ' AND ExpiryTime = ?';
        queryParams.push(ExpiryTime);
    }
    if (daysUntil) {
        query += ' AND sr.ExpiryTime BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL ? DAY)';
        queryParams.push(parseInt(daysUntil, 10)); // 确保 daysUntilExpiry 是整数
    }
    if (sortOrder) {
        query += ` ORDER BY ExpiryTime ${sortOrder}`;
    }

    // 执行查询
    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ message: 'Error fetching stock records' });
        }

        // 如果没有查询到任何记录，返回 404
        if (results.length === 0) {
            return res.status(200).json([]);  // 返回空数
        }

        // 返回查询结果
        return res.status(200).json(results);
    });
};


// 获取仓库位置的 API
exports.getLocations = async (req, res) => {
    // 查询 location 表获取所有可用的 section 和 ShelfNumber
    db.query('SELECT section, ShelfNumber FROM location', (err, results) => {
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

        // 返回查询结果
        res.status(200).json({
            locations: locations  // 返回符合要求格式的 locations 数组
        });
    });
};
