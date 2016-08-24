const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const PD = mongoose.model('PD');
let R = require('r-script');

router.post('/', (request, response) => {
    let loan = new PD({loanDetails: request.body.loanDetails});
    loan.save((err) => {
        if(err) {
            throw err;
        }
        loan.pd = 5.42;
        loan.save();
        response.json(loan);
    });
});

router.post('/:loanId', (request, response) => {
    PD.findById(request.params.loanId, (error, loan) => {
        loan.accepted = request.body.accepted;
        loan.save((err) => {
            if(err) {
                throw err;
            }
            response.json(loan);
        });
    });

});

router.post('/test/abc', (reqest, response) => {
    var out = R('pd_scripts/dummyPD.R')
        .data({minVal: 1, maxVal: 6})
        .callSync();
    console.log(out);
    response.json(out);
});

module.exports = router;