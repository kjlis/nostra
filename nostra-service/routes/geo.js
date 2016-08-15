const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Loan = mongoose.model('Loan');
const Stats = mongoose.model('Stats');

const groupQuery = {
    $group: {
        _id: '$addr_state',
        count: {$sum: 1},
        total: {$sum: '$loan_amnt'},
        average: {$avg: '$loan_amnt'},
        average_dti: {$avg: '$dti'},
        average_int: {$avg: '$int_rate'},
        average_income: {$avg: '$annual_inc'},
        average_installment: {$avg: '$installment'},
        average_revol_util: {$avg: '$revol_util'},
        average_open_acc: {$avg: '$open_acc'}
    }
};


router.get('/:countryCode', (request, response) => {
    console.log(request.params.countryCode);
    Stats.find({type: 'country', key: request.params.countryCode}, {_id: 0})
        .sort('-date')
        .limit(1)
        .exec((err, stats) => {
            const currentTime = new Date(Date.now());
            const areStatsValid = stats.length === 1 && stats[0].date.getYear() === currentTime.getYear() && currentTime.getMonth() - stats[0].date.getMonth() < 4;
            if (areStatsValid) {
                response.json(stats[0]);
            }
            else {
                Loan.aggregate([groupQuery], (err, result) => {
                        if (err) {
                            console.log(err);
                        } else {
                            let countryStats = result.reduce((preResult, currentState) => {
                                const currentCount = preResult.count + currentState.count;
                                const currentTotal = preResult.total + currentState.total;

                                return {
                                    _id: request.params.countryCode,
                                    count: currentCount,
                                    total: currentTotal,
                                    average: currentTotal/currentCount,
                                    average_dti: (preResult.average_dti * preResult.count + currentState.average_dti * currentState.count) / currentCount,
                                    average_int: (preResult.average_int * preResult.count + currentState.average_int * currentState.count) / currentCount,
                                    average_income: (preResult.average_income * preResult.count + currentState.average_income * currentState.count) / currentCount,
                                    average_installment: (preResult.average_installment * preResult.count + currentState.average_installment * currentState.count) / currentCount,
                                    average_revol_util: (preResult.average_revol_util * preResult.count + currentState.average_revol_util * currentState.count) / currentCount,
                                    average_open_acc: (preResult.average_open_acc * preResult.count + currentState.average_open_acc * currentState.count) / currentCount
                                };
                            });

                            Stats.create({type: 'country', key: request.params.countryCode, stateStats: result, countryStats: countryStats});
                            response.json({type: 'country', key: request.params.countryCode, stateStats: result, countryStats: countryStats});
                        }
                    }
                );
            }
        });
});

module.exports = router;
