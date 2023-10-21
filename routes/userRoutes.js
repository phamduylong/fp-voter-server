const express = require("express");
const userRouter = express.Router();
const User = require('../models/User');
const { checkJwtExpiration } = require('../utilities/utilities');
const logger = require('../utilities/logger');
userRouter.get('/id=:id', checkJwtExpiration, async (req, res) => {
    const userId = req.params.id;
    if(userId === undefined || userId === null || userId < 0) {
        logger.error(`User id ${userId} is invalid!`);
        return res.status(400).send({ error: "User id is invalid!" });
    }
    try {
        logger.debug("Getting user by id: ", userId);
        const user = await User.find({ id: Number(userId) });
        if (user.length === 1) {
            const result = {
                username: user[0].username,
                isAdmin: user[0].isAdmin,
                id: user[0].id,
                fingerprintId: user[0].fingerprintId,
                sensorId: user[0].sensorId,
                candidateVotedId: user[0].candidateVotedId
            };
            logger.info("User found successfully! Details: ", result);
            return res.status(200).send( result );
        }
        logger.error("Couldn't find user with id: ", userId);
        return res.status(400).send({ error: "User Not Found!" });
    } catch (error) {
        logger.error("Failed to get user information. Error: ", error);
        return res.status(500).send({ error: error });
    }
});

module.exports = userRouter;