const express = require("express");
const candidateRouter = express.Router();
const Candidate = require('../models/Candidate');
const { authorizedOrdinaryUser, authorizedAdmin } = require('../utilities/utilities');
const logger = require('../utilities/logger');

candidateRouter.get('/id=:id', authorizedOrdinaryUser, async (req, res) => {
    const candidateId = req.params.id;
    if(candidateId === undefined || candidateId === null || candidateId < 0) {
        logger.error(`Candidate id ${candidateId} is invalid!`);
        return res.status(400).send({ error: "Candidate information cannot be found. Please try again!" });
    }
    try {
        logger.debug("Getting candidate by id:", candidateId);
        const candidate = await Candidate.find({ id: Number(candidateId) });
        if (candidate.length === 1) {
            const result = {
                id: candidate[0].id,
                name: candidate[0].name,
                age: candidate[0].age,
                message: candidate[0].message
            };
            logger.info("Candidate found successfully! Details:", result);
            return res.status(200).send( result );
        }
        logger.error("Couldn't find candidate with id: ", candidateId);
        return res.status(400).send({ error: "User Not Found!" });
    } catch (error) {
        logger.error("Failed to get candidate information. Error: ", error);
        return res.status(500).send({ error: error });
    }
});

candidateRouter.get('/all', authorizedOrdinaryUser, async (req, res) => {
    try {
        logger.debug("Getting all candidates");
        const candidates = await Candidate.find({}, "-_id name age message img id");
        logger.info("Candidates found successfully!");
        return res.status(200).send( candidates );
    } catch (error) {
        logger.error("Failed to get candidates information. Error: ", error);
        return res.status(500).send({ error: error });
    }
});

// TODO: Finish these routes below

candidateRouter.post('/create', authorizedAdmin, async (req, res) => {
    try {
        logger.debug("Creating a new candidate");
        const candidate = new Candidate(req.body);

    } catch (error) {
        logger.error("Failed to create a new candidate. Error: ", error);
        return res.status(500).send({ error: error });
    }
});

candidateRouter.put('/update/id:=id', authorizedAdmin, async (req, res) => {
    const candidateId = req.params.id;
});

candidateRouter.delete('/delete/id:=id', authorizedAdmin, async (req, res) => {
    const candidateId = req.params.id;
});
module.exports = candidateRouter;