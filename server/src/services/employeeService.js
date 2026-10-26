const Employee = require('../models/Employee');

const getEmployees = async (query) => {
  const { department, page = 1, limit = 10, search } = query;
  const filter = {};
  if (department) filter.department = department;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { designation: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;
  const total = await Employee.countDocuments(filter);
  const items = await Employee.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  return { items, page: Number(page), limit: Number(limit), total };
};

const getEmployeeById = async (id) => {
  return Employee.findById(id);
};

const createEmployee = async (data) => {
  return Employee.create(data);
};

const updateEmployee = async (id, data) => {
  return Employee.findByIdAndUpdate(id, data, { new: true });
};

const deleteEmployee = async (id) => {
  return Employee.findByIdAndDelete(id);
};

module.exports = { getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee };
