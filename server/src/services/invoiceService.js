const Counter = require('../models/Counter');

const generateInvoiceNumber = async (session) => {
  const year = new Date().getFullYear();
  const counterId = `INV-${year}`;

  const counter = await Counter.findOneAndUpdate(
    { id: counterId },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, session }
  );

  const seqStr = String(counter.seq).padStart(4, '0');
  return `${counterId}-${seqStr}`;
};

module.exports = { generateInvoiceNumber };
