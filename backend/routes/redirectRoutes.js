const express = require('express');
const UAParser = require('ua-parser-js');
const Url = require('../models/Url');
const Click = require('../models/Click');

const router = express.Router();

// ─────────────────────────────────────────────────────────
// @route   GET /:shortCode
// @desc    Redirect to original URL & log analytics
// @access  Public
// ─────────────────────────────────────────────────────────
router.get('/:shortCode', async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).json({ message: 'Short URL not found' });
    }

    if (!url.isActive) {
      return res.status(410).json({ message: 'This short URL has been deactivated' });
    }

    if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
      return res.status(410).json({ message: 'This short URL has expired' });
    }

    // Parse user-agent for device/browser/OS analytics
    const parser = new UAParser(req.headers['user-agent']);
    const uaResult = parser.getResult();

    const click = new Click({
      url: url._id,
      timestamp: new Date(),
      ipAddress: req.ip,
      device: uaResult.device.type || 'desktop',
      browser: uaResult.browser.name || 'Unknown',
      os: uaResult.os.name || 'Unknown',
      referrer: req.headers.referer || req.headers.referrer || 'Direct',
    });

    await click.save();

    url.clicks += 1;
    url.lastVisited = new Date();
    await url.save();

    return res.redirect(url.originalUrl);
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────
// @route   GET /api/stats/:shortCode
// @desc    Public stats page data (no auth required)
// @access  Public
// ─────────────────────────────────────────────────────────
const statsRouter = express.Router();

statsRouter.get('/:shortCode', async (req, res, next) => {
  try {
    const url = await Url.findOne({ shortCode: req.params.shortCode });

    if (!url) {
      return res.status(404).json({ message: 'Short URL not found' });
    }

    return res.json({
      shortCode: url.shortCode,
      shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
      totalClicks: url.clicks,
      createdAt: url.createdAt,
      lastVisited: url.lastVisited,
      isActive: url.isActive,
      expiresAt: url.expiresAt,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = { redirectRouter: router, statsRouter };
