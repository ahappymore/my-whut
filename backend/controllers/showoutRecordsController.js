const db = require("../config/db");

// 获取出库记录
exports.getOutRecords = async (req, res) => {
    const { operatorID, productID, sortOrder } = req.query;

    // 构造查询条件
    let query = `
    SELECT s.SaleRecordID,s.product_id,product.product_name,s.SaleQuantity, s.SalePrice,s.section,s.ShelfNumber ,s.OutTime, s.OperatorID 
    FROM SaleRecord s
    JOIN product on s.product_id=product.product_id
    WHERE OutTime IS NOT NULL 
    `;
    const params = [];

    if (operatorID) {
        query += " AND OperatorID = ?";
        params.push(operatorID);
    }

    if (productID) {
        query += " AND s.product_id = ?";
        params.push(productID);
    }

    query += ` ORDER BY OutTime ${sortOrder === "desc" ? "DESC" : "ASC"}`;

    // 执行查询
    db.query(query, params, (err, results) => {
        if (err) {
            console.error("Error fetching out-stock records:", err);
            return res.status(500).json({ message: "Error fetching records", error: err });
        }
        res.status(200).json(results);
    });
};
