const mongoose= require("mongoose")

var Schema=mongoose.Schema;
const {ObjectId}= mongoose.Schema;

var todoSchema= new Schema({
    name: {
        type:String,
        required:true,
    },
    description:{
        type:String,
    },
    //reference keyword
    userId:{
        type:String  
    } 
   
}, {
    timestamps:true
});

module.exports= mongoose.model("Todo",todoSchema);