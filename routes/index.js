const express = require('express');
const router = express.Router();

const adminRoutes = require('./admin');
const brandRoutes = require('./brand');

const userRoutes = require('./user');
const clientRoutes = require('./client');
const invoiceRoutes = require('./invoice');
const businessRoutes = require('./business');
const paymentRoutes = require('./payment');
const leadRoutes = require('./lead');
const dashboardRoutes = require('./dashboard');
const logRoutes = require('./log');
const expenseRoutes = require('./expense');

const routes = [
  { path: '/users', route: userRoutes },
  { path: '/admin', route: adminRoutes },
  { path: '/brands', route: brandRoutes },
  { path: '/clients', route: clientRoutes },
  { path: '/invoices', route: invoiceRoutes },
  { path: '/business', route: businessRoutes },
  { path: '/leads', route: leadRoutes },
  { path: '/payments', route: paymentRoutes },
  { path: '/dashboard', route: dashboardRoutes },
  { path: '/logs', route: logRoutes },
  { path: '/expense', route: expenseRoutes },
];

routes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
