// src/routes/api/get.js

const { createSuccessResponse } = require('../../response');
const { listFragments } = require('../../model/data/memory');

/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  const fragments = await listFragments(req.user);
  res.status(200).json(createSuccessResponse({ fragments }));
};
