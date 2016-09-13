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
        const R = spawn('Rscript',  ['pd_scripts/classify.R', request.body.loanDetails.term, request.body.loanDetails.paid/100]);
        R.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
            let result = data.toString();
            console.log(result);
            console.log(result.trim().slice(-1));
            loan.behaviour = result.trim().slice(-1) === '0' ? 'positive' : 'negative';
            console.log(`Predicted loan behaviour: ${loan.behaviour}`);
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

router.post('/test/abc', (reqest, response) => {
    const ls = spawn('Rscript',  ['pd_scripts/classify.R']);

    ls.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    ls.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
    });

    ls.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
    // console.log('pd_scripts/classify.R');
    // fs.stat('pd_scripts/classify.R', (err, stats) => {
    //     if(err) {
    //         console.log(err);
    //     } else {
    //         console.log(stats);
    //     }
    // });
    //
    //
    // var out = R('pd_scripts/classify.R')
    //     .data({req_term: 36, req_ratio: 0.9})
    //     .call((err, out) => {
    //         if(err) {
    //             console.log('ERROR');
    //             console.log(err);
    //         } else {
    //             console.log(out);
    //             response.json(out === 0 ? 'positive' : 'negative');
    //         }
    //     });
    // console.log(out);
    // response.json(out);
});

module.exports = router;