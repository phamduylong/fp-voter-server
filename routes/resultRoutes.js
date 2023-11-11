const express = require('express');
const resultRouter = express.Router();
const User = require('../models/User');
const Candidate = require('../models/Candidate');
const logger = require('../utilities/logger');

resultRouter.get('/all', async (req, res) => {
    try {
        logger.info("Retrieving the votes voted by the user");

        // Get all users who have voted
        const votedUsers = await User.find({ candidateVotedId: { $gte: -1, $ne: null } });

        // Create a map to count votes for each candidate
        const candidateVoteCount = new Map();

        votedUsers.forEach(user => {
            const candidateId = user.candidateVotedId;
            if (candidateVoteCount.has(candidateId)) {
                candidateVoteCount.set(candidateId, candidateVoteCount.get(candidateId) + 1);
            } else {
                candidateVoteCount.set(candidateId, 1);
            }
        });

        // Get candidate information for the candidates with votes
        const allCandidates = await Candidate.find();

        let allVotes = 0;
        Array.from(candidateVoteCount.values()).forEach(n => {allVotes += n});

        // Process the results
        const votingResults = allCandidates.map(candidate => ({
            id: candidate.id,
            name: candidate.name,
            votesReceived: candidateVoteCount.get(candidate.id) || 0,
            votesPercentage: ((candidateVoteCount.get(candidate.id) || 0) / allVotes * 100).toFixed(2) + "%",
        }));

        // sort candidates by name
        votingResults.sort((firstCandidate, secondCandidate) => firstCandidate.name.localeCompare(secondCandidate.name));

        const response = {
            votes: allVotes,
            results: votingResults,
        };

        logger.info("Voting result successfully obtained");
        res.status(200).json(response);
    } catch (error) {
        logger.error("An error occurred while getting the votes, details:", error);
        res.status(500).json({ error: error });
    }
});

resultRouter.get('/candidateId=:id', async (req, res) => {
    const candidateId = req.params.id;
    logger.info('Requested result for candidate with ID:', candidateId);

    if (!candidateId || isNaN(candidateId) || candidateId < 0) {
        logger.error(`Invalid candidate ID: ${candidateId}`);
        return res.status(404).send({ error: "Invalid candidate ID. Please provide a valid candidate ID." });
    }
    const castedId = Number(candidateId);
    if(isNaN(castedId)){
        logger.error(`Candidate ID ${castedId} is not a number`);
        return res.status(400).send({error: "Candidate ID should be a number. Please provide a valid candidate ID."});
    }
    
    try {
        // Get all users who voted for the specified candidate
        const votedUsers = await User.find({ candidateVotedId: castedId });
        const candidateInfo = await Candidate.findOne({ id: candidateId });

        if (candidateInfo) {
            const response = {
                id: candidateInfo.id,
                name: candidateInfo.name,
                votesReceived: votedUsers.length,
            };
            logger.info(`Result found for candidate. ID: ${candidateInfo.id}, name: ${candidateInfo.name}, votesReceived: ${votedUsers.length}`);
            return res.status(200).json(response);
        }
        logger.info(`Candidate with ID ${candidateId} does not exist!`);
        res.status(404).json({ error: `Candidate with ID ${candidateId} does not exist!` });
    } catch (error) {
        logger.error("An error occurred while getting the votes for the specific candidate, details:", error);
        res.status(500).json({ error: error });
    }
});
module.exports = resultRouter;
