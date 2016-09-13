const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const PD = mongoose.model('PD');
const spawn = require('child_process').spawn;


router.post('/', (request, response) => {
    let loan = new PD({loanDetails: request.body.loanDetails});
    loan.save((err) => {
        if (err) {
            console.log(err);
        }
        const R = spawn('Rscript',  ['pd_scripts/tree.R', request.body.loanDetails.term, request.body.loanDetails.paid/100]);
        R.stdout.on('data', (data) => {
            let result = data.toString();
            loan.behaviour = result.trim().slice(-1) === '0' ? 'positive' : 'negative';
            loan.save();
            response.json(loan);
        });
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

module.exports = router;