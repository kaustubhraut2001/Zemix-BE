const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();


function generateuserToken(user) {
    const token = jwt.sign({ _id: user._id, email: user.email }, process.env.secrets, { expiresIn: '1h' });
    return token; //Return Token
}

module.exports = generateuserToken; //Export Function