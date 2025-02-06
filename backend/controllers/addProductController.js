const db = require('../config/db');

// 添加产品信息 传输到这里的信息只有五个，添加在产品表product中
exports.addProduct = async (req, res) => {
    const { product_id, product_name, type_name, min_quantity, remarks } = req.body;
    console.log('收到产品添加请求:', product_id);

    try {
        // 检查产品编号是否已存在
        const [existingProduct] = await db.promise().query(
            'SELECT 1 FROM product WHERE product_id = ?',
            [product_id]
        );

        if (existingProduct.length > 0) {
            return res.status(400).json({
                message: '产品编号已存在',
                product_id
            });
        }

        // 根据产品类型名称查询产品类型编号(type_id)
        const [typeResult] = await db.promise().query(
            'SELECT type_id FROM product_types WHERE type_name = ?',
            [type_name]
        );

        // 如果找不到对应的产品类型，返回错误
        if (typeResult.length === 0) {
            return res.status(400).json({
                message: '无效的产品类型名称',
                type_name
            });
        }

        const type_id = typeResult[0].type_id;
        // 添加产品

        const [result] = await db.promise().query(
            'INSERT INTO product(product_id, product_name, type_id, stock_quantity, min_quantity, remarks) VALUES (?, ?, ?, ?, ?, ?)',
            [product_id, product_name, type_id, 0, min_quantity, remarks]
        );

        res.status(201).json({
            message: '产品添加成功',
            product_id
        });
    } catch (err) {
        console.error('添加产品时发生错误:', err);
        res.status(500).json({
            message: '添加产品失败',
            error: err.message
        });
    }
};
