const app = require("../app");
const chai = require("chai");
const jwt = require("jsonwebtoken");
const {createTestUser,createTestAdmin,deleteTestUser,deleteTestAdmin} = require("./testUtilities");
const chaiHttp = require("chai-http");
require('dotenv').config({ path: '../.env' });

const expect = chai.expect;

chai.use(chaiHttp);

describe('Testing /login endpoint', function () {
    before(async function () {
        await createTestUser();
    });

    after(async function () {
        await deleteTestUser();
    });

    it('Login with valid credentials', function (done) {
        const user = {
            username: "backendUnitTest",
            password: "unitTest#0001"
        };

        chai.request(app)
            .post('/login')
            .send(user)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                done();
            });
    });

    it('Login with whitespace character exist in username', function (done) {
        const user = {
            username: "random User",
            password: "unitTest#0001"
        };

        chai.request(app)
            .post('/login')
            .send(user)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res.body).to.deep.equal({ error: "Username or password entered does not match pattern required!" });
                done();
            });
    });

    it('Login with number starts first in username', function (done) {
        const user = {
            username: "3randomUser",
            password: "unitTest#0001"
        };

        chai.request(app)
            .post('/login')
            .send(user)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res.body).to.deep.equal({ error: "Username or password entered does not match pattern required!" });
                done();
            });
    });

    it('Login with username too short', function (done) {
        const user = {
            username: "ran",
            password: "unitTest#0001"
        };

        chai.request(app)
            .post('/login')
            .send(user)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res.body).to.deep.equal({ error: "Username or password entered does not match pattern required!" });
                done();
            });
    });

    it('Login with username too long', function (done) {
        const user = {
            username: "randomUsernameabc123def456",
            password: "unitTest#0001"
        };

        chai.request(app)
            .post('/login')
            .send(user)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res.body).to.deep.equal({ error: "Username or password entered does not match pattern required!" });
                done();
            });
    });

    it('Login with password too short', function (done) {
        const randomUsername = "a" + Math.random().toString(36).slice(2, 10);
        const user = {
            username: randomUsername,
            password: "Abc123#"
        };

        chai.request(app)
            .post('/login')
            .send(user)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res.body).to.deep.equal({ error: "Username or password entered does not match pattern required!" });
                done();
            });
    });

    it('Login with password too long', function (done) {
        const randomUsername = "a" + Math.random().toString(36).slice(2, 10);
        const user = {
            username: randomUsername,
            password: "randomUsernameabc#123def456"
        };

        chai.request(app)
            .post('/login')
            .send(user)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res.body).to.deep.equal({ error: "Username or password entered does not match pattern required!" });
                done();
            });
    });

    it('Login with number in password missing', function (done) {
        const randomUsername = "a" + Math.random().toString(36).slice(2, 10);
        const user = {
            username: randomUsername,
            password: "Abc###abc"
        };

        chai.request(app)
            .post('/login')
            .send(user)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res.body).to.deep.equal({ error: "Username or password entered does not match pattern required!" });
                done();
            });
    });

    it('Login with special character in password missing', function (done) {
        const randomUsername = "a" + Math.random().toString(36).slice(2, 10);
        const user = {
            username: randomUsername,
            password: "Abcabc123"
        };

        chai.request(app)
            .post('/login')
            .send(user)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res.body).to.deep.equal({ error: "Username or password entered does not match pattern required!" });
                done();
            });
    });

    it('Login with capital letter in password missing', function (done) {
        const randomUsername = "a" + Math.random().toString(36).slice(2, 10);
        const user = {
            username: randomUsername,
            password: "abcabc123##"
        };

        chai.request(app)
            .post('/login')
            .send(user)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res.body).to.deep.equal({ error: "Username or password entered does not match pattern required!" });
                done();
            });
    });

    it('Login with incorrect username', function (done) {
        const user = {
            username: "testuser9000",
            password: "27190670Kendrick#"
        };

        chai.request(app)
            .post('/login')
            .send(user)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res.body).to.deep.equal({ error: "Your username was not found. Please register through the link below." });
                done();
            });
    });

    it('Login with incorrect password', function (done) {
        const user = {
            username: "testuser8000",
            password: "fsfasasdF#4"
        };

        chai.request(app)
            .post('/login')
            .send(user)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(401);
                expect(res.body).to.deep.equal({ error: "Incorrect Password!" });
                done();
            });
    });
});

