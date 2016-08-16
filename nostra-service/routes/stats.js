const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Loan = mongoose.model('Loan');
const Stats = mongoose.model('Stats');


router.get('/status/:countryCode', (request, response) => {
    console.log(request.params.countryCode);
    Stats.find({type: 'statuses', key: request.params.countryCode}, {_id: 0})
        .sort('-date')
        .limit(1)
        .exec((err, stats) => {
            const currentTime = new Date(Date.now());
            const areStatsValid = stats.length === 1 && stats[0].date.getYear() === currentTime.getYear() && currentTime.getMonth() - stats[0].date.getMonth() < 4;
            if (areStatsValid) {
                response.json(stats[0]);
            }
            else {
                Loan.aggregate([{
                        $group: {
                            _id: '$loan_status',
                            count: {$sum: 1}
                        }
                    }], (err, result) => {
                        if (err) {
                            console.log(err);
                        } else {
                            Stats.create({type: 'statuses', key: request.params.countryCode, otherStats: result});
                            response.json({type: 'statuses', key: request.params.countryCode, otherStats: result});
                        }
                    }
                );
            }
        });
});

router.get('/purpose/:countryCode', (request, response) => {
    console.log(request.params.countryCode);
    Stats.find({type: 'purpose', key: request.params.countryCode}, {_id: 0})
        .sort('-date')
        .limit(1)
        .exec((err, stats) => {
            const currentTime = new Date(Date.now());
            const areStatsValid = stats.length === 1 && stats[0].date.getYear() === currentTime.getYear() && currentTime.getMonth() - stats[0].date.getMonth() < 4;
            if (areStatsValid) {
                response.json(stats[0]);
            }
            else {
                Loan.aggregate([{
                        $group: {
                            _id: {purpose: '$purpose', defaulted: '$defaulted'},
                            count: {$sum: 1}
                        }
                    }], (err, result) => {
                        if (err) {
                            console.log(err);
                        } else {
                            Stats.create({type: 'purpose', key: request.params.countryCode, otherStats: result});
                            response.json({type: 'purpose', key: request.params.countryCode, otherStats: result});
                        }
                    }
                );
            }
        });
});

router.get('/grades/:countryCode', (request, response) => {
    console.log(request.params.countryCode);
    Stats.find({type: 'grades', key: request.params.countryCode}, {_id: 0})
        .sort('-date')
        .limit(1)
        .exec((err, stats) => {
            const currentTime = new Date(Date.now());
            const areStatsValid = stats.length === 1 && stats[0].date.getYear() === currentTime.getYear() && currentTime.getMonth() - stats[0].date.getMonth() < 4;
            if (areStatsValid) {
                response.json(stats[0]);
            }
            else {
                Loan.aggregate([{
                        $group: ['$grade', '$defaulted'],
                        count: {$sum: 1}
                    }], (err, result) => {
                        if (err) {
                            console.log(err);
                        } else {
                            Stats.create({type: 'purpose', key: request.params.countryCode, otherStats: result});
                            response.json({type: 'purpose', key: request.params.countryCode, otherStats: result});
                        }
                    }
                );
            }
        });
});

router.get('/employment/:countryCode', (request, response) => {
    console.log(request.params.countryCode);
    Stats.find({type: 'employment', key: request.params.countryCode}, {_id: 0})
        .sort('-date')
        .limit(1)
        .exec((err, stats) => {
            const currentTime = new Date(Date.now());
            const areStatsValid = stats.length === 1 && stats[0].date.getYear() === currentTime.getYear() && currentTime.getMonth() - stats[0].date.getMonth() < 4;
            if (areStatsValid) {
                response.json(stats[0]);
            }
            else {
                Loan.aggregate([{
                        $group: ['$emp_length', '$defaulted'],
                        count: {$sum: 1}
                    }], (err, result) => {
                        if (err) {
                            console.log(err);
                        } else {
                            Stats.create({type: 'employment', key: request.params.countryCode, otherStats: result});
                            response.json({type: 'employment', key: request.params.countryCode, otherStats: result});
                        }
                    }
                );
            }
        });
});

router.get('/ownership/:countryCode', (request, response) => {
    console.log(request.params.countryCode);
    Stats.find({type: 'ownership', key: request.params.countryCode}, {_id: 0})
        .sort('-date')
        .limit(1)
        .exec((err, stats) => {
            const currentTime = new Date(Date.now());
            const areStatsValid = stats.length === 1 && stats[0].date.getYear() === currentTime.getYear() && currentTime.getMonth() - stats[0].date.getMonth() < 4;
            if (areStatsValid) {
                response.json(stats[0]);
            }
            else {
                Loan.aggregate([{
                        $group: {
                            _id: {ownership: '$home_ownership', defaulted: '$defaulted'},
                            count: {$sum: 1}
                        }
                    }], (err, result) => {
                        if (err) {
                            console.log(err);
                        } else {
                            Stats.create({type: 'ownership', key: request.params.countryCode, otherStats: result});
                            response.json({type: 'ownership', key: request.params.countryCode, otherStats: result});
                        }
                    }
                );
            }
        });
});
module.exports = router;

