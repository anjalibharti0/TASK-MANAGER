const jwt = require('jsonwebtoken');

const ensureAuthenticated = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json({
            message: 'Unauthorized, JWT token is required',
            success: false
        });
    }
    try {
        const decoded = jwt.verify(authHeader, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({
            message: 'Unauthorized, JWT token wrong or expired',
            success: false
        });
    }
};

module.exports = ensureAuthenticated;
