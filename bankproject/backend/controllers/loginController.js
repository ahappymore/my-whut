const db = require('../config/db');

exports.userlogin = async (req, res) => {
    const { UserID, UserName, Password } = req.body;
    console.log('Received login request:', UserID, Password);

    // 检查输入是否合法
    if (!UserID || !Password || !UserName) {
        return res.status(400).json({ message: 'Please provide both  UserID and Password.' });
    }

    // 查询数据库，确保查询用户信息
    db.query('SELECT UserID, UserName, Password FROM user WHERE  UserID = ?', [UserID], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = results[0];

        // 直接比对密码（明文比对，不使用加密）
        if (user.Password === Password) {
            return res.status(200).json({
                message: 'Login successful!',
                data: {
                    UserID: user.UserID,
                    Userame: user.UserName,
                },
            });
        } else {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
    });
};



exports.operatorlogin = async (req, res) => {
    const { OperatorID, OperatorName, Password } = req.body;
    console.log('Received login request:', OperatorID, Password);

    // 检查输入是否合法
    if (!OperatorID || !Password || !OperatorName) {
        return res.status(400).json({ message: 'Please provide both  UserID and Password.' });
    }

    // 查询数据库，确保查询用户信息
    db.query('SELECT OperatorID, OperatorName, Password,quan FROM Operator WHERE  OperatorID = ?', [OperatorID], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const Operator = results[0];

        // 直接比对密码（明文比对，不使用加密）
        if (Operator.Password === Password) {
            return res.status(200).json({
                message: 'Login successful!',
                data: {
                    OperatorID: Operator.OperatorID,
                    OperatorName: Operator.OperatorName, // 从数据库中获取 OperatorName
                    quan: Operator.quan,
                },
            });
        } else {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
    });
};


//注册代码

exports.register = async (req, res) => {
    const { UserID, UserName, IDCard, Password, Email, Phone } = req.body;
    console.log('Received registration request:', UserID, UserName);

    // 检查输入是否合法
    if (!UserID || !UserName || !IDCard || !Password || !Email || !Phone) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    // 检查用户是否已存在
    db.query('SELECT UserID FROM user WHERE UserID = ?', [UserID], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: 'UserID already exists' });
        }

        // 插入新的用户数据
        db.query('INSERT INTO user (UserID, UserName, IDCard, Password, Email, Phone) VALUES (?, ?, ?, ?, ?, ?)',
            [UserID, UserName, IDCard, Password, Email, Phone],
            (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ message: 'Database error' });
                }

                return res.status(201).json({ message: 'Registration successful!' });
            });
    });
};