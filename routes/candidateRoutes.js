const express = require("express");
const candidateRouter = express.Router();
const multer = require('multer');
const dotenv = require('dotenv');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const Candidate = require('../models/Candidate');
const { authorizedOrdinaryUser, authorizedAdmin } = require('../utilities/utilities');
const logger = require('../utilities/logger');

const storage = multer.memoryStorage();
const upload = multer({ storage });
dotenv.config();

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY
    }
});
const BUCKET_NAME = process.env.BUCKET_NAME;

candidateRouter.get('/id=:id', authorizedOrdinaryUser, async (req, res) => {
    const candidateId = req.params.id;
    if (candidateId === undefined || candidateId === null || candidateId < 0) {
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
            return res.status(200).send(result);
        }
        logger.error("Couldn't find candidate with id: ", candidateId);
        return res.status(400).send({ error: "User Not Found!" });
    } catch (error) {
        logger.error("Failed to get candidate information. Error: ", error);
        return res.status(500).send({ error: error });
    }
});

candidateRouter.get('/all', async (req, res) => {
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

// Admin only functionalities
candidateRouter.post('/create', authorizedAdmin, upload.single('file'), async (req, res) => {
    try {
        logger.debug("Creating a new candidate");
        const image = req.file;
        const name = req.body.name;
        const message = req.body.message;
        if (image === null || image === undefined || !name || !message) {
            // Handle the case where one or more variables are missing
            logger.error(`One or more candidate fields are invalid`);
            return res.status(400).json({ error: "Candidate are required to have an image, name and message. At least one of these are missing." }); 
        }
        const duplicateCandidate = await Candidate.find({ name: name, message: message });
        const currentTimestamp = Math.floor(Date.now() / 1000); // Get the current timestamp in seconds
        const params = {
            Bucket: BUCKET_NAME,
            Key: `${name}_${currentTimestamp}`,
            Body: image.buffer,
            ContentType: 'image/jpeg',
            ACL: 'public-read'
        };
        const command = new PutObjectCommand(params);
        const imageSaved = await s3.send(command);
        if (!imageSaved) {
            logger.error("Unable to upload image to s3");
            return res.status(500).send({ error: 'Server was unable to upload image. Please try again.' });
        }
        logger.info("Image created successfully! Details:", imageSaved);
        const candidate = new Candidate({ name: name, message: message, img: `https://${BUCKET_NAME}.s3.amazonaws.com/${name}_${currentTimestamp}` });
        const candidateSaved = await candidate.save();
        if (candidateSaved) {
            if (duplicateCandidate.length === 0) {
                logger.info("Candidate created successfully! Details:", candidateSaved);
                return res.status(200).send({ message: "Candidate created successfully!", createdCandidate: candidateSaved });
            }
            logger.warn("Created duplicated candidate. Details:", candidateSaved);
            return res.status(409).send({ warning: "Found an identical candidate. Please make sure this is not a mistake.", createdCandidate: candidateSaved });
        }
        logger.error("Failed to save candidate to database.");
        res.status(500).send({ error: "Failed to save candidate to database. Please try again!" });
    } catch (error) {
        logger.error("Failed to create a new candidate. Error: ", error);
        return res.status(500).send({ error: error });
    }
});

candidateRouter.put('/update/id=:id', authorizedAdmin, upload.single('file'), async (req, res) => {
    logger.debug("Updating candidate with id:", req.params.id);
    if(!req.params.id || !req.body.name || !req.body.message) {
        logger.error(`Candidate update request malformed. ID: ${req.params.id}, Name: ${req.body.name}, Message: ${req.body.message}`);
        return res.status(400).send({ error: "Request malformed. Either id parameter or request body is invalid! " });
    }
    try {
        const candidateId = req.params.id;
        const newCandidateInfo = req.body;
        const image = req.file;
        const currentTimestamp = Math.floor(Date.now() / 1000);
        if (image) {
            const params = {
                Bucket: BUCKET_NAME,
                Key: `${image.originalname ?? "tmp"}_${currentTimestamp}`,
                Body: image.buffer,
                ContentType: 'image/jpeg',
                ACL: 'public-read'
            };
            const command = new PutObjectCommand(params);
            const imageSaved = await s3.send(command);
            if (!imageSaved) {
                logger.error("Unable to upload image to s3");
                return res.status(500).send({ error: 'Unable to upload image' });
            }
            newCandidateInfo.img = `https://${BUCKET_NAME}.s3.amazonaws.com/${image.originalname ?? "tmp"}_${currentTimestamp}`;
        }
        
        const result = await Candidate.findOneAndUpdate({ id: Number(candidateId) }, newCandidateInfo, { new: true });

        if (result) {
            logger.info("Candidate updated successfully! Details:", result);
            return res.status(200).send({ message: "Candidate updated successfully!", updatedCandidate: result });
        }

        logger.error("Failed to update candidate with id:", candidateId);
        return res.status(500).send({ error: "Failed to update candidate. Please try again!" });
    } catch (error) {
        logger.error("Failed to update candidate. Error: ", error);
        return res.status(500).send({ error: error });
    }
}); 

candidateRouter.delete('/delete/id=:id', authorizedAdmin, async (req, res) => {
    const candidateId = req.params.id;

    if (!candidateId || candidateId < 0 || Number.isNaN(candidateId)) {
        logger.error(`Candidate id ${candidateId} is invalid!`);
        return res.status(400).send({ error: "Candidate information cannot be found. Id was invalid!" });
    }

    const candidateToDelete = await Candidate.findOne({ id: Number(candidateId) });
    if (!candidateToDelete) {
        logger.error("Candidate not found with id:", candidateId);
        return res.status(404).send({ error: "Candidate not found!" });
    }
  
    //Getting the image url from db before deleting it
    const imgRegex = /[^/]+$/;
    const imgUrl = RegExp(imgRegex).exec(candidateToDelete.img);
    const params = {
        Bucket: BUCKET_NAME,
        Key: imgUrl[0],
    };
    const command = new DeleteObjectCommand(params);
    const imgDeleted = await s3.send(command);
    if (!imgDeleted) {
        logger.error("Unable to delete image from s3");
    } else {
        logger.info(`Successfully deleted image with key ${imgUrl} from s3.`);
    }

    const result = await Candidate.deleteOne({ id: Number(candidateId) });
    if (result.deletedCount === 1) {
        logger.info("Candidate deleted successfully! Id:", candidateId);
        return res.status(200).send({ message: "Candidate deleted successfully!" });
    }
    logger.error("Failed to delete candidate with id:", candidateId);
    return res.status(500).send({ error: "Failed to delete candidate. Please try again!" });
});

module.exports = candidateRouter;