const Product = require('../models/Product');
const SalesOrder = require('../models/SalesOrder');
const PurchaseOrder = require('../models/PurchaseOrder');
const permissions = require('../../../shared/permissions.json');
const { sendSuccess } = require('../utils/response');

const getNotifications = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const rolePerms = permissions[userRole] || {};

    const canReadInventory = rolePerms.inventory?.includes('read');
    const canReadSales = rolePerms.sales?.includes('read');
    const canReadPurchases = rolePerms.purchases?.includes('read');

    const notifications = [];

    // 1. Inventory Low Stock & Out of Stock Alerts
    if (canReadInventory) {
      const lowStockProducts = await Product.find({
        $expr: { $lte: ['$stockQty', '$reorderLevel'] },
        isActive: true,
      }).populate('category', 'name').sort({ stockQty: 1 }).limit(15);

      lowStockProducts.forEach(product => {
        const isOutOfStock = product.stockQty <= 0;
        notifications.push({
          id: `stock-${product._id}`,
          type: isOutOfStock ? 'out_of_stock' : 'low_stock',
          category: 'inventory',
          severity: isOutOfStock ? 'critical' : 'warning',
          title: isOutOfStock ? `Out of Stock: ${product.name}` : `Low Stock Alert: ${product.name}`,
          message: isOutOfStock
            ? `SKU ${product.sku} has 0 units in stock. Urgent reorder recommended.`
            : `SKU ${product.sku} has ${product.stockQty} unit(s) left (reorder threshold: ${product.reorderLevel}).`,
          link: canReadPurchases ? '/purchases/new' : '/inventory',
          actionLabel: canReadPurchases ? 'Reorder Now' : 'View Stock',
          metadata: {
            productId: product._id,
            sku: product.sku,
            name: product.name,
            stockQty: product.stockQty,
            reorderLevel: product.reorderLevel,
            category: product.category?.name
          },
          createdAt: product.updatedAt || new Date()
        });
      });
    }

    // 2. Sales Orders Draft / Review Alerts
    if (canReadSales) {
      const draftSales = await SalesOrder.find({ status: 'draft' })
        .populate('customer', 'name')
        .sort({ createdAt: -1 })
        .limit(10);

      draftSales.forEach(order => {
        const orderIdentifier = order.invoiceNo || order._id.toString().slice(-6).toUpperCase();
        notifications.push({
          id: `sales-draft-${order._id}`,
          type: 'sales_draft',
          category: 'orders',
          severity: 'info',
          title: `Draft Sales Order #${orderIdentifier}`,
          message: `Order for ${order.customer?.name || 'Customer'} ($${order.total.toFixed(2)}) is awaiting confirmation to allocate inventory.`,
          link: `/sales/${order._id}`,
          actionLabel: 'Review Order',
          metadata: {
            orderId: order._id,
            invoiceNo: order.invoiceNo,
            total: order.total
          },
          createdAt: order.createdAt
        });
      });
    }

    // 3. Purchase Orders In-Transit / Awaiting Goods Receipt
    if (canReadPurchases) {
      const pendingPurchases = await PurchaseOrder.find({ status: 'ordered' })
        .populate('supplier', 'name')
        .sort({ updatedAt: -1 })
        .limit(10);

      pendingPurchases.forEach(order => {
        const poId = order._id.toString().slice(-6).toUpperCase();
        notifications.push({
          id: `purchase-ordered-${order._id}`,
          type: 'purchase_ordered',
          category: 'orders',
          severity: 'warning',
          title: `Incoming Goods: PO #${poId}`,
          message: `Shipment from ${order.supplier?.name || 'Supplier'} ($${order.total.toFixed(2)}) is ordered. Awaiting goods receipt to update stock.`,
          link: `/purchases/${order._id}`,
          actionLabel: 'Receive Stock',
          metadata: {
            orderId: order._id,
            supplier: order.supplier?.name,
            total: order.total
          },
          createdAt: order.updatedAt || order.createdAt
        });
      });
    }

    // Sort all notifications by severity (critical first, then warning, then info), then newest
    const severityWeight = { critical: 3, warning: 2, info: 1 };
    notifications.sort((a, b) => {
      const weightDiff = (severityWeight[b.severity] || 0) - (severityWeight[a.severity] || 0);
      if (weightDiff !== 0) return weightDiff;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const counts = {
      total: notifications.length,
      inventory: notifications.filter(n => n.category === 'inventory').length,
      orders: notifications.filter(n => n.category === 'orders').length,
      system: notifications.filter(n => n.category === 'system').length,
      critical: notifications.filter(n => n.severity === 'critical').length,
      warning: notifications.filter(n => n.severity === 'warning').length,
    };

    sendSuccess(res, { notifications, counts }, 'Notifications fetched successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications };
