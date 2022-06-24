// src/routes/api/get.js

const path = require('path');

const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = {
  //  Get a list of fragments for the current user
  fragmentList: async (req, res) => {
    try {
      const fragments = await Fragment.byUser(req.user, req.query.expand === '1');
      logger.debug({ fragments }, 'GET /fragments');
      res.status(200).json(createSuccessResponse({ fragments }));
    } catch (error) {
      res.status(404).json(createErrorResponse(404, error.message));
    }
  },

  // Get a fragment data by using its id
  fragmentDataById: async (req, res) => {
    try {
      const ownerId = req.user;
      const id = path.parse(req.params.id).name;
      const ext = path.parse(req.params.id).ext.slice(1);

      const fragment = await Fragment.byId(ownerId, id);
      const fragmentData = await fragment.getData();

      if (!ext) {
        logger.debug({ fragment }, 'GET /fragments/:id');
        res.status(200).send(fragmentData.toString());
      } else {
        logger.debug({ id: id, ext: ext }, 'GET /fragments/:id.ext');

        if (!Fragment.isSupportedExt(ext)) {
          return res.status(415).json(createErrorResponse(415, 'Extension type is not supported.'));
        }

        const type = Fragment.extValidType(ext); // html -> text/html

        if (!fragment.formats.includes(type)) {
          return res.status(415).json(createErrorResponse(415, 'Conversion is not allowed.'));
        }

        const newFragmentData = fragment.convertData(fragmentData, type);
        logger.debug(
          { newFragmentData: newFragmentData, contentType: type },
          'New fragment data and content type'
        );
        res.setHeader('Content-type', type);
        res.status(200).send(newFragmentData);
      }
    } catch (error) {
      res.status(404).json(createErrorResponse(404, error.message));
    }
  },

  // Get a fragment metadata by using its id
  fragmentMetaDataById: async (req, res) => {
    try {
      const fragment = await Fragment.byId(req.user, req.params.id);
      logger.debug({ fragment }, 'GET /fragments/:id/info');
      res.status(200).json(createSuccessResponse(fragment));
    } catch (error) {
      res.status(404).json(createErrorResponse(404, error.message));
    }
  },
};
