const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');
const Fragment = require('../../model/fragment');

/**
 * Retrieve a fragment's meta-data from the database
 */
module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);
    logger.debug({ fragment }, 'GET /fragments/:id/info');
    res.status(200).json(createSuccessResponse(fragment));
  } catch (error) {
    res.status(404).json(createErrorResponse(404, error.message));
  }
};
