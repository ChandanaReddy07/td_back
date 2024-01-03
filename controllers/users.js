const User = require("../models/user");
const Todo = require("../models/todo");

exports.getUserById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      res.status(401).json({
        err: "no user found in database",
      });
    }
    req.profile = user;
    next();
  });
};

//get All todos
exports.getAllTodo = (req, res) => {
  Todo.find({ userId: req.profile._id }).exec((err, todo) => {
    if (err) {
      return res.status(400).json({
        error: "No todo found in db",
      });
    }
    res.json(todo);
  });
};

exports.getUser = (req, res) => {
  return res.json(req.profile);
};

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.json({
    message: "User signout succcessfully",
  });
};
