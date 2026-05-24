const express = require('express');
const { protect } = require('../middleware/auth');
const { createOrder, captureOrder } = require('../controllers/paymentController');

const router = express.Router();

router.post('/create-order', protect, createOrder);
router.post('/capture-order', protect, captureOrder);

module.exports = router;
