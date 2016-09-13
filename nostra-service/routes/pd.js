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
    console.log('pd_scripts/classify.R');
    fs.stat('pd_scripts/classify.R', (err, stats) => {
        if(err) {
            console.log(err);
        } else {
            console.log(stats);
        }
    });


    var out = R('pd_scripts/classify.R')
        .data({req_term: 36, req_ratio: 0.9})
        .call((err, out) => {
            if(err) {
                console.log('ERROR');
                console.log(err);
            } else {
                console.log(out);
                response.json(out === 0 ? 'positive' : 'negative');
            }
        });
    // console.log(out);
    // response.json(out);
});

module.exports = router;