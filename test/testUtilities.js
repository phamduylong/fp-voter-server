const bcrypt = require("bcrypt");
const User = require("../models/User");



const createTestUser = async () =>{
    const username = "backendUnitTest";
    let password = "unitTest#0001";
    const salt = await bcrypt.genSalt();
    password = await bcrypt.hash(password, salt);
    const isUserExists = await User.find({username: username});
    if (isUserExists.length === 0){
        const newUser = new User({ username: username, password: password, isAdmin: false });
        newUser.save().then(() => console.log("User created for testing!")).catch(err => console.log(err));
    } else {
        console.error("Test user already existed before test cases are run!");
    }
}

const createTestAdmin = async () =>{
    const username = "backendUnitTestAdmin";
    let password = "unitTest#0001";
    const salt = await bcrypt.genSalt();
    password = await bcrypt.hash(password, salt);
    const isUserExists = await User.find({username: username});
    if (isUserExists.length === 0){
        const newUser = new User({ username: username, password: password, isAdmin: true });
        newUser.save().then(() => console.log("Admin user created for testing!")).catch(err => console.log(err));
    } else {
        console.error("Admin user already existed before test cases are run!");
    }
}



const deleteTestUser = async () =>{
   User.deleteMany({username: "backendUnitTest"}).then(() => console.log("Cleaned up dummy test users!")).catch(err => console.log(err));
}

const deleteTestAdmin = async () =>{
    await User.deleteMany({username: "backendUnitTestAdmin"}).then(() => console.log("Cleaned up dummy test admins!")).catch(err => console.log(err));

}



module.exports = {createTestUser,createTestAdmin,deleteTestUser,deleteTestAdmin}