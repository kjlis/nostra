const mongoose = require('mongoose');

const StatsSchema = new mongoose.Schema({
    type: String,
    key: String,
    date: {type: Date, default: Date.now},
    stateStats: Object,
    countryStats: Object
}, {
    collection: 'statistics'
});

mongoose.model('Stats', StatsSchema);
