const cron = require('node-cron');
const Report = require('../models/Report');
const reportService = require('../services/reportService');

// Run every day at 23:59
cron.schedule('59 23 * * *', async () => {
  try {
    console.log('Generating daily summary report...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const summary = await reportService.getDashboardSummary('admin');
    const lowStock = await reportService.getLowStockReport({ limit: 1000 });

    await Report.findOneAndUpdate(
      { date: today },
      {
        date: today,
        totalSalesValue: summary.todaySalesTotal,
        totalSalesCount: summary.todaySalesCount,
        lowStockItemsCount: summary.lowStockCount,
        lowStockItems: lowStock.items.map(i => ({
          product: i._id,
          sku: i.sku,
          name: i.name,
          stockQty: i.stockQty,
          reorderLevel: i.reorderLevel
        }))
      },
      { upsert: true, new: true }
    );
    console.log('Daily summary report generated successfully.');
  } catch (error) {
    console.error('Error generating daily summary report:', error);
  }
});
