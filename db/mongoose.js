let mongooose = require('mongoose');

mongooose.Promise = global.Promise;

mongooose.connect('mongodb://localhost:27017/location');

module.exports = {mongooose}