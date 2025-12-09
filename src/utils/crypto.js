const crypto = require('crypto');

// Use a strong, unique key for your application (Store this in .env for production)
// This default is for development only.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'; // Must be 32 chars
const IV_LENGTH = 16; // For AES, this is always 16

const cryptoUtils = {
    // 1. One-way Hash (For searching/checking duplicates)
    hashData: (text) => {
        return crypto.createHash('sha256').update(text).digest('hex');
    },

    // 2. Encrypt (For secure storage)
    encrypt: (text) => {
        if (!text) return null;
        // Generate a random initialization vector
        const iv = crypto.randomBytes(IV_LENGTH);
        // Create key buffer (ensure it's 32 bytes)
        const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
        
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        
        // Return IV + Encrypted Data (IV is needed for decryption)
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    },

    // 3. Decrypt (For authorized viewing)
    decrypt: (text) => {
        if (!text) return null;
        try {
            const textParts = text.split(':');
            const iv = Buffer.from(textParts.shift(), 'hex');
            const encryptedText = Buffer.from(textParts.join(':'), 'hex');
            const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
            
            const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
            let decrypted = decipher.update(encryptedText);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            return decrypted.toString();
        } catch (error) {
            console.error("Decryption failed:", error);
            return null;
        }
    },

    // 4. Mask (For dashboard display)
    maskAadhar: (aadhar) => {
        if (!aadhar || aadhar.length < 4) return 'XXXXXXXX';
        return 'XXXXXXXX' + aadhar.slice(-4);
    }
};

module.exports = cryptoUtils;