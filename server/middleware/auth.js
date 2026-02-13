const { verifyToken } = require('../utils/jwt');

/**
 * Middleware to authenticate requests via JWT token in cookie
 */
const authenticate = (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please login.'
            });
        }

        const decoded = verifyToken(token);
        req.user = decoded; // Attach user data to request object
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token. Please login again.'
        });
    }
};

/**
 * Middleware to authorize based on user role
 * @param {Array} roles - Allowed roles (e.g., ['ADMIN'])
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to access this resource.'
            });
        }

        next();
    };
};

module.exports = {
    authenticate,
    authorize,
};
