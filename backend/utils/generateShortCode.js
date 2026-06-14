const { nanoid } = require('nanoid');
const Url = require('../models/Url');

/**
 * Generates a unique short code, checking against the database
 * to avoid collisions.
 */
const generateUniqueShortCode = async (length = 7) => {
  let shortCode;
  let exists = true;

  while (exists) {
    shortCode = nanoid(length);
    // eslint-disable-next-line no-await-in-loop
    exists = await Url.findOne({ shortCode });
  }

  return shortCode;
};

module.exports = generateUniqueShortCode;