describe('Testing /register endpoint', function () {
    after(async function () {
        await deleteTestUser();
    });

    it('Register with valid credentials', function (done) {
        const user = {
            username: "backendUnitTest",
            password: "unitTest#0001"
        };

        chai.request(app)
            .post('/register')
            .send(user)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                done();
            });
    });

    it('Register with whitespace character exist in username', function (done) {
        const user = {
            username: "random User",
            password: "unitTest#0001"
        };

        chai.request(app)
            .post('/register')
            .send(user)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res.body).to.deep.equal({ error: "Username or password entered does not match pattern required!" });
                done();
            });
    });

    it('Register with number starts first in username', function (done) {
        const user = {
            username: "3randomUser",
            password: "unitTest#0001"
        };

        chai.request(app)
            .post('/register')
            .send(user)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res.body).to.deep.equal({ error: "Username or password entered does not match pattern required!" });
                done();
            });
    });

    it('Register with username too short', function (done) {
        const user = {
            username: "ran",
            password: "unitTest#0001"
        };

        chai.request(app)
            .post('/register')
            .send(user)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res.body).to.deep.equal({ error: "Username or password entered does not match pattern required!" });
                done();
            });
    });

    it('Register with username too long', function (done) {
        const user = {
            username: "randomUsernameabc123def456",
            password: "unitTest#0001"
        };

        chai.request(app)
            .post('/register')
            .send(user)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res.body).to.deep.equal({ error: "Username or password entered does not match pattern required!" });
                done();
            });
    });

    it('Register with password length too short', function (done) {
        const randomUsername = "a" + Math.random().toString(36).slice(2, 10);
        const user = {
            username: randomUsername,
            password: "Abc123#"
        };

        chai.request(app)
            .post('/register')
            .send(user)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res.body).to.deep.equal({ error: "Username or password entered does not match pattern required!" });
                done();
            });
    });

    it('Register with password length too long', function (done) {
        const randomUsername = "a" + Math.random().toString(36).slice(2, 10);
        const user = {
            username: randomUsername,
            password: "randomUsernameabc#123def456"
        };

        chai.request(app)
            .post('/register')
            .send(user)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res.body).to.deep.equal({ error: "Username or password entered does not match pattern required!" });
                done();
            });
    });

    it('Register with number in password missing', function (done) {
        const randomUsername = "a" + Math.random().toString(36).slice(2, 10);
        const user = {
            username: randomUsername,
            password: "Abc###abc"
        };

        chai.request(app)
            .post('/register')
            .send(user)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res.body).to.deep.equal({ error: "Username or password entered does not match pattern required!" });
                done();
            });
    });

    it('Register with special character in password missing', function (done) {
        const randomUsername = "a" + Math.random().toString(36).slice(2, 10);
        const user = {
            username: randomUsername,
            password: "Abcabc123"
        };

        chai.request(app)
            .post('/register')
            .send(user)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res.body).to.deep.equal({ error: "Username or password entered does not match pattern required!" });
                done();
            });
    });

    it('Register with capital letter in password missing', function (done) {
        const randomUsername = "a" + Math.random().toString(36).slice(2, 10);
        const user = {
            username: randomUsername,
            password: "abcabc123##"
        };

        chai.request(app)
            .post('/register')
            .send(user)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res.body).to.deep.equal({ error: "Username or password entered does not match pattern required!" });
                done();
            });
    });

    it('Register with duplicate username', function (done) {
        const user = {
            username: "backendUnitTest",
            password: "unitTest#0001"
        };

        chai.request(app)
            .post('/register')
            .send(user)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res.body).to.deep.equal({ error: "Username has already been taken!" });
                done();
            });
    });
});

