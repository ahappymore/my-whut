// backend/app.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const showinStockRoutes = require('./routes/showinStockRoutes');
const inStockRoutes = require('./routes/inStockRoutes');
const showoutStockRoutes = require('./routes/showoutStockRoutes');
const outStockRoutes = require('./routes/outStockRoutes');
const showStockRoutes = require('./routes/showStockRoutes');

const addProductRoutes = require('./routes/addProductRoutes');
const addSupplierRoutes = require('./routes/addSupplierRoutes');


const showinRecordsRoutes = require('./routes/showinRecordsRoutes');
const showoutRecordsRoutes = require('./routes/showoutRecordsRoutes');

const showDetailStockRoutes = require('./routes/showDetailStockRoutes');

const app = express();
app.use(cors());  // 允许跨域
app.use(bodyParser.json());  // 解析 JSON 请求


app.use('/api/auth', authRoutes);

app.use('/api', showinStockRoutes);
app.use('/api', showoutStockRoutes);

app.use('/api', showStockRoutes);


app.use('/api', inStockRoutes);  // 执行入库操作
app.use('/api', outStockRoutes);  // 执行入库操作


app.use('/api', addProductRoutes);
app.use('/api', addSupplierRoutes);

app.use('/api', showinRecordsRoutes);
app.use('/api', showoutRecordsRoutes);

app.use('/api', showDetailStockRoutes);

// 启动服务器
app.listen(5000, () => {
    console.log('Server is running on http://localhost:5000');
});
