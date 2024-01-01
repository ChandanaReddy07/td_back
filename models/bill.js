const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const actionLogSchema = require('./action');


const billSchema = new Schema({
    
   
    // // Billing cycle count to track the number of times the user has been billed
    // billingCycleCount: {
    //     type: Number,
    //     default: 0
    // },
    totalAmount:{
        type:Number,
        default:0
    }
    ,actionLogs: [actionLogSchema] , // Array to store individual action logs

    // Count of CRUD operations performed by the user
    actionCount: {
        type: Number,
        default: 0
    },

    billingDate: {
        type: Date,
        default: Date.now
    },
    isPaid: {
        type: Boolean,
        default: false
    },
 
  
} 
);


module.exports = billSchema;

