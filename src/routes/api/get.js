// src/routes/api/get.js

const { createSuccessResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

module.exports = {
  //  Get a list of fragments for the current user
  fragmentList: async (req, res, next) => {
    try {
      const fragments = await Fragment.byUser(req.user);
      res.status(200).json(createSuccessResponse({ fragments }));
    } catch (error) {
      next(error);
    }
  },

  // get a fragment by using its id
  fragmentById: async (req, res, next) => {
    try {
      const fragments = await Fragment.byId(req.user, req.params.id);
      res.status(200).json(createSuccessResponse(fragments));
    } catch (error) {
      next(error);
    }
  },
};
