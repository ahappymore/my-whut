const mongoose = require('mongoose');

const mysql = require('mysql2');

// 创建 MySQL 连接池
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'bank'
});

module.exports = db;

db.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL database');
    connection.release();  // 释放连接
});



