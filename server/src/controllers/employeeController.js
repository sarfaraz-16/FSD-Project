const employeeService = require('../services/employeeService');
const { sendSuccess } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const result = await employeeService.getEmployees(req.query);
    res.status(200).json({ success: true, ...result, message: 'Employees fetched' });
  } catch (error) { next(error); }
};

const getById = async (req, res, next) => {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: 'Not found' });
    sendSuccess(res, employee, 'Employee fetched');
  } catch (error) { next(error); }
};

const create = async (req, res, next) => {
  try {
    const employee = await employeeService.createEmployee(req.body);
    sendSuccess(res, employee, 'Employee created', 201);
  } catch (error) { next(error); }
};

const update = async (req, res, next) => {
  try {
    const employee = await employeeService.updateEmployee(req.params.id, req.body);
    sendSuccess(res, employee, 'Employee updated');
  } catch (error) { next(error); }
};

const remove = async (req, res, next) => {
  try {
    await employeeService.deleteEmployee(req.params.id);
    sendSuccess(res, null, 'Employee deleted');
  } catch (error) { next(error); }
};

module.exports = { getAll, getById, create, update, remove };