describe('Testing /user endpoint', function () {
    before(async function () {
        await createTestUser();
    });

    after(async function () {
        await deleteTestUser();
    });

    const token = jwt.sign({ user: "backendUnitTest" }, process.env.JWT_SECRET, { expiresIn: '5s' });
    const invalidToken = jwt.sign({ user: "backendUnitTest" }, process.env.JWT_SECRET, { expiresIn: '0s' });

    it('Get user details with valid credentials', function (done) {
        chai.request(app)
            .get('/user/id=1')
            .set("Authorization", `Bearer ${token}`)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                done();
            });
    });

    it('Get user details with JWT missing', function (done) {
        chai.request(app)
            .get('/user/id=1')
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(401);
                expect(res.body).to.deep.equal({ error: "You are not logged in." });
                done();
            });
    });

    it('Get user details with invalid JWT', function (done) {
        chai.request(app)
            .get('/user/id=1')
            .set("Authorization", `Bearer ${invalidToken}`)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(401);
                expect(res.body).to.deep.equal({ error: "JWT malformed" });
                done();
            });
    });

    it('Get user details with negative userID', function (done) {
        chai.request(app)
            .get('/user/id=-1')
            .set("Authorization", `Bearer ${token}`)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res.body).to.deep.equal({ error: "User id is invalid!" });
                done();
            });
    });

    it('Get user details with userID missing from the db', function (done) {
        chai.request(app)
            .get('/user/id=1000')
            .set("Authorization", `Bearer ${token}`)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(404);
                expect(res.body).to.deep.equal({ error: "User Not Found!" });
                done();
            });
    });

    it('Get candidate id which was voted by a user', function (done) {
        chai.request(app)
            .get('/user/candidateVoted/id=22')
            .set("Authorization", `Bearer ${token}`)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                done();
            });
    });

    it('Get candidate id which was voted by a user with invalid id', function (done) {
        chai.request(app)
            .get('/user/candidateVoted/id=null')
            .set("Authorization", `Bearer ${token}`)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res.body).to.deep.equal({ error: "User id is invalid!" });
                done();
            });
    });

    it('Get candidate id which was voted by a user with id does not exist', function (done) {
        chai.request(app)
            .get('/user/candidateVoted/id=35533')
            .set("Authorization", `Bearer ${token}`)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(404);
                expect(res.body).to.deep.equal({ error: "User Not Found!"});
                done();
            });
    });

});


describe('Testing /result endpoint', function () {
    before(async function () {
        await createTestUser();
    });

    after(async function () {
        await deleteTestUser();
    });


    it('Get all voting results', function (done) {
        chai.request(app)
            .get('/result/all')
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                done();
            });
    });
    it('Get voting results for a specific candidate', function (done) {
        chai.request(app)
            .get('/result/candidateId=1')
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                done();
            });
    });
    it('Get voting results for a specific candidate with invalid ID', function (done) {
        chai.request(app)
            .get('/result/candidateId=null')
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(404);
                expect(res.body).to.deep.equal({ error: "Invalid candidate ID. Please provide a valid candidate ID." });
                done();
            });
    });
    it('Get voting results for a specific candidate with ID does not exist', function (done) {
        chai.request(app)
            .get('/result/candidateId=52335')
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(404);
                expect(res.body).to.deep.equal({ error: "Candidate with ID 52335 does not exist!" });
                done();
            });
    });

});

