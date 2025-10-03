const express = require('express');
const aiController = require('../controllers/ai.controller')
const authMiddleware = require('../middleware/auth.middleware');
const router = express.Router();

router.post("/get-review", authMiddleware, aiController.getReview)
router.post("/generate-code", authMiddleware, aiController.generateCode)


module.exports = router;
