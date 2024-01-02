const  Todo = require("../models/todo")
const User= require("../models/user")

const axios = require('axios');






exports.getTodoById=(req,res,next,id)=>{

    Todo.findById(id).exec((err,todo)=>{
        if(err||!todo){
           return  res.status(400).json({
               error:"No Todo in db"
           })
        }
        req.todo=todo;
        next();
    })
}

exports.getTodo=(req,res)=>{
    return res.json(req.todo);
}


//create todo
exports.createTodo = (req, res) => {
    const { name, description } = req.body;
    const userId = req.profile._id;

    const todo = new Todo({ name, description, userId });

    todo.save(async (err, todo) => {
        if (err) {
            console.log(err);
            return res.status(400).json({ err: "Can't save to the DB" });
        }

        try {
            const user = await User.findById(userId);

            if (user.startDate === null) {
                user.startDate = new Date();

            }

           
            await user.save();

        } catch (error) {
            console.error('Error updating user:', error);
        }


        res.json({ todo });
    });
};


//delete todo
exports.deleteTodo = (req, res) => {
    let todo = req.todo;
    const userId = req.profile._id;

    todo.remove((err, todo) => {
        if (err) {
            return res.status(400).json({ error: "Failed to delete the todo" });
        }

        // Increment the deleted count for the user
        User.findByIdAndUpdate(userId, { $inc: { 'taskCounts.deleted': 1 } }, (err, user) => {
            if (err) {
                console.log('Error updating task delete count:', err);
            } else {

               
                // Send webhook after successful update
            }
        });
        res.json({ message: `Deletion is successful: ${todo}` });
    });
};


//update todo
exports.updateTodo = (req, res) => {
    const userId = req.profile._id;

    Todo.findByIdAndUpdate(
        { _id: req.todo._id },
        { $set: req.body },
        { new: true, useFindAndModify: false },
        (err, updatedTodo) => {
            if (err) {
                return res.status(400).json({ error: "You are not authorised to update this Todo" });
            }

            User.findByIdAndUpdate(userId, { $inc: { 'taskCounts.updated': 1 } }, (err, user) => {
                if (err) {
                    console.log('Error updating task update count:', err);
                } else {
                  
                    // Send webhook after successful update
                }
            });

            res.json(updatedTodo);
        }    );
};

//bill
