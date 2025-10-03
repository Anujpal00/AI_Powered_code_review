const express = require('express');
const router = express.Router();
const history = require('../controllers/history.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/add', authMiddleware, history.addHistory);
router.get('/', authMiddleware, history.getHistory);
router.delete('/:index', authMiddleware, history.deleteHistory);

module.exports = router;
