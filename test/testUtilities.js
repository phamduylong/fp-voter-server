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
        return newUser.save();
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
        return newUser.save();
    } else {
        console.error("Admin user already existed before test cases are run!");
    }
}



const deleteTestUser = async () =>{
   return User.deleteMany({username: "backendUnitTest"});
}

const deleteTestAdmin = async () =>{
    return User.deleteMany({username: "backendUnitTestAdmin"});
}



module.exports = {createTestUser,createTestAdmin,deleteTestUser,deleteTestAdmin}