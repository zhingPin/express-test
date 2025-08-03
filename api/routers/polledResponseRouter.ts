import express from 'express';
import { getRunStatus, initiateChatRun } from '../controllers/chatChunks';

const router = express.Router();

// Start a run (POST): send user message and create assistant run
router.post('/api/chat/:threadId/initiate', initiateChatRun);

// Poll run status (GET): client polls for updates
router.get('/api/chat/:threadId/status', getRunStatus);

export default router;
