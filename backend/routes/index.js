// Archivo principal de rutas
const auth = require('./auth');
const dashboard = require('./dashboard');
const incidents = require('./incidents');
const network = require('./network');
const analytics = require('./analytics');
const customers = require('./customers');
const reports = require('./reports');
const users = require('./users');
const notifications = require('./notifications');

module.exports = {
  auth,
  dashboard,
  incidents,
  network,
  analytics,
  customers,
  reports,
  users,
  notifications
};