const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Loan = mongoose.model('Loan');

router.post('/', (request, response) => {
    let loan = request.body;
    loan.id = 14;
    loan.pd = 5.54;
    response.send(loan);
});

router.get('/', (request, response, next) => {
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
                response.json(result);
            }
        }
    );
});

router.get('/:stateCode', (request, response, next) => {
    Loan.aggregate(
        [
            {
                $match: {}
            },
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
