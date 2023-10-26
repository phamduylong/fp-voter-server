const express = require("express");
const router = express.Router();
const User = require('../models/User');
const JWT = require('../models/JWT');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const {checkJwtExpiration, checkUserValidations} = require('../utilities/utilities');
const bcrypt = require("bcrypt");
const { S3Client, PutObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const multer = require('multer');


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
const JWT_KEY = process.env.JWT_SECRET;

router.post('/register', async (req, res) => {
    const username = req.body.username;
    let password = req.body.password;
    if(!checkUserValidations(username, password)){
        return res.status(400).send({ error: "Username or password entered does not match pattern required!" });
    }

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
        return res.status(400).send({ error: "User already exists!" });

    } catch (error) {
        return res.status(500).send({ error: "Unable To Create User!" });
    }
})

router.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if(!checkUserValidations(username, password)){
        return res.status(400).send({ error: "Username or password entered does not match pattern required!" });
    }
    try {
        const user = await User.find({ username: username })
        if (user.length === 1) {
            const match = await bcrypt.compare(password, user[0].password);
            if (match) {
                const token = jwt.sign({ user: username }, JWT_KEY, { expiresIn: '1hr' });
                return res.status(200).send({ token: token, userId: user[0].id });
            } 
                return res.status(401).send({ error: "Incorrect Password!" });
        }
        else if (user.length > 1) {
            return res.status(500).send({ error: "Username duplicated!" });
        } else if (user.length === 0) {
            return res.status(400).send({ error: "User Not Found!" });
        }
    } catch (error) {
        return res.status(500).send({ error: "Unable To Login!" });
    }
});

router.post('/logout', checkJwtExpiration, async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    const expiryTime = (decodedToken.exp * 1000);
    const inactiveToken = new JWT({ token: token, expiryTime: expiryTime });
    let tokenSaved = await inactiveToken.save();
    if (tokenSaved != {}) {
        return res.sendStatus(200);
    } 
    return res.sendStatus(401);

});

router.post('/candidate/image', checkJwtExpiration ,upload.single('file'),async (req, res) => {
    const image = req.file;
    const name = req.body.user;

    if(image === null){
        return res.status(400).send({error: 'No image provided'});
    }

    const params = {
        Bucket: BUCKET_NAME,
        Key: name,
        Body: image.buffer,
        ContentType: 'image/jpeg',
        ACL: 'public-read'
    };


    try {
        const command = new PutObjectCommand(params);
        await s3.send(command);
        return res.status(200).send({message: 'Photo uploaded successfully'});
    } catch (error) {
        return res.status(400).send({error: 'Unable to upload photo'});

    }

});

router.get('/candidate/image=:name', checkJwtExpiration ,async (req, res) => {

    const params = {
        Bucket: BUCKET_NAME,
    };

    const name = req.params.name;
    s3.send(new ListObjectsV2Command(params))
        .then((data) => {
            const foundObject = data.Contents.find((object) => object.Key === name);
            if (foundObject) {
                const imageUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${name}`;
                return res.status(200).send({image: imageUrl});
            }
            return res.status(404).send({error: 'Image not found'});
        })
        .catch(() => {
            res.status(500).send({error: 'Unable to find photo'});
        });

});

//Put route to change user password
module.exports = router;