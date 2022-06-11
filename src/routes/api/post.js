const { Fragment } = require('../../model/fragment');
const { createSuccessResponse } = require('../../response');

module.exports = async (req, res) => {
  if (!Fragment.isSupportedType(req.headers['content-type'])) {
    throw new Error('Invalid type');
  }

  const fragment = new Fragment({
    ownerId: req.user,
    type: req.headers['content-type'],
    size: Buffer.byteLength(req.headers['content-type']),
  });

  fragment.save();
  fragment.setData(req.body);

  const location = `${process.env.API_URL}/v1/fragments/${fragment.id}`;
  res.location(location);

  res.status(201).json(createSuccessResponse({ fragment }));
};
