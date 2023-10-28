const express = require("express");
const router = express.Router();
const User = require('../models/User');
const JWT = require('../models/JWT');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const {authorizedOrdinaryUser, checkUserValidations} = require('../utilities/utilities');
const bcrypt = require("bcrypt");
const logger = require('../utilities/logger');


dotenv.config();

const JWT_KEY = process.env.JWT_SECRET;

router.post('/register', async (req, res) => {
    const username = req.body.username;
    let password = req.body.password;
    if(!checkUserValidations(username, password)){
        logger.error("Username or password entered does not match pattern required!");
        return res.status(400).send({ error: "Username or password entered does not match pattern required!" });
    }

    try {
        const user = await User.find({ username: username });
        if (user.length === 0) {
            const salt = await bcrypt.genSalt();
            password = await bcrypt.hash(password, salt);
            const newUser = new User({ username: username, password: password, isAdmin: false });
            let userSaved = await newUser.save();
            if (userSaved !== {}) {
                logger.info(`User registration successfully! Username: ${username}`);
                return res.status(200).send({ message: "Your account was created successfully!" });
            }
            logger.error("Unable To Create New User!");
            return res.status(500).send({ error: "We were unable to create your account. Please try again or contact an administrator." });
        }
        logger.error(`Username ${username} has already been taken!`);
        return res.status(400).send({ error: "Username has already been taken!" });

    } catch (error) {
        logger.error("Unable To Create New User! Error: ", error);
        return res.status(500).send({ error: "We were unable to create your account. Please try again or contact an administrator." });
    }
})

router.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if(!checkUserValidations(username, password)) {
        logger.error("Username or password entered does not match pattern required!");
        return res.status(400).send({ error: "Username or password entered does not match pattern required!" });
    }
    try {
        const user = await User.find({ username: username })
        if (user.length === 1) {
            const match = await bcrypt.compare(password, user[0].password);
            if (match) {
                const token = jwt.sign({userId: user[0].id, username: user[0].username}, JWT_KEY, {expiresIn: '1hr'});
                logger.info(`Logged in as ${username}!`);
                return res.status(200).send({ token: token });
            }
            logger.error("Incorrect Password!");
            return res.status(401).send({ error: "Incorrect Password!" });
        }
        else if (user.length > 1) {
            logger.fatal(`Username ${username} was duplicated in the database!`);
            return res.status(500).send({ error: "Your username was duplicated. Please contact an admin to fix this!" });
        } else if (user.length === 0) {
            logger.error(`Username ${username} was not found from database!`);
            return res.status(400).send({ error: "Your username was not found. Please register through the link below." });
        }
    } catch (error) {
        if(JWT_KEY === undefined || JWT_KEY === "") {
            logger.error("User log in failed. JWT_SECRET is missing from .env file!");
        } else logger.error("Unable To Login! Error: ", error);
        return res.status(500).send({ error: "We were unable to log you in. Please try again or contact an administrator." });
    }
});

router.post('/logout', authorizedOrdinaryUser, async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const expiryTime = (decodedToken.exp * 1000);
        const inactiveToken = new JWT({ token: token, expiryTime: expiryTime });
        let tokenSaved = await inactiveToken.save();
        if (tokenSaved !== {}) {
            logger.info("Logged out successfully!");
            return res.sendStatus(200);
        }
    } catch(err) {
        logger.error("An error occured while logging out! Error: ", err);
    }
    return res.sendStatus(401);

});

module.exports = router;