const express = require('express');
const QRCode = require('qrcode');
const multer = require('multer');
const csv = require('csv-parser');
const { Readable } = require('stream');
const { body, validationResult } = require('express-validator');
const Url = require('../models/Url');
const Click = require('../models/Click');
const { protect } = require('../middleware/authMiddleware');
const generateUniqueShortCode = require('../utils/generateShortCode');

const router = express.Router();

// Multer setup for in-memory CSV uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

// Simple URL validation regex (http/https required)
const isValidUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (err) {
    return false;
  }
};

// Helper to build full short URL
const buildShortUrl = (shortCode) => `${process.env.BASE_URL}/${shortCode}`;

// ─────────────────────────────────────────────────────────
// @route   POST /api/urls
// @desc    Create a new short URL
// @access  Private
// ─────────────────────────────────────────────────────────
router.post(
  '/',
  protect,
  [
    body('originalUrl')
      .trim()
      .notEmpty()
      .withMessage('Original URL is required')
      .custom((value) => isValidUrl(value))
      .withMessage('Please provide a valid URL starting with http:// or https://'),
    body('customAlias')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ min: 3, max: 20 })
      .withMessage('Custom alias must be 3-20 characters')
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Custom alias can only contain letters, numbers, hyphens, and underscores'),
    body('expiresAt').optional({ checkFalsy: true }).isISO8601().withMessage('Invalid expiry date'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
      }

      const { originalUrl, customAlias, expiresAt } = req.body;

      let shortCode;
      let isCustom = false;

      if (customAlias) {
        const existing = await Url.findOne({ shortCode: customAlias });
        if (existing) {
          return res.status(400).json({ message: 'This custom alias is already taken' });
        }
        shortCode = customAlias;
        isCustom = true;
      } else {
        shortCode = await generateUniqueShortCode();
      }

      const url = await Url.create({
        user: req.user._id,
        originalUrl,
        shortCode,
        customAlias: isCustom,
        expiresAt: expiresAt || null,
      });

      return res.status(201).json({
        _id: url._id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl: buildShortUrl(url.shortCode),
        clicks: url.clicks,
        customAlias: url.customAlias,
        expiresAt: url.expiresAt,
        isActive: url.isActive,
        createdAt: url.createdAt,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ─────────────────────────────────────────────────────────
// @route   GET /api/urls
// @desc    Get all URLs for logged-in user
// @access  Private
// ─────────────────────────────────────────────────────────
router.get('/', protect, async (req, res, next) => {
  try {
    const urls = await Url.find({ user: req.user._id }).sort({ createdAt: -1 });

    const formatted = urls.map((url) => ({
      _id: url._id,
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      shortUrl: buildShortUrl(url.shortCode),
      clicks: url.clicks,
      customAlias: url.customAlias,
      expiresAt: url.expiresAt,
      isActive: url.isActive,
      lastVisited: url.lastVisited,
      createdAt: url.createdAt,
    }));

    return res.json(formatted);
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────
// @route   GET /api/urls/:id/analytics
// @desc    Get analytics for a specific URL
// @access  Private
// ─────────────────────────────────────────────────────────
router.get('/:id/analytics', protect, async (req, res, next) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, user: req.user._id });

    if (!url) {
      return res.status(404).json({ message: 'Short URL not found' });
    }

    const recentClicks = await Click.find({ url: url._id })
      .sort({ timestamp: -1 })
      .limit(20);

    // Aggregate daily click trends for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyTrends = await Click.aggregate([
      { $match: { url: url._id, timestamp: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Device & browser breakdown
    const deviceBreakdown = await Click.aggregate([
      { $match: { url: url._id } },
      { $group: { _id: '$device', count: { $sum: 1 } } },
    ]);

    const browserBreakdown = await Click.aggregate([
      { $match: { url: url._id } },
      { $group: { _id: '$browser', count: { $sum: 1 } } },
    ]);

    return res.json({
      _id: url._id,
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      shortUrl: buildShortUrl(url.shortCode),
      totalClicks: url.clicks,
      lastVisited: url.lastVisited,
      createdAt: url.createdAt,
      expiresAt: url.expiresAt,
      isActive: url.isActive,
      recentVisits: recentClicks.map((c) => ({
        timestamp: c.timestamp,
        device: c.device,
        browser: c.browser,
        os: c.os,
        referrer: c.referrer,
      })),
      dailyTrends,
      deviceBreakdown,
      browserBreakdown,
    });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────
// @route   GET /api/urls/:id/qrcode
// @desc    Generate a QR code (base64 PNG) for a short URL
// @access  Private
// ─────────────────────────────────────────────────────────
router.get('/:id/qrcode', protect, async (req, res, next) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, user: req.user._id });

    if (!url) {
      return res.status(404).json({ message: 'Short URL not found' });
    }

    const qrDataUrl = await QRCode.toDataURL(buildShortUrl(url.shortCode), {
      width: 300,
      margin: 2,
    });

    return res.json({ qrCode: qrDataUrl });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────
// @route   PUT /api/urls/:id
// @desc    Edit destination URL / expiry / active status
// @access  Private
// ─────────────────────────────────────────────────────────
router.put(
  '/:id',
  protect,
  [
    body('originalUrl')
      .optional()
      .trim()
      .custom((value) => !value || isValidUrl(value))
      .withMessage('Please provide a valid URL starting with http:// or https://'),
    body('expiresAt').optional({ checkFalsy: true }).isISO8601().withMessage('Invalid expiry date'),
    body('isActive').optional().isBoolean().withMessage('isActive must be true or false'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
      }

      const url = await Url.findOne({ _id: req.params.id, user: req.user._id });

      if (!url) {
        return res.status(404).json({ message: 'Short URL not found' });
      }

      const { originalUrl, expiresAt, isActive } = req.body;

      if (originalUrl !== undefined) url.originalUrl = originalUrl;
      if (expiresAt !== undefined) url.expiresAt = expiresAt || null;
      if (isActive !== undefined) url.isActive = isActive;

      await url.save();

      return res.json({
        _id: url._id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl: buildShortUrl(url.shortCode),
        clicks: url.clicks,
        customAlias: url.customAlias,
        expiresAt: url.expiresAt,
        isActive: url.isActive,
        lastVisited: url.lastVisited,
        createdAt: url.createdAt,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ─────────────────────────────────────────────────────────
// @route   DELETE /api/urls/:id
// @desc    Delete a short URL
// @access  Private
// ─────────────────────────────────────────────────────────
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, user: req.user._id });

    if (!url) {
      return res.status(404).json({ message: 'Short URL not found' });
    }

    await Click.deleteMany({ url: url._id });
    await url.deleteOne();

    return res.json({ message: 'Short URL deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────
// @route   POST /api/urls/bulk
// @desc    Bulk create short URLs from a CSV file (column: url)
// @access  Private
// ─────────────────────────────────────────────────────────
router.post('/bulk', protect, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a CSV file' });
    }

    const rows = [];
    const stream = Readable.from(req.file.buffer.toString());

    stream
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', async () => {
        try {
          const results = [];

          for (const row of rows) {
            const originalUrl = (row.url || row.URL || row.originalUrl || '').trim();

            if (!originalUrl || !isValidUrl(originalUrl)) {
              results.push({ originalUrl: originalUrl || '(empty)', status: 'failed', reason: 'Invalid URL' });
              // eslint-disable-next-line no-continue
              continue;
            }

            // eslint-disable-next-line no-await-in-loop
            const shortCode = await generateUniqueShortCode();

            // eslint-disable-next-line no-await-in-loop
            const url = await Url.create({
              user: req.user._id,
              originalUrl,
              shortCode,
            });

            results.push({
              originalUrl: url.originalUrl,
              shortUrl: buildShortUrl(url.shortCode),
              status: 'success',
            });
          }

          return res.status(201).json({ results });
        } catch (innerErr) {
          next(innerErr);
        }
      })
      .on('error', (err) => next(err));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
