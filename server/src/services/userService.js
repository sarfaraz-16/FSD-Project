const User = require('../models/User');
const bcrypt = require('bcrypt');

const getUsers = async () => {
  return User.find().select('-passwordHash').populate('employeeId', 'name department');
};

const createUser = async (data) => {
  const { name, email, password, role, employeeId } = data;
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new Error('User already exists');

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role,
    employeeId: employeeId || null
  });

  const userObj = user.toObject();
  delete userObj.passwordHash;
  return userObj;
};

const updateUser = async (id, data, requestUser) => {
  if (id === requestUser._id.toString()) {
    if (data.role && data.role !== requestUser.role) {
      throw new Error('Cannot change your own role');
    }
    if (data.isActive !== undefined && data.isActive !== requestUser.isActive) {
      throw new Error('Cannot deactivate your own account');
    }
  }

  const updateData = { ...data };
  if (data.password) {
    const salt = await bcrypt.genSalt(10);
    updateData.passwordHash = await bcrypt.hash(data.password, salt);
    delete updateData.password;
  }

  const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-passwordHash').populate('employeeId', 'name department');
  if (!user) throw new Error('User not found');
  return user;
};

module.exports = { getUsers, createUser, updateUser };
