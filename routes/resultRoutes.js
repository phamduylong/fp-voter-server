const express = require('express');
const resultRouter = express.Router();
const User = require('../models/User');
const { authorizedOrdinaryUser } = require('../utilities/utilities');
const logger = require('../utilities/logger');

resultRouter.get('/all', authorizedOrdinaryUser, async (req, res) => {
    try {
        logger.info("Retrieving the votes voted by the user");
        const result = await User.aggregate([
            {
                $group: {
                    _id: {
                        $cond: {
                            if: {
                                $and: [
                                    { $gte: ['$candidateVotedId', 0] }, // Check if candidateVotedId is greater than or equal to 0
                                    { $ne: ['$candidateVotedId', null] }, // Check if candidateVotedId is not null
                                ],
                            },
                            then: '$candidateVotedId', // Use candidateVotedId as _id
                            else: 'noVotes', // Use 'noVotes' as _id if conditions are not met
                        },
                    },
                    count: { $sum: 1 }, //Increment 1 for every Id
                },
            },
            {
                $lookup: {
                    from: 'candidates',
                    localField: '_id',
                    foreignField: 'id',
                    as: 'candidateInfo',
                },
            },
            {
                $project: {
                    id: { $arrayElemAt: ['$candidateInfo.id', 0] }, //Extracting the first element of the id field
                    name: {$arrayElemAt: ['$candidateInfo.name', 0]},//Extracting the first element of the name field
                    count: { $ifNull: ['$count', 0] },  //Excluded when candidateVoted = null
                },
            },
            {
                $match: { id: { $exists: true } }, // Exclude candidates that don't exist in the candidate model
            },
            {
                $sort: { id: 1 }, // Sort by id in ascending order
            },
        ]);

        if (result.length > 0) {
            const votes = result.reduce((total, entry) => total + entry.count, 0);
            const results = result.map(entry => ({
                id: entry.id,
                name: entry.name,
                votesReceived: entry.count,
            }));

            const response = {
                votes,
                results,
            };
            logger.info("Voting result successfully obtained");
            return res.status(200).json(response);
        }
        logger.info("No user has voted yet");
        res.status(204).json({ votes: 0, results: [] });
    } catch (error) {
        logger.error("An error occurred while getting the votes, details:", error);
        res.status(500).json({ error: error });
    }
});

resultRouter.get('/candidateId=:id', authorizedOrdinaryUser, async (req, res) => {
    const candidateId = req.params.id;
    logger.info('Requested result for candidate with ID:', candidateId);

    if (!candidateId || isNaN(candidateId) || candidateId < 0) {
        logger.error(`Candidate id ${candidateId} is invalid!`);
        return res.status(400).send({ error: "Invalid candidate ID. Please provide a valid candidate ID." });
    }

    try {
        const result = await User.aggregate([
            {
                $match: {
                    candidateVotedId: parseInt(candidateId),
                },
            },
            {
                $lookup: {
                    from: 'candidates',
                    localField: 'candidateVotedId',
                    foreignField: 'id',
                    as: 'candidateInfo',
                },
            },
        ]);

        if (result.length > 0) {
            const votedUser = result[0];
            if (votedUser.candidateInfo.length > 0) {
                const candidateInfo = votedUser.candidateInfo[0];
                const response = {
                    id: candidateInfo.id,
                    name: candidateInfo.name,
                    votesReceived: result.length,
                };
                logger.info(`Result found for candidate. ID: ${candidateInfo.id}, name: ${candidateInfo.name}, votesReceived: ${result.length}`);
                return res.status(200).json(response);
            }
        }
        logger.info("No results found for the specified candidate");
        res.status(204).json({ message: 'No results found for the specified candidate' });
    } catch (error) {
        logger.error("An error occurred while getting the votes for the specific candidate, details:", error);
        res.status(500).json({ error: error });
    }
});
module.exports = resultRouter;
