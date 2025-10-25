const express = require('express');
const aiController = require('../controllers/ai.controller')
const authMiddleware = require('../middleware/auth.middleware');
const router = express.Router();

router.post("/get-review", authMiddleware, aiController.getReview)
router.post("/generate-code", authMiddleware, aiController.generateCode)
router.post("/generate-roadmap", authMiddleware, aiController.generateRoadmap)
router.post("/mark-day-complete", authMiddleware, aiController.markDayComplete)
router.get("/get-roadmap-progress", authMiddleware, aiController.getRoadmapProgress)


module.exports = router;
