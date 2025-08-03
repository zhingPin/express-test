import { Request, Response } from 'express';
import OpenAI from 'openai';

const openai = new OpenAI();

export const initiateChatRun = async (req: Request, res: Response) => {
    const { threadId } = req.params;
    const { assistantId, content } = req.body;

    try {
        await openai.beta.threads.messages.create(threadId, {
            role: 'user',
            content,
        });

        const run = await openai.beta.threads.runs.create(threadId, {
            assistant_id: assistantId,
        });

        res.json({ runId: run.id });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message || 'Failed to initiate assistant run' });
    }
};

export const getRunStatus = async (req: Request, res: Response) => {
    const { threadId } = req.params;
    const { runId } = req.query;

    try {
        const run = await openai.beta.threads.runs.retrieve(threadId, String(runId));

        if (run.status === 'completed') {
            const messages = await openai.beta.threads.messages.list(threadId);
            const assistantMessage = messages.data.find((m) => m.role === 'assistant');

            const text =
                assistantMessage?.content
                    ?.map((c) => ('text' in c ? c.text.value : ''))
                    .join('') || 'No response';

            return res.json({ status: 'completed', message: text });
        }

        return res.json({ status: run.status });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message || 'Error checking run status' });
    }
};
