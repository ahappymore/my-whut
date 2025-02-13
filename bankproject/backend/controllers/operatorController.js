const express = require('express');
const db = require('../config/db');

// 获取所有用户信息
exports.getusers = async (req, res) => {
    try {
        // 查询数据库获取所有用户信息
        db.query(
            'SELECT UserID, UserName, IDCard, Password, Email, Phone FROM user',
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


// 编辑用户信息
exports.edituser = async (req, res) => {
    const { UserID, UserName, IDCard, Email, Phone } = req.body;
    // 检查必填字段
    console.log(UserID, UserName, IDCard, Email, Phone);
    if (!UserID || !UserName || !IDCard || !Email || !Phone) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    try {
        // 更新用户信息
        db.query(
            'UPDATE user SET UserName = ?, IDCard = ?, Email = ?, Phone = ? WHERE UserID = ?',
            [UserName, IDCard, Email, Phone, UserID],
            (err, results) => {
                if (err) {
                    console.error('数据库错误:', err);
                    return res.status(500).json({ error: 'Error updating user' });
                }

                // 检查是否成功更新
                if (results.affectedRows === 0) {
                    return res.status(404).json({ message: 'User not found' });
                }

                // 更新成功，返回成功信息
                res.status(200).json({ message: 'User edited successfully' });
            }
        );
    } catch (err) {
        console.error('Error editing user:', err);
        res.status(500).json({ error: 'Error editing user' });
    }
};



// 删除用户及其银行卡
exports.deleteuser = async (req, res) => {
    const { UserID } = req.body;
    console.log(UserID);
    if (!UserID) {
        return res.status(400).json({ error: 'UserID is required' });
    }
    try {
        // 删除用户的银行卡
        await new Promise((resolve, reject) => {
            db.query(
                'DELETE FROM card WHERE UserID = ?',
                [UserID],
                (err, results) => {
                    if (err) {
                        return reject('Error deleting user card');
                    }
                    resolve(results);
                }
            );
        });

        // 删除用户
        await new Promise((resolve, reject) => {
            db.query(
                'DELETE FROM user WHERE UserID = ?',
                [UserID],
                (err, results) => {
                    if (err) {
                        return reject('Error deleting user');
                    }
                    if (results.affectedRows === 0) {
                        return reject('User not found');
                    }
                    resolve(results);
                }
            );
        });

        // 删除成功，返回成功信息
        res.status(200).json({ message: 'User and associated card deleted successfully' });

    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: err });
    }
};



exports.changePassword = (req, res) => {
    const { OperatorID, oldPassword, newPassword } = req.body;
    // 校验输入
    console.log(OperatorID, oldPassword, newPassword);

    if (!OperatorID || !oldPassword || !newPassword) {
        return res.status(400).json({ message: '缺少必要的参数' });
    }

    // 从数据库查询管理员的当前密码
    db.query('SELECT * FROM Operator WHERE OperatorID = ?', [OperatorID], (err, results) => {
        if (err) {
            console.error('数据库查询失败', err);
            return res.status(500).json({ message: '数据库查询失败' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: '管理员用户不存在' });
        }

        const operator = results[0];

        // 校验原始密码是否正确（直接比较明文密码）
        if (oldPassword !== operator.Password) {
            return res.status(401).json({ message: '原始密码不正确' });
        }

        // 更新管理员的密码（直接存储明文密码）
        db.query('UPDATE Operator SET Password = ? WHERE OperatorID = ?', [newPassword, OperatorID], (err, results) => {
            if (err) {
                console.error('密码更新失败', err);
                return res.status(500).json({ message: '密码更新失败' });
            }

            res.status(200).json({ message: '密码修改成功' });
        });
    });
};



exports.addCard = async (req, res) => {
    const { userID, cardID } = req.body;
    console.log('Received add card request:', userID, cardID);

    // 检查输入是否合法
    if (!userID || !cardID) {
        return res.status(400).json({ message: 'Please provide both userID and cardID.' });
    }

    // 检查银行卡号是否已存在
    db.query('SELECT cardID FROM card WHERE cardID = ?', [cardID], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: 'Card ID already exists' });
        }

        // 插入银行卡信息
        db.query('INSERT INTO Card (userID, cardID) VALUES (?, ?)', [userID, cardID], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Database error' });
            }

            return res.status(201).json({ message: 'Card added successfully!' });
        });
    });
};