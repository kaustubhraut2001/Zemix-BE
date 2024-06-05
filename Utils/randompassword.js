const { randomBytes } = require('crypto');

const generateRandomPassword = () => {
    const length = 8;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    // Check if the charset is empty
    if (charset.length === 0) {
        throw new Error('Charset must not be empty');
    }

    let password = '';

    // Generate random bytes using crypto-secure randomness
    const randomBytesBuffer = randomBytes(length);

    // Iterate over each byte and map it to the charset
    for (let i = 0; i < length; ++i) {
        const byteValue = randomBytesBuffer[i] % charset.length;
        password += charset[byteValue];
    }

    return password;
};

module.exports = generateRandomPassword;