const User = require('../models/user');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

exports.login = async (req, res) => {
    const { OperatorID, Password } = req.body;
    console.log('Received login request:', OperatorID, Password);

    if (!OperatorID || !Password) {
        return res.status(400).json({ message: 'Please provide both OperatorID and Password.' });
    }

    // 查询数据库
    db.query('SELECT OperatorID,OperatorName,Password FROM operator WHERE OperatorID = ?', [OperatorID], (err, results) => {
        if (err) {
            console.error('数据错误:', err);
            return res.status(500).json({ message: '数据错误' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: '数据错误' });
        }

        const user = results[0];

        // 验证密码
        if (user.Password === Password) {
            return res.status(200).json({
                message: '登录成功！',
                data: {
                    OperatorID: user.OperatorID,
                    OperatorName: user.OperatorName,
                },
            });
        } else {
            return res.status(401).json({ message: '登陆失败' });
        }
    });
};
