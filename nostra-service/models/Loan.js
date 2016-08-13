const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
    annual_inc: Number,
    addr_state: String,
    dti: Number,
    emp_length: Number,
    emp_title: String,
    grade: String,
    home_ownership: String,
    int_rate: Number,
    issue_date: Date,
    loan_amnt: Number,
    term: Number
}, {
    collection: 'all'
});

mongoose.model('Loan', LoanSchema);