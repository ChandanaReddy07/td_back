const express=require("express")
const router=express.Router();

const {createTodo,getTodo,getTodoById,deleteTodo,updateTodo} = require("../controllers/todo")
 const {isSignedIn,isAuthenticated,getAllTodo,deleteUser,userVerify} = require("../controllers/users")
const {getUserById} = require("../controllers/users")
const User = require("../models/user");
const { billUpdater, generateAndSendInvoice } = require("../utils/helper");



//all of params
router.param("todoId",getTodoById)
router.param("userId",getUserById)


//create todo route
router.post("/todo/create/:userId",billUpdater,createTodo)


//get todo route
router.get("/todo/:todoId/:userId",getTodo);


//delete todo route
router.delete("/todo/:todoId/:userId",billUpdater,deleteTodo)
//delete user route
router.delete("/user/:userId",isSignedIn,isAuthenticated,deleteUser)


//update todo route
router.put("/todo/:todoId/:userId",billUpdater,updateTodo)


//listing all todos of a specific user route
router.get("/todos/:userId",getAllTodo);


//taskcount
// GET endpoint to fetch task counts of a user
router.get('/user/taskcounts/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId).select('actionLogs');

        if (!user) {
            return res.status(404).send('User not found');
        }

        const aggregatedData = user.actionLogs.reduce((acc, log) => {
            const dateStr = log.date.toISOString().split('T')[0];

            if (!acc[dateStr]) {
                acc[dateStr] = { created: 0, updated: 0, deleted: 0 };
            }

            // Increment the appropriate counter based on the action type
            if (log.actionType === 'POST') {
                acc[dateStr].created++;
            } else if (log.actionType === 'PUT') {
                acc[dateStr].updated++;
            } else if (log.actionType === 'DELETE') {
                acc[dateStr].deleted++;
            }

            return acc;
        }, {});

        res.json(aggregatedData);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//billing
const COST_PER_ACTION = {
    'create': 0.1,
    'update': 0.2,
    'delete': 0
};

router.get('/billing/:userId' , async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send('User not found');
        }
      
        // Prepare the billing data
        const billingData = {
            startDate: user.startDate,
            totalBill: user.currentAmount.toFixed(2), // Format to 2 decimal places
            actionCount: user.actionCount,
            isPaid : false,
            actionLogs: user.actionLogs
        };

        res.json(billingData);
    } catch (error) {
        console.error('Error fetching billing data:', error);
        res.status(500).send(error.message);
    }
});




// Example Express.js route
router.post('/todo/generate-invoice/:userId', async (req, res) => {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (user) {
        await generateAndSendInvoice(user);
        res.send('Invoice is been sent to your email');
    } else {
        res.status(404).send('User not found');
    }
});


module.exports=router;


