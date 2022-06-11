const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = (req, res) => {
  try {
    const fragment = new Fragment({ ownerId: req.user, type: req.headers['content-type'] });
    fragment.save();
    fragment.setData(req.body);

    res.status(201).json(createSuccessResponse({ fragment }));
  } catch (error) {
    const status = error.status || 500;

    if (status > 499) {
      logger.error(error.message, `Error processing request`);
    }
    res.status(status).json(createErrorResponse(status, error.message));
  }
};
