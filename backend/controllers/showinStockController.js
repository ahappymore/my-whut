
const db = require('../config/db');  // 引入数据库连接

// 获取所有购买记录的函数
exports.getInStockRecords = async (req, res) => {
    // 查询购买记录表（purchaserecord），筛选 EntryTime 为空的记录

    db.query('SELECT * from InStockRecordsView', (err, results) => {
        if (err) {
            console.error('Error fetching inStack records:', err);
            return res.status(500).json({ message: 'Error fetching inStack records', error: err });
        }

        // 如果没有记录
        if (results.length === 0) {
            return res.status(404).json({ message: 'No inStack records found' });
        }

        console.log('InStock Records:', results);
        // 返回查询到的记录
        res.status(200).json(results);
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
