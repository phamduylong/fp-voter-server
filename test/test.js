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
        return createTestUser().then(() => {console.log("Test user was created!")}).catch(err => console.log(err));
    });

    after(async function () {
        return deleteTestUser().then(() => {console.log("Test user was deleted!");}).catch(err => console.log(err));
    });

    it(`1. Login with valid credentials`, function (done) {
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

    it(`2. Login with whitespace character exist in username`, function (done) {
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

    it('3. Login with number starts first in username', function (done) {
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

    it('4. Login with username too short', function (done) {
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

    it('5. Login with username too long', function (done) {
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

    it('6. Login with password too short', function (done) {
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

    it('7. Login with password too long', function (done) {
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

    it('8. Login with number in password missing', function (done) {
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

    it('9. Login with special character in password missing', function (done) {
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

    it('10. Login with capital letter in password missing', function (done) {
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

    it('11. Login with incorrect username', function (done) {
        const user = {
            username: "testuser9000",
            password: "27190670Kendrick#"
        };

        chai.request(app)
            .post('/login')
            .send(user)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(404);
                expect(res.body).to.deep.equal({ error: "Your username was not found. Please register through the link below." });
                done();
            });
    });

    it('12. Login with incorrect password', function (done) {
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

    it('13.Register with valid credentials', function (done) {
        const user = {
            username: "backendUnitTest",
            password: "unitTest#0001",
            fingerprintId: 123,
            sensorId: 10
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

    it('14. Register with whitespace character exist in username', function (done) {
        const user = {
            username: "random User",
            password: "unitTest#0001",
            fingerprintId: 123,
            sensorId: 10
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

    it('15. Register with number starts first in username', function (done) {
        const user = {
            username: "3randomUser",
            password: "unitTest#0001",
            fingerprintId: 123,
            sensorId: 10
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

    it('16. Register with username too short', function (done) {
        const user = {
            username: "ran",
            password: "unitTest#0001",
            fingerprintId: 123,
            sensorId: 10
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

    it('17. Register with username too long', function (done) {
        const user = {
            username: "randomUsernameabc123def456",
            password: "unitTest#0001",
            fingerprintId: 123,
            sensorId: 10
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

    it('18. Register with password length too short', function (done) {
        const randomUsername = "a" + Math.random().toString(36).slice(2, 10);
        const user = {
            username: randomUsername,
            password: "Abc123#",
            fingerprintId: 123,
            sensorId: 10
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

    it('19. Register with password length too long', function (done) {
        const randomUsername = "a" + Math.random().toString(36).slice(2, 10);
        const user = {
            username: randomUsername,
            password: "randomUsernameabc#123def456",
            fingerprintId: 123,
            sensorId: 10
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

    it('20 .Register with number in password missing', function (done) {
        const randomUsername = "a" + Math.random().toString(36).slice(2, 10);
        const user = {
            username: randomUsername,
            password: "Abc###abc",
            fingerprintId: 123,
            sensorId: 10
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

    it('21. Register with special character in password missing', function (done) {
        const randomUsername = "a" + Math.random().toString(36).slice(2, 10);
        const user = {
            username: randomUsername,
            password: "Abcabc123",
            fingerprintId: 123,
            sensorId: 10
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

    it('22. Register with capital letter in password missing', function (done) {
        const randomUsername = "a" + Math.random().toString(36).slice(2, 10);
        const user = {
            username: randomUsername,
            password: "abcabc123##",
            fingerprintId: 123,
            sensorId: 10
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

    it('23. Register with duplicate username', function (done) {
        const user = {
            username: "backendUnitTest",
            password: "unitTest#0001",
            fingerprintId: 123,
            sensorId: 10
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
    let testUserid = 0;
    before(async function () {
        return createTestUser()
            .then((user) => {
                testUserid = user.id;
                console.log("Test user created for testing!");
            })
            .catch(err => console.log(err));
    });

    after(async function () {
        return deleteTestUser().then(() => console.log("Admin user created for testing!")).catch(err => console.log(err));
    });

    const token = jwt.sign({ username: "backendUnitTest", userId: testUserid, isAdmin: false }, process.env.JWT_SECRET, { expiresIn: '30s' });
    const invalidToken = jwt.sign({ username: "backendUnitTest", userId: testUserid, isAdmin: false }, process.env.JWT_SECRET, { expiresIn: '0s' });

    it('28. Get candidate id which was voted by a user with JWT missing', function (done) {
        chai.request(app)
            .get('/user/candidateVoted')
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(401);
                done();
            });
    });

    it('28. Get candidate id which was voted by a user with invalid JWT', function (done) {
        chai.request(app)
            .get('/user/candidateVoted/')
            .set("Authorization", `Bearer ${invalidToken}`)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(401);
                done();
            });
    });


    it('29. Get candidate id which was voted by a user', function (done) {
        chai.request(app)
            .get('/user/candidateVoted')
            .set("Authorization", `Bearer ${token}`)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                done();
            });
    });

});


describe('Testing /result endpoint', function () {
    before(async function () {
        return createTestUser().then(() => console.log("Test user created for testing!")).catch(err => console.log(err));
    });

    after(async function () {
        return deleteTestUser().then(() => console.log("Test user cleaned up!")).catch(err => console.log(err));
    });


    it('32. Get all voting results', function (done) {
        chai.request(app)
            .get('/result/all')
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                done();
            });
    });
    it('33. Get voting results for a specific candidate', function (done) {
        chai.request(app)
            .get('/result/candidateId=1')
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                done();
            });
    });
    it('34. Get voting results for a specific candidate with invalid ID', function (done) {
        chai.request(app)
            .get('/result/candidateId=null')
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(404);
                expect(res.body).to.deep.equal({ error: "Invalid candidate ID. Please provide a valid candidate ID." });
                done();
            });
    });
    it('35. Get voting results for a specific candidate with ID does not exist', function (done) {
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
    let adminToken;
    before(async function () {
        return createTestAdmin()
            .then((user) => {
                adminToken = jwt.sign({ username: "backendUnitTestAdmin", userId: user.id, isAdmin: true }, process.env.JWT_SECRET, { expiresIn: '5m' });
                console.log("Test user created for testing!");
            })
            .catch(err => console.log(err));
    });

    after(async function () {
        return deleteTestAdmin().then(() => console.log("Admin dummy was deleted!")).catch(err => console.log(err));
    });

    let testCandidateId = 0;
    let testDuplicatedCandidateId = 0;
    //const token = jwt.sign({ username: "backendUnitTest", userId: createdAdminId, isAdmin: false }, process.env.JWT_SECRET, { expiresIn: '30s' });

    it('36. Get all candidate information', function (done) {
        chai.request(app)
            .get('/candidate/all')
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                done();
            });
    });

    it('37. Get a candidate information', function (done) {
        chai.request(app)
            .get('/candidate/id=1')
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                done();
            });
    });
    it('38. Get a candidate information with invalid id', function (done) {
        chai.request(app)
            .get('/candidate/id=null')
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res.body).to.deep.equal({ error: "Candidate information cannot be found. Please try again!" });
                done();
            });
    });
    it('39. Get a candidate information with ID does not exist', function (done) {
        chai.request(app)
            .get('/candidate/id=58373')
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(404);
                expect(res.body).to.deep.equal({ error: "User Not Found!" });
                done();
            });
    });
    it('40. Create a candidate', function (done) {

        chai.request(app)
            .post('/candidate/create')
            .set("Authorization", `Bearer ${adminToken}`)
            .field('name','testCandidate')
            .field('message','This candidate is created by running unit test.')
            .attach('file','test/test_candidate_image.png')
            .end(function (err, res) {
                testCandidateId = res.body.createdCandidate.id;
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                done();
            });

    });
    it('41. Create a duplicated candidate', function (done) {

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
    it('42. Create a candidate with image missing', function (done) {

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

    it('43. Modify a candidate', function (done) {

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

    it('44. Modify a candidate with invalid id', function (done) {

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

    it('45. Modify a candidate with id does not exist', function (done) {

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

    it('46. Delete a candidate', function (done) {

        chai.request(app)
            .delete(`/candidate/delete/id=${testCandidateId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                done();
            });

    });

    it('47. Delete a duplicated candidate', function (done) {
        chai.request(app)
            .delete(`/candidate/delete/id=${testDuplicatedCandidateId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                done();
            });
    });

    it('48. Delete a candidate with invalid id', function (done) {
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

    it('49. Delete a candidate with id does not exist', function (done) {
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
