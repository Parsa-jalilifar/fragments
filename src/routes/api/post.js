// src/routes/api/post.js

const { createSuccessResponse, createErrorResponse } = require('../../response');
const Fragment = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    if (!Fragment.isSupportedType(req.headers['content-type'])) {
      return res.status(415).json(createErrorResponse(415, 'type is not supported!'));
    }

    const fragment = new Fragment({
      ownerId: req.user,
      type: req.headers['content-type'],
      size: Buffer.byteLength(req.body),
    });

    await fragment.save();
    await fragment.setData(req.body);

    logger.debug({ fragment }, 'POST /fragments');

    res.setHeader('Location', `${process.env.API_URL}/v1/fragments/${fragment.id}`);
    res.status(201).json(createSuccessResponse({ fragment }));
  } catch (error) {
    res.status(500).json(createErrorResponse(500, error.message));
  }
};
