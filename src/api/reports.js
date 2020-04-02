const express = require('express');

const moment = require('moment');

const Report = require('../models/reportModel.js');

const router = express.Router();

// get Daily report
router.get('/', async (req, res) => {
  let date;

  if (req.query.date) {
    date = moment(req.query.date);
  } else {
    date = moment().startOf('day');
  }

  const reports = await Report.aggregate([
    { $unwind: '$reportInformations' },
    {
      $match: {
        createdAt: {
          $gte: date.toDate(),
          $lte: moment(date)
            .endOf('day')
            .toDate()
        }
      }
    },
    {
      $group: {
        _id: {
          _id: '$reportInformations.city',
          reportInformations: '$reportInformations',
          diagnose: '$diagnose.sick'
        },
        date: { $first: '$createdAt' },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id._id',
        reportInformations: { $first: '$_id.reportInformations' },
        diagnose: {
          $push: {
            $cond: [
              { $eq: ['$_id.diagnose', true] },
              { sick: '$count' },
              { healthy: '$count' }
            ]
          }
        },
        date: { $last: '$date' }
      }
    },
    {
      $project: {
        _id: 0,
        date: 1,
        reportInformations: 1,
        diagnose: 1,
        sicks: {
          $cond: [
            {
              $ne: [
                {
                  $ifNull: [{ $arrayElemAt: ['$diagnose.sick', 0] }, null]
                },
                null
              ]
            },
            { $arrayElemAt: ['$diagnose.sick', 0] },
            0
          ]
        },
        healthy: {
          $cond: [
            {
              $ne: [
                {
                  $ifNull: [{ $arrayElemAt: ['$diagnose.healthy', 0] }, null]
                },
                null
              ]
            },
            { $arrayElemAt: ['$diagnose.healthy', 0] },
            0
          ]
        }
      }
    }
  ]);

  const dailyReport = reports.map((report) => ({
    date: moment(report.date).format('YYYY-MM-DD'),
    city: report.reportInformations.city,
    latitude: report.reportInformations.lat,
    longitude: report.reportInformations.long,
    sicks: report.sicks,
    healthy: report.healthy
  }));

  console.log(dailyReport);
  return res.json(dailyReport);
});

// store a report to DB
router.post('/', (req, res) => {
  const report = new Report(req.body);
  report.save();
  res.status(201).send(report);
});

module.exports = router;
