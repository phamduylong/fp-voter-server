const express = require("express");
const router = express.Router();
const User = require('../models/User');
const JWT = require('../models/JWT');
const {checkInactiveToken} = require('../utilities/utilities');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');


dotenv.config();
const JWT_KEY = process.env.JWT_SECRET;

const checkJwtExpiration = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        try {
            const decodedToken = jwt.verify(token, JWT_KEY);
            const matchToken = await checkInactiveToken(token);

            if (matchToken === true) {
                return res.status(401).json({ message: 'Token is inactive' });
            }
            else {
                if (decodedToken.exp * 1000 < Date.now()) {
                    // Token has expired, send a 401 Unauthorized response
                    return res.status(401).json({ message: 'Token has expired' });
                }
            }

            // Token is still valid, continue with the request
            req.user = decodedToken;
            next();
        } catch (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
    } else {
        return res.status(401).json({ message: 'Token not provided' });
    }
};



router.post('/register', async (req, res) => {
    const username = req.body.username;
    let password = req.body.password;

    try {
        const user = await User.find({ username: username });
        if (user.length === 0) {
            const salt = await bcrypt.genSalt();
            password = await bcrypt.hash(password, salt);
            const newUser = new User({ username: username, password: password, isAdmin: false });
            let userSaved = await newUser.save();
            if (userSaved != {}) {
                return res.status(200).send({ message: "User saved successfully!" });
            }
            return res.status(500).send({ error: "Unable To Create User!" });
        }
        return res.status(400).send({ error: "Error: User already exists!" });

    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: "Unable To Create User!" });
    }
})


router.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;


    try {
        const user = await User.find({ username: username })
        if (user.length === 1) {
            const match = await bcrypt.compare(password, user[0].password);
            if (match) {
                const token = jwt.sign({ user: username }, JWT_KEY, { expiresIn: '1hr' });
                return res.status(200).send({ token: token });
            } 
                return res.status(401).send({ error: "Error: Incorrect Password!" });
        }
        else if (user.length > 1) {
            return res.status(500).send({ error: "Error: Username duplicated!" });
        } else if (user.length === 0) {
            return res.status(400).send({ error: "Error: User Not Found!" });
        }
    } catch (error) {
        return res.status(500).send({ error: "Error: Unable To Login!" });
    }
});

router.post('/logout', checkJwtExpiration, async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    const expiryTime = decodedToken.exp;
    const inactiveToken = new JWT({ token: token, expiryTime: expiryTime });
    let tokenSaved = await inactiveToken.save();
    if (tokenSaved != {}) {
        return res.sendStatus(200);
    } 
    return res.sendStatus(401);

});



//Put route to change user password
module.exports = router;