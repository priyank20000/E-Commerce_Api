const jwt = require('jsonwebtoken');
const Admin = require('../model/admin.model');
const Role = require('../model/role.model');
const Permission = require('../model/permissions.model');

module.exports = (requiredPermissions = []) => {
  return async (req, res, next) => {
    try {
      const token = req.cookies['token'];
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
      }
      const decoded = jwt.verify(token, process.env.SECRET);
      const user = await Admin.findById(decoded.id) || await Role.findById(decoded.id).populate('roles');
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized: User not found' });
      }
      if (user.isAdmin) {
        return next(); // Admins can access all resources
      }
      const roles = await Permission.find({ _id: { $in: user.roles } }).populate('permissions').exec();
      if (!roles.length) {
        console.log('No roles found for user');
        return res.status(403).json({ message: 'Forbidden' });
      }
      const rolePermissions = roles.flatMap(role => role.permissions.map(permission => permission.permission));
      const hasPermission = requiredPermissions.every(permission => rolePermissions.includes(permission));
      if (!hasPermission) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
};
