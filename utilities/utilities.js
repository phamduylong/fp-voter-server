const JWT = require('../models/JWT');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const dotenv = require('dotenv');
const logger = require('./logger');
dotenv.config();
const JWT_KEY = process.env.JWT_SECRET;

const authorizedOrdinaryUser = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token !== "null" && token !== undefined) {
        try {
            const decodedToken = jwt.verify(token, JWT_KEY);
            const tokenIsInactive = await checkInactiveToken(token);
            const currentTokenExpired = decodedToken.exp * 1000 < Date.now();
            if (tokenIsInactive || currentTokenExpired) {
                return res.status(401).json({ error: 'Session has expired. Please log in again.' });
            }
            next();
        } catch (err) {
            logger.error("Failed to verify token. Error: ", err);
            // in theory, this should not happen for ordinary users
            return res.status(401).json({ error: 'JWT malformed' });
        }
    } else {
        //token was not provided, user not logged in.
        logger.error("JWT TOKEN IS MISSING");
        return res.status(401).json({ error: 'You are not logged in.' });
    }
};

/**
 * Decode the token and check user permission. 
 * Should only be used for admin pages, 
 * else it will ruin your life
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @summary This function is used to check if the user is an admin or not.
 */
const authorizedAdmin = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    logger.debug("Token: ", token);
    if (token !== "null" && token !== undefined) {
        try {
            const decodedToken = jwt.verify(token, JWT_KEY);
            const tokenIsInactive = await checkInactiveToken(token);
            const currentTokenExpired = decodedToken.exp * 1000 < Date.now();
            if (tokenIsInactive || currentTokenExpired) {
                return res.status(401).json({ error: 'Session has expired. Please log in again.' });
            }
            if(decodedToken.userId !== 0 && decodedToken.userId !== undefined && decodedToken.userId !== null) {
                User.find({ id: decodedToken.userId }).then((user) => {
                    if(!user[0].isAdmin) {
                        return res.status(403).json({ error: 'You are not authorized to access this page.' });
                    }
                }).catch((err) => {
                    logger.error("Failed to get user information. Error: ", err);
                    return res.status(500).send({ error: "Failed to authorize. Please log out and try again!" });
                });
            }
            next();
        } catch (err) {
            // in theory, this should not happen for ordinary users
            return res.status(401).json({ error: 'JWT malformed' });
        }
    } else {
        //token was not provided, user not logged in.
        logger.error("JWT TOKEN IS MISSING");
        return res.status(401).json({ error: 'You are not logged in.' });
    }
};

async function deleteExpiredTokens() {
    JWT.find({}).then((tokens) => {
        for(const token of tokens) {
            if(token.expiryTime < Date.now()) {
                JWT.deleteOne({_id: token._id}).catch((err) => {
                    logger.error("Failed to delete expired token: ", err);
                });
            }
        }
        logger.info("Expired tokens deleted");
    }).catch((err) => {
        logger.error("Failed to delete expired tokens: ", err);
    });
    
}
async function checkInactiveToken(token) {
    await deleteExpiredTokens();
    const inactiveToken = await JWT.find({ token: token });
    //Check if there's no inactive token
    if (inactiveToken.length === 0) {
        return false;
    }
    //Check if inactive token already expired
    return inactiveToken[0].expiryTime < Date.now()

}

function checkUserValidations(username, password){
    const usernameRegex = new RegExp(/^(?![\d_])(?!.*[^\w-]).{4,20}$/);
    const isUsernameMatch = usernameRegex.test(username);
    const passwordRegex = new RegExp(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&+=!*_])([A-Za-z\d@#$%^&+=!*_]){8,20}$/);
    const isPwdMatch = passwordRegex.test(password);
    return (isUsernameMatch && isPwdMatch)
}

module.exports = {authorizedOrdinaryUser, authorizedAdmin, checkUserValidations}
