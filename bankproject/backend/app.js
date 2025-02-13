// backend/app.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const authRoutes = require('./routes/loginRoutes');
const userRoutes = require('./routes/userRoutes');
const operatorRoutes = require('./routes/operatorRoutes');
const superoperatorRoutes = require('./routes/superoperatorRoutes');

const app = express();
app.use(cors());  // 允许跨域
app.use(bodyParser.json());  // 解析 JSON 请求

app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', operatorRoutes);
app.use('/api', superoperatorRoutes);

// 启动服务器
app.listen(5000, () => {
    console.log('Server is running on http://localhost:5000');
});
