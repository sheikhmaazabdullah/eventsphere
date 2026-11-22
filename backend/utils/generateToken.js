const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT containing the user's _id.
 * @param {string} id  Mongoose _id of the user
 * @returns {string}   Signed JWT token (expires in 30 days)
 */
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

module.exports = generateToken;
