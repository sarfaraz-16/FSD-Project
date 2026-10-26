const permissions = require('../../../shared/permissions.json');

const authorizeAction = (moduleName, action) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    // Admin override is handled by the matrix having everything, but we can enforce matrix.
    const rolePerms = permissions[req.user.role];
    if (!rolePerms) {
      return res.status(403).json({ success: false, message: 'Invalid role' });
    }

    const modulePerms = rolePerms[moduleName];
    if (!modulePerms || !modulePerms.includes(action)) {
      return res.status(403).json({ 
        success: false, 
        message: `Role '${req.user.role}' is not authorized to '${action}' on '${moduleName}'` 
      });
    }

    next();
  };
};

module.exports = authorizeAction;
