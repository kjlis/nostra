const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const PD = mongoose.model('PD');
let R = require('r-script');

const fs = require('fs');

router.post('/', (request, response) => {
    let loan = new PD({loanDetails: request.body.loanDetails});
    loan.save((err) => {
        if(err) {
            throw err;
        }
        loan.behaviour = 'positive';
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
    console.log('pd_scripts/dummyPD.R');
    fs.stat('pd_scripts/dummyPD.R', (err, stats) => {
        if(err) {
            console.log(err);
        } else {
            console.log(stats);
        }
    });


    var out = R('pd_scripts/dummyPD.R')
        .data({minVal: 1, maxVal: 6})
        .call((err, out) => {
            if(err) {
                console.log('ERROR');
                console.log(err);
            } else {
                console.log(out);
                response.json(out);
            }
        });
    fs.stat('pd_scripts/dummyPD.R', (err, stats) => {
        if(err) {
            console.log(err);
        } else {
            console.log(stats);
        }
    });
    // console.log(out);
    // response.json(out);
});

module.exports = router;