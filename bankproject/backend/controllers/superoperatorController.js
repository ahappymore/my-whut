const express = require('express');
const db = require('../config/db');

// 获取所有用户信息
exports.getops = async (req, res) => {
    try {
        // 查询数据库获取所有用户信息
        db.query(
            'SELECT OperatorID, OperatorName FROM Operator where quan=0',
            (err, results) => {
                if (err) {
                    console.error('数据库错误:', err);
                    return res.status(500).json({ message: 'Database error' });
                }

                if (results.length === 0) {
                    return res.status(404).json({ message: 'No users found' });
                }

                // 返回所有用户信息
                res.status(200).json(results);  // 返回查询结果
                console.log(results);
            }
        );
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Error fetching users' });
    }
};


// 删除用户
exports.deleteop = async (req, res) => {
    const { OperatorID } = req.body;
    console.log(OperatorID);
    if (!OperatorID) {
        return res.status(400).json({ error: 'OperatorID is required' });
    }
    try {
        // 执行删除操作
        db.query(
            'DELETE FROM Operator WHERE OperatorID = ?',
            [OperatorID],
            (err, results) => {
                if (err) {
                    console.error('数据库错误:', err);
                    return res.status(500).json({ error: 'Error deleting user' });
                }
                // 检查是否删除了用户
                if (results.affectedRows === 0) {
                    return res.status(404).json({ message: 'User not found' });
                }

                // 删除成功，返回成功信息
                res.status(200).json({ message: '删除管理员成功' });
            }
        );
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Error deleting user' });
    }
};


//注册代码

exports.registerop = async (req, res) => {
    const { OperatorID, OperatorName } = req.body;
    console.log('Received registration request:', OperatorID, OperatorName);

    // 检查输入是否合法
    if (!OperatorID || !OperatorName) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    // 检查用户是否已存在
    db.query('SELECT OperatorID FROM Operator WHERE OperatorID = ?', [OperatorID], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: 'UserID already exists' });
        }

        // 插入新的用户数据
        db.query('INSERT INTO Operator (OperatorID,OperatorName,Password,quan) VALUES (?, ?, ?,?)',
            [OperatorID, OperatorName, '123456', 0],
            (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ message: 'Database error' });
                }

                return res.status(201).json({ message: '注册成功！' });
            });
    });
};



