const reportService = require('../services/reportService');
const { sendSuccess } = require('../utils/response');

const convertToCSV = (data, fields) => {
  if (!data || !data.length) return '';
  const headers = fields.map(f => f.label).join(',');
  const rows = data.map(row => {
    return fields.map(f => {
      let val = row;
      const keys = f.value.split('.');
      for (const k of keys) {
        val = val ? val[k] : '';
      }
      if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`;
      if (val instanceof Date) return `"${val.toISOString()}"`;
      return val !== undefined && val !== null ? val : '';
    }).join(',');
  });
  return [headers, ...rows].join('\n');
};

const handleReport = async (req, res, next, serviceCall, csvFields, filename) => {
  try {
    const result = await serviceCall(req.query);
    if (req.query.format === 'csv') {
      const csv = convertToCSV(result, csvFields);
      res.header('Content-Type', 'text/csv');
      res.attachment(filename);
      return res.send(csv);
    }
    sendSuccess(res, result, 'Report fetched');
  } catch (error) { next(error); }
};

const getSalesReport = (req, res, next) => {
  const fields = [
    { label: 'Date', value: 'createdAt' },
    { label: 'Invoice No', value: 'invoiceNo' },
    { label: 'Customer', value: 'customer.name' },
    { label: 'Status', value: 'status' },
    { label: 'Total', value: 'total' },
  ];
  handleReport(req, res, next, reportService.getSalesReport, fields, 'sales_report.csv');
};

const getPurchasesReport = (req, res, next) => {
  const fields = [
    { label: 'Date', value: 'createdAt' },
    { label: 'Supplier', value: 'supplier.name' },
    { label: 'Status', value: 'status' },
    { label: 'Total', value: 'total' },
  ];
  handleReport(req, res, next, reportService.getPurchasesReport, fields, 'purchases_report.csv');
};

const getLowStockReport = (req, res, next) => {
  const fields = [
    { label: 'SKU', value: 'sku' },
    { label: 'Name', value: 'name' },
    { label: 'Category', value: 'category.name' },
    { label: 'Stock Qty', value: 'stockQty' },
    { label: 'Reorder Level', value: 'reorderLevel' },
  ];
  handleReport(req, res, next, reportService.getLowStockReport, fields, 'low_stock_report.csv');
};

module.exports = { getSalesReport, getPurchasesReport, getLowStockReport };
