const express = require('express');
const {
    getPastQuestions,
    getPastQuestion,
    createPastQuestion,
    updatePastQuestion,
    deletePastQuestion,
    approvePastQuestion,
    downloadPastQuestion,
    getFilterOptions,
    updateQuestionMetadata
} = require('../controllers/pastQuestionController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Public routes
router.route('/filters')
    .get(getFilterOptions);

router.route('/')
    .get(getPastQuestions);

// Public routes
router.route('/')
    .get(getPastQuestions);

router.route('/:id')
    .get(getPastQuestion);

router.route('/:id/download')
    .get(downloadPastQuestion);

// Protected routes
router.use(protect);

router.route('/')
    .post(upload.single('file'), createPastQuestion);

// PUT for metadata-only updates (no file required)
router.route('/:id/metadata')
    .put(updateQuestionMetadata);

// PUT for full updates with optional file upload
router.route('/:id')
    .put(upload.single('file'), updatePastQuestion)
    .delete(deletePastQuestion);

// Admin only routes
router.route('/:id/approve')
    .put(authorize('admin'), approvePastQuestion);

module.exports = router;