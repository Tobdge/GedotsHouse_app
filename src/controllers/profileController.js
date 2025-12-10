const connection = require("../../db/connections");

exports.getProfile = (req, res) => {
    connection.getConnection((err, conn) => {
        if (err) return res.status(500).json(err);

        conn.query(
            `SELECT u.id, u.email, p.first_name, p.last_name, p.phone 
             FROM users u 
             LEFT JOIN user_profiles p ON p.user_id = u.id 
             WHERE u.id = ?`,
            [req.user.id],
            (err, rows) => {
                if (err) return res.status(500).json(err);

                res.json(rows[0] || {});
            }
        );
    });
};
