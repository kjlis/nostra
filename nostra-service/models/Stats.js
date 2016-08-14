const mongoose = require('mongoose');

const StatsSchema = new mongoose.Schema({
    type: String,
    key: String,
    date: {type: Date, default: Date.now},
    stats: Object
}, {
    collection: 'stats'
});

mongoose.model('Stats', StatsSchema);
