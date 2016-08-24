const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const PD = mongoose.model('PD');

router.post('/', (request, response) => {
    let loan = new PD({loanDetails: request.body.loanDetails});
    loan.save((err) => {
        if(err) {
            throw err;
        }
        console.log(loan.id);
        loan.pd = 5.51;
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

module.exports = router;