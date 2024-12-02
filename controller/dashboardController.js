const APIFeatures = require('../utils/APIFeatures');
const CatchAsync = require('../utils/CatchAsync');
const AppError = require('../utils/appError');
const Invoices = require('../model/invoiceModel');
const Clients = require('../model/clientModel');
const moment = require('moment');

exports.getDashboardReports = CatchAsync(async (req, res, next) => {
  let startDate, endDate;

  // Set date range based on query
  if (req.query.filter === 'custom' && req.query.startDate && req.query.endDate) {
    // startDate = moment(req.query.startDate).startOf('day').toDate();
    // endDate = moment(req.query.endDate).endOf('day').toDate();
    // console.log('object', startDate, endDate);
    startDate = new Date(req.query.startDate);
    endDate = new Date(req.query.endDate);
    // console.log('Custom filter:', startDate, endDate);
  } else {
    switch (req.query.filter) {
      case 'today':
        startDate = moment().startOf('day').toDate();
        endDate = moment().endOf('day').toDate();
        break;
      case 'this_week':
        startDate = moment().subtract(7, 'days').startOf('day').toDate();
        endDate = moment().endOf('day').toDate();
        break;
      case 'this_month':
        startDate = moment().startOf('month').toDate();
        endDate = moment().endOf('month').toDate();
        break;
      case 'this_year':
        startDate = moment().startOf('year').toDate();
        endDate = moment().endOf('year').toDate();
        break;
      default:
        startDate = moment().startOf('year').toDate();
        endDate = moment().endOf('year').toDate();
    }
  }

  // Clients added within the date range
  const clients = await Clients.find({
    isDeleted: false,
    createdAt: { $gte: startDate, $lte: endDate },
  });

  // Invoices within the date range
  const invoices = await Invoices.find({
    isDeleted: false,
    createdAt: { $gte: startDate, $lte: endDate },
  });

  // Client metrics
  const totalClientsAdded = clients.length;

  // Invoice metrics
  const totalInvoices = invoices.length;
  const totalUnpaidInvoices = invoices.filter((invoice) => invoice.status === 'unpaid').length;
  const overdueInvoices = invoices.filter(
    (invoice) =>
      invoice.status === 'unpaid' &&
      moment(invoice.invoiceDueDate, 'YYYY-MM-DD').isBefore(moment()),
  ).length;
  const invoiceStatusSummary = {
    paid: invoices.filter((invoice) => invoice.status === 'paid').length,
    unpaid: totalUnpaidInvoices,
  };

  // Calculate total, paid, and unpaid invoice amounts
  const totalInvoiceAmount = invoices
    .reduce((acc, invoice) => acc + (parseFloat(invoice.totalDue) || 0), 0)
    .toFixed(2);
  const totalPaidInvoiceAmount = invoices
    .filter((invoice) => invoice.status === 'paid')
    .reduce((acc, invoice) => acc + (parseFloat(invoice.totalDue) || 0), 0)
    .toFixed(2);
  const totalUnpaidInvoiceAmount = invoices
    .filter((invoice) => invoice.status === 'unpaid')
    .reduce((acc, invoice) => acc + (parseFloat(invoice.totalDue) || 0), 0)
    .toFixed(2);

  const averageInvoiceAmount = (totalInvoiceAmount / totalInvoices || 0).toFixed(2);
  const totalTaxCollected = invoices
    .reduce((acc, invoice) => acc + (parseFloat(invoice.taxAmount) || 0), 0)
    .toFixed(2);
  const totalRevenueCollected = invoices
    .filter((invoice) => invoice.status === 'paid')
    .reduce((acc, invoice) => acc + (parseFloat(invoice.totalDue) || 0), 0)
    .toFixed(2);

  // Fetch all invoices for monthly sales (independent of date filter)
  const _invoices = await Invoices.find({
    isDeleted: false,
  });

  // Initialize monthly sales with all months in the current year
  const monthlySales = [];
  let currentMonth = moment().startOf('year'); // Start from January
  let lastMonth = moment().endOf('year'); // End at December

  while (currentMonth.isSameOrBefore(lastMonth, 'month')) {
    monthlySales.push({ month: currentMonth.format('YYYY-MM'), sales: 0 });
    currentMonth.add(1, 'month');
  }

  // Populate monthly sales with actual data
  _invoices.forEach((invoice) => {
    const month = moment(invoice.createdAt).format('YYYY-MM');
    const totalDue = parseFloat(invoice.totalDue) || 0;

    // Find the corresponding month in monthlySales and add the sales
    const monthEntry = monthlySales.find((entry) => entry.month === month);
    if (monthEntry) {
      monthEntry.sales += totalDue;
    }
  });

  return res.status(200).json({
    status: 'success',
    data: {
      totalClientsAdded,
      totalInvoices,
      totalUnpaidInvoices,
      overdueInvoices,
      invoiceStatusSummary,
      averageInvoiceAmount,
      totalTaxCollected,
      totalRevenueCollected,
      totalInvoiceAmount, // Total amount of all invoices
      totalPaidInvoiceAmount, // Total amount of paid invoices
      totalUnpaidInvoiceAmount, // Total amount of unpaid invoices
      monthlySales, // Sales by month with zero-filled months
    },
  });
});
