const mongoose = require('mongoose');

const PD = new mongoose.Schema({
    loanDetails: Object,
    pd: Number,
    accepted: Boolean
}, {
    collection: 'pd'
});

mongoose.model('PD', PD);
