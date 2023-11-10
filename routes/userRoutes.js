const express = require("express");
const userRouter = express.Router();
const User = require('../models/User');
const Candidate = require('../models/Candidate');
const { authorizedOrdinaryUser } = require('../utilities/utilities');
const logger = require('../utilities/logger');

userRouter.get('/id=:id', authorizedOrdinaryUser, async (req, res) => {
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
        return res.status(404).send({ error: "User Not Found!" });
    } catch (error) {
        logger.error("Failed to get user information. Error: ", error);
        return res.status(500).send({ error: error });
    }
});

userRouter.get("/candidateVoted/id=:id", authorizedOrdinaryUser, async (req, res) => {
    const userId = req.params.id;
    if(userId === undefined || userId === null || userId < 0) {
        logger.error(`User id ${userId} is invalid!`);
        return res.status(400).send({ error: "User id is invalid!" });
    }
    try {
        logger.debug("Getting user by id: ", userId);
        const user = await User.find({ id: Number(userId) });
        if (user.length === 1) {
            const candidateVotedId = user[0].candidateVotedId;
            if(candidateVotedId === undefined || candidateVotedId === null || candidateVotedId < 0) {
                logger.error(`Candidate voted id ${candidateVotedId} is invalid!`);
                return res.status(204).send({ });
            }
            const candidate = await Candidate.find({ id: Number(candidateVotedId) });
            if (candidate.length === 1) {
                const result = {
                    id: candidate[0].id,
                    name: candidate[0].name,
                    message: candidate[0].message,
                    img: candidate[0].img
                };
                logger.info("Candidate found successfully! Details:", result);
                return res.status(200).send(result);
            }
            return res.status(204).send({ });
        }
        logger.error("Couldn't find user with id: ", userId);
        return res.status(404).send({ error: "User Not Found!" });
    } catch (error) {
        logger.error("Failed to get user information. Error: ", error);
        return res.status(500).send({ error: error });
    }
});

module.exports = userRouter;