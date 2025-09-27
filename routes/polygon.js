const express = require('express');
const { query, body, validationResult } = require('express-validator');
const polygonFlatFileService = require('../services/polygonFlatFileService');

const router = express.Router();

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return next();
}

router.get(
  '/flatfiles/list',
  [
    query('prefix').optional().isString().trim(),
    query('limit').optional().isInt({ min: 1, max: 1000 }).toInt(),
    query('token').optional().isString().trim(),
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { prefix = '', limit, token } = req.query;
      const result = await polygonFlatFileService.listFlatFiles({
        prefix,
        maxKeys: limit,
        continuationToken: token,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/flatfiles/download-url',
  [query('objectKey').exists().withMessage('objectKey is required').isString()],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { objectKey, expiresIn } = req.query;
      const result = await polygonFlatFileService.getFlatFileDownloadUrl({
        objectKey,
        expiresIn: expiresIn ? Number(expiresIn) : undefined,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/flatfiles/sample',
  [
    query('objectKey').exists().withMessage('objectKey is required').isString(),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { objectKey, limit = 10 } = req.query;
      const sample = await polygonFlatFileService.previewFlatFile({
        objectKey,
        maxLines: Number(limit) || 10,
      });
      res.json(sample);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/flatfiles/import',
  [body('objectKey').exists().withMessage('objectKey is required').isString()],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { objectKey } = req.body;
      const result = await polygonFlatFileService.importFlatFile({ objectKey });
      res.json({
        message: 'Flat file downloaded successfully',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;