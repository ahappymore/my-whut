const db = require('../config/db');

// 添加供应商信息
exports.addSupplier = async (req, res) => {
    const { SupplierID, SupplierName, SupplierPhone } = req.body;

    try {
        // 检查供应商编号是否已存在
        const [existingSupplier] = await db.promise().query(
            'SELECT 1 FROM supplier WHERE SupplierID = ?',
            [SupplierID]
        );

        if (existingSupplier.length > 0) {
            return res.status(400).json({
                message: 'Supplier ID already exists',
                SupplierID
            });
        }

        // 添加供应商
        const [result] = await db.promise().query(
            'INSERT INTO supplier (SupplierID, SupplierName, SupplierPhone) VALUES (?, ?, ?)',
            [SupplierID, SupplierName, SupplierPhone]
        );
        res.status(201).json({ message: '供应商添加成功' });
    } catch (err) {
        console.error('Error adding supplier:', err);
        res.status(500).json({
            message: 'Error adding supplier',
            error: err.message
        });
    }
};

// 查询所有供应商或根据名称查询，并支持分页
exports.getSupplier = async (req, res) => {
    const { name, page = 1, pageSize = 5 } = req.query;  // 获取请求参数中的name、page和pageSize

    let query = 'SELECT SupplierID, SupplierName, SupplierPhone FROM supplier';
    let queryParams = [];

    // 如果提供了供应商名称，则进行模糊查询
    if (name) {
        query += ' WHERE SupplierName LIKE ?';
        queryParams.push(`%${name}%`);  // 使用 %进行模糊匹配
    }

    // 分页
    const offset = (page - 1) * pageSize;
    query += ' LIMIT ? OFFSET ?';
    queryParams.push(Number(pageSize), offset);

    try {
        // 执行查询
        const [suppliers] = await db.promise().query(query, queryParams);

        // 获取总记录数
        const [[{ total }]] = await db.promise().query('SELECT COUNT(*) AS total FROM supplier');

        if (suppliers.length === 0) {
            return res.status(404).json({
                message: 'No suppliers found'
            });
        }

        // 返回查询结果和总记录数
        res.status(200).json({
            success: true,
            suppliers,
            total,
            page,
            pageSize
        });
    } catch (err) {
        console.error('Error fetching suppliers:', err);
        res.status(500).json({
            message: 'Error fetching suppliers',
            error: err.message
        });
    }
};


exports.getSupplierProducts = async (req, res) => {
    const { SupplierID } = req.query;  // 获取请求参数中的SupplierID
    console.log('Received SupplierID:', SupplierID);
    try {
        const query = `
      SELECT sp.product_id, sr.product_name, sp.SupplyPrice, sp.remarks
      FROM supplier_product sp
      JOIN product sr ON sp.product_id = sr.product_id
      WHERE sp.SupplierID = ?
    `;
        const [products] = await db.promise().query(query, [SupplierID]);
        console.log(query);
        if (products.length === 0) {
            return res.status(404).json({
                message: 'No products found for this supplier'
            });
        }

        res.status(200).json({ products });
        console.log(products);
    } catch (err) {
        console.error('Error fetching supplier products:', err);
        res.status(500).json({
            message: 'Error fetching supplier products',
            error: err.message
        });
    }
};


// 添加供应商产品
exports.addSupplierProduct = async (req, res) => {
    const { SupplierID, product_id, SupplyPrice, remarks } = req.body;
    console.log(SupplierID, product_id, SupplyPrice, remarks);
    try {
        // 检查供应商是否存在
        const [supplier] = await db.promise().query(
            'SELECT 1 FROM supplier WHERE SupplierID = ?',
            [SupplierID]
        );

        if (supplier.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Supplier not found',
                SupplierID
            });
        }

        // 检查产品是否已经供应该供应商
        const [existingProduct] = await db.promise().query(
            'SELECT 1 FROM supplier_product WHERE SupplierID = ? AND product_id = ?',
            [SupplierID, product_id]
        );

        if (existingProduct.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Product already supplied by this supplier',
                product_id
            });
        }

        // 添加供应产品信息
        const [result] = await db.promise().query(
            'INSERT INTO supplier_product (SupplierID, product_id, SupplyPrice, remarks) VALUES (?, ?, ?, ?)',
            [SupplierID, product_id, SupplyPrice, remarks]
        );
        console.log(result);
        res.status(201).json({ success: true, message: '供应产品添加成功' });
    } catch (err) {
        console.error('Error adding supplier product:', err);
        res.status(500).json({
            success: false,
            message: 'Error adding supplier product',
            error: err.message
        });
    }
};


exports.getSuppliers = async (req, res) => {
    const { product_id } = req.query;  // 获取请求参数中的SupplierID
    console.log('Received SupplierID:', product_id);
    try {
        const query = `
      SELECT SupplierID,SupplyPrice
      FROM supplier_product 
      WHERE product_id = ?
    `;
        const [suppliers] = await db.promise().query(query, [product_id]);
        console.log(query);
        if (suppliers.length === 0) {
            return res.status(404).json({
                message: 'No supplier found for this supplier'
            });
        }

        res.status(200).json({ suppliers });
    } catch (err) {
        console.error('Error fetching supplier products:', err);
        res.status(500).json({
            message: 'Error fetching supplier products',
            error: err.message
        });
    }
};

