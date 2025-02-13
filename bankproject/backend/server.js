const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// MySQL 数据库连接
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'cangku',
});

db.connect((err) => {
    if (err) {
        console.error('数据库连接失败:', err);
        return;
    }
    console.log('数据库连接成功');
});

// 添加根路径路由
app.get('/', (req, res) => {
    res.send('后端服务器已启动！访问 /api/products 查看数据。');
});

// 查询产品列表
app.get('/api/stock_records', (req, res) => {
    const query = 'SELECT * FROM stock_records';

    db.query(query, (err, results) => {
        if (err) {
            console.error('查询数据失败: ', err);
            res.status(500).send('数据库查询失败');
        } else {
            console.log('查询结果:', results);  // 查看查询返回的数据
            res.json(results);  // 返回查询结果
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
