export const rateLimitLogin = (max = 5, minutes = 15) => {
    return async (req, res, next) => {
        const { email } = req.body;

        const now = new Date();

        // leer usuario
        const [rows] = await req.db.query(
            "SELECT failed_attempts, lockout_until FROM users WHERE email = ?",
            [email]
        );

        if (rows.length === 0) return next(); // usuario no existe

        const { failed_attempts, lockout_until } = rows[0];

        if (lockout_until && new Date(lockout_until) > now) {
            return res.status(429).json({
                msg: `Cuenta bloqueada. Inténtalo más tarde.`,
            });
        }

        req.loginSecurity = { failed_attempts };
        next();
    };
};
