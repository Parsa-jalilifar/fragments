// src/routes/api/get.js

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
      res.status(500).json(createErrorResponse(500, error.message));
    }
  },

  // Get a fragment data by using its id
  fragmentDataById: async (req, res) => {
    try {
      const fragment = await Fragment.byId(req.user, req.params.id);
      const fragmentData = await fragment.getData();
      logger.debug({ fragment }, 'GET /fragments/:id');
      res.status(200).send(fragmentData.toString());
    } catch (error) {
      res.status(500).json(createErrorResponse(500, error.message));
    }
  },

  // Get a fragment metadata by using its id
  fragmentMetaDataById: async (req, res) => {
    try {
      const fragment = await Fragment.byId(req.user, req.params.id);
      logger.debug({ fragment }, 'GET /fragments/:id/info');
      res.status(200).json(createSuccessResponse(fragment));
    } catch (error) {
      res.status(500).json(createErrorResponse(500, error.message));
    }
  },
};
