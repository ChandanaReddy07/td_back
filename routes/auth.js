const express = require("express");
const mongoose = require("mongoose");
// const passport = require("passport");
const router = express.Router();
const User = require('../models/user');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const client = new OAuth2Client('165139008887-n95m1k0s7obbffja33ne66mi3l35vide.apps.googleusercontent.com');


function verifyToken(token) {
  return client.verifyIdToken({
    idToken: token,
    audience: '165139008887-n95m1k0s7obbffja33ne66mi3l35vide.apps.googleusercontent.com'
  });
}

router.post('/google', async (req, res) => {
  try {
    const ticket = await verifyToken(req.body.token);
    const payload = ticket.getPayload();

    const currentUser = await User.findOne({ email: payload.email });

    if (currentUser) {
      console.log('User exists: ', currentUser);
      generateAndSendToken(res, currentUser);
    } else {
       // Modify this condition for your domain
        const newUser = await new User({
          _id: new mongoose.Types.ObjectId(),
          name: payload.name,
          email: payload.email,
        }).save();
        console.log('New user created: ', newUser);
        generateAndSendToken(res, newUser);
     
    }
  } catch (error) {
    console.log(error);
    res.status(400).send('Invalid token');
  }
});

function generateAndSendToken(res, user) {
  const payload = {
    email: user.email,
    name: user.name
  };

  const { _id, name, email } = user;

  const token = jwt.sign(payload, "YOUR_SECRET_KEY", { expiresIn: '1h' });

  res.json({
    token,
    user: { _id, name, email }
  });
}

router.get('/dashboard', (req, res) => {
  // Render the dashboard with the user's data
  const token = req.user;
  console.log(`Token here: ${token}`);

  return res.json({
    token,
    user: { _id, email } // Ensure _id and email are defined somewhere in the request
  });
});

module.exports = router;
