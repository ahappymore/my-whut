const express = require('express');
const db = require('../config/db');

// 获取用户信息
exports.getUserInfo = (req, res) => {
    const { UserID } = req.query; // 从查询参数中获取 UserID
    console.log(UserID);
    if (!UserID) {
        return res.status(400).json({ message: 'UserID is required' });
    }

    // 查询数据库获取用户信息
    db.query('SELECT UserID, UserName, IDCard, Password, Email, Phone FROM user WHERE UserID = ?', [UserID], (err, results) => {
        if (err) {
            console.error('数据库错误:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 返回用户信息
        res.json(results[0]);
    });
};

// 更新用户信息
exports.updateUserInfo = (req, res) => {
    const { UserID, Password, Email, Phone } = req.body;

    if (!UserID) {
        return res.status(400).json({ message: 'UserID is required' });
    }

    // 构建包含修改字段的对象，只允许修改密码、邮箱和电话
    const fieldsToUpdate = {};
    if (Password) fieldsToUpdate.Password = Password;
    if (Email) fieldsToUpdate.Email = Email;
    if (Phone) fieldsToUpdate.Phone = Phone;

    // 确保至少有一个字段需要更新
    if (Object.keys(fieldsToUpdate).length === 0) {
        return res.status(400).json({ message: 'At least one field (Password, Email, or Phone) must be provided to update.' });
    }

    // 构建 SQL 更新语句
    let updateQuery = 'UPDATE user SET ';
    const fields = Object.keys(fieldsToUpdate);
    const values = Object.values(fieldsToUpdate);

    fields.forEach((field, index) => {
        updateQuery += `${field} = ?, `;
    });

    // 去除最后一个多余的逗号
    updateQuery = updateQuery.slice(0, -2);

    updateQuery += ' WHERE UserID = ?';
    values.push(UserID); // 将 UserID 添加到查询参数中

    // 执行更新查询
    db.query(updateQuery, values, (err, result) => {
        if (err) {
            console.error('数据库错误:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 更新成功
        res.json({ message: 'User information updated successfully' });
    });
};



// 获取用户信息
exports.getcard = (req, res) => {
    const { UserID } = req.query; // 从查询参数中获取 UserID
    console.log("shoudao", UserID);
    if (!UserID) {
        return res.status(400).json({ message: 'UserID is required' });
    }

    // 查询数据库获取用户信息
    db.query('SELECT cardID FROM card WHERE UserID = ?', [UserID], (err, results) => {
        if (err) {
            console.error('数据库错误:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 返回用户信息
        res.json(results);
        console.log("shoudao", results);
    });
};