const mongoose = require('mongoose');

const { Schema } = mongoose;

const reportModel = new Schema({
  reportInformations: {
    city: String,
    long: String,
    lat: String
  },
  diagnose: {
    infection: { type: String },
    sick: { type: Boolean },
    symptoms: [{}]
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('reports', reportModel);
