const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const actionLogSchema = require('./action');
const billSchema = require('./bill');

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        maxlength: 32
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
      // Count of CRUD operations performed by the user
      actionCount: {
        type: Number,
        default: 0
    },
    startDate:{
        type: Date,
        default: null
    },
    actionLogs: [actionLogSchema] , // Array to store individual action logs
    currentAmount: {
        type: Number,
        default: 0
    },
    bills: [billSchema] // Array of bills
});

const User = mongoose.model('User', userSchema);
module.exports = User;
