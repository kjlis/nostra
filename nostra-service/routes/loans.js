var express = require('express');
var router = express.Router();


router.post('/', (request, response) => {
    let loan = request.body;
    loan.id = 14;
    loan.pd = 5.54;
    response.send(loan);
});

router.post('/:id', (request, response) => {
    console.log('Save loan!');
    console.log('Id: ' + request.params.id);
    console.log('Accepted: ' + request.body.accepted);
    let loan = request.body;
    response.send(loan);
});

module.exports = router;