describe('Testing /candidate endpoint', function () {
    before(async function () {
        await createTestUser();
        await createTestAdmin();
    });

    after(async function () {
        await deleteTestUser();
        await deleteTestAdmin();
    });

    let testCandidateId = 0;
    let testDuplicatedCandidateId = 0;

    const token = jwt.sign({ user: "backendUnitTest" }, process.env.JWT_SECRET, { expiresIn: '5s' });
    const adminToken = jwt.sign({ user: "backendUnitTestAdmin" }, process.env.JWT_SECRET, { expiresIn: '5s' });

    it('Get all candidate information', function (done) {
        chai.request(app)
            .get('/candidate/all')
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                done();
            });
    });

    it('Get a candidate information', function (done) {
        chai.request(app)
            .get('/candidate/id=1')
            .set("Authorization", `Bearer ${token}`)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                done();
            });
    });
    it('Get a candidate information with invalid id', function (done) {
        chai.request(app)
            .get('/candidate/id=null')
            .set("Authorization", `Bearer ${token}`)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res.body).to.deep.equal({ error: "Candidate information cannot be found. Please try again!" });
                done();
            });
    });
    it('Get a candidate information with ID does not exist', function (done) {
        chai.request(app)
            .get('/candidate/id=58373')
            .set("Authorization", `Bearer ${token}`)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res.body).to.deep.equal({ error: "User Not Found!" });
                done();
            });
    });
    it('Create a candidate', function (done) {

        chai.request(app)
            .post('/candidate/create')
            .set("Authorization", `Bearer ${adminToken}`)
            .field('name','testCandidate')
            .field('message','This candidate is created by running unit test.')
            .attach('file','test/test_candidate_image.png')
            .end(function (err, res) {
                testCandidateId = res.body.createdCandidate.id
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                done();
            });

    });
    it('Create a duplicated candidate', function (done) {

        chai.request(app)
            .post('/candidate/create')
            .set("Authorization", `Bearer ${adminToken}`)
            .field('name','testCandidate')
            .field('message','This candidate is created by running unit test.')
            .attach('file','test/test_candidate_image.png')
            .end(function (err, res) {
                testDuplicatedCandidateId = res.body.createdCandidate.id
                expect(err).to.be.null;
                expect(res).to.have.status(409);
                done();
            });

    });
    it('Create a candidate with image missing', function (done) {

        chai.request(app)
            .post('/candidate/create')
            .set("Authorization", `Bearer ${adminToken}`)
            .field('name','testCandidate')
            .field('message','This candidate is created by running unit test.')
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res.body).to.deep.equal({ error: "Candidate are required to have an image, name and message. At least one of these are missing."  });
                done();
            });

    });

    it('Modify a candidate', function (done) {

        chai.request(app)
            .put(`/candidate/update/id=${testCandidateId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .field('name','testCandidate')
            .field('message','This candidate is created by running unit test, and modified.')
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                done();
            });

    });

    it('Modify a candidate with invalid id', function (done) {

        chai.request(app)
            .put("/candidate/update/id=null")
            .set("Authorization", `Bearer ${adminToken}`)
            .field('name','testCandidate')
            .field('message','This candidate is created by running unit test, and modified.')
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res.body).to.deep.equal({ error: "Request malformed. Either id parameter or request body is invalid! " });
                done();
            });

    });

    it('Modify a candidate with id does not exist', function (done) {

        chai.request(app)
            .put("/candidate/update/id=35433")
            .set("Authorization", `Bearer ${adminToken}`)
            .field('name','testCandidate')
            .field('message','This candidate is created by running unit test, and modified.')
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(404);
                expect(res.body).to.deep.equal({ error: `Candidate with id 35433 does not exist!` });
                done();
            });

    });

    it('Delete a candidate', function (done) {

        chai.request(app)
            .delete(`/candidate/delete/id=${testCandidateId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                done();
            });

    });

    it('Delete a duplicated candidate', function (done) {
        chai.request(app)
            .delete(`/candidate/delete/id=${testDuplicatedCandidateId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                done();
            });
    });

    it('Delete a candidate with invalid id', function (done) {
        chai.request(app)
            .delete("/candidate/delete/id=null")
            .set("Authorization", `Bearer ${adminToken}`)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res.body).to.deep.equal({ error: "Candidate information cannot be found. Id was invalid!" });
                done();
            });
    });

    it('Delete a candidate with id does not exist', function (done) {
        chai.request(app)
            .delete("/candidate/delete/id=46346")
            .set("Authorization", `Bearer ${adminToken}`)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(404);
                expect(res.body).to.deep.equal({ error: "Candidate not found!" });
                done();
            });
    });


});
