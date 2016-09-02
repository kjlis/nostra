const mongoose = require('mongoose');

const PD = new mongoose.Schema({
    loanDetails: Object,
    behaviour: String,
    accepted: Boolean
}, {
    collection: 'pd'
});

mongoose.model('PD', PD);
