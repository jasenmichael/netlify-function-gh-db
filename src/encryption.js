// encryption.js

const crypto = require('crypto');
require('dotenv').config({ path: '../.env' })
const key = process.env.ENCRYPTION_KEY;

function encryptString(text) {
    const iv = crypto.randomBytes(16); // Initialization vector
    const keyBuffer = crypto.scryptSync(key, 'salt', 32); // Derive a key of the correct length

    const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv);

    let encrypted = cipher.update(text, 'utf-8', 'hex');
    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
}

function decryptString(encryptedText) {
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const keyBuffer = crypto.scryptSync(key, 'salt', 32); // Derive a key of the correct length

    const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, iv);

    let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');

    return decrypted;
}

module.exports = {
    encryptString,
    decryptString,
};
