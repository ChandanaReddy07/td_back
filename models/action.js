const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const actionLogSchema = new Schema({
    actionType: {
        type: String,
        enum: ['POST', 'PUT', 'DELETE'],
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = actionLogSchema;

