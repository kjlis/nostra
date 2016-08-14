const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Loan = mongoose.model('Loan');
const Stats = mongoose.model('Stats');

router.post('/', (request, response) => {
    let loan = request.body;
    loan.id = 14;
    loan.pd = 5.54;
    response.send(loan);
});

router.get('/', (request, response) => {
    Stats.find({type: 'country', key: 'US'}, {_id: 0})
        .sort('-date')
        .limit(1)
        .exec((err, stats) => {
            const currentTime = new Date(Date.now());
            const areStatsValid = stats.length === 1 && stats[0].date.getYear() === currentTime.getYear() && currentTime.getMonth() - stats[0].date.getMonth() < 4;
            if (areStatsValid) {
                response.json(stats[0].stats);
            }
            else {
                Loan.aggregate(
                    [
                        {
                            $group: {
                                _id: '$addr_state',
                                total: {$sum: '$loan_amnt'},
                                average: {$avg: '$loan_amnt'}
                            }
                        }
                    ],
                    (err, result) => {
                        if (err) {
                            console.log(err);
                        } else {
                            Stats.create({type: 'country', key: 'US', stats: result});
                            response.json(result);
                        }
                    }
                );
            }
        });
});

router.get('/:stateCode', (request, response) => {
    Loan.aggregate(
        [
            {
                $match: {addr_state: request.params.stateCode}
            },
            {
                $group: {
                    _id: '$addr_state',
                    count: {$sum: 1},
                    total: {$sum: '$loan_amnt'},
                    average: {$avg: '$loan_amnt'},
                    average_int: {$avg: '$int_rate'},
                    average_income: {$avg: '$annual_inc'}
                }
            }
        ],
        (err, result) => {
            if (err) {
                console.log(err);
            } else {
                response.json(result);
            }
        }
    );
});

router.post('/:id', (request, response) => {
    console.log('Save loan!');
    console.log('Id: ' + request.params.id);
    console.log('Accepted: ' + request.body.accepted);
    let loan = request.body;
    response.send(loan);
});

module.exports = router;
