import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { buildSystemInstruction, buildUserPrompt } from './src/utils/promptBuilder.ts';
import { AssistantRequest, AssistantResponse } from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '25mb' }));

// Shared Gemini client configured with proper telemetry headers
const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Robust, high-speed writing assistant endpoint
app.post('/api/assist', async (req: Request, res: Response) => {
  try {
    const payload = req.body as AssistantRequest;
    if (!payload.task) {
      return res.status(400).json({ success: false, error: 'Writing task is required.' });
    }

    const ai = getGenAI();
    // Use gemini-3.1-flash-lite for instant, responsive writing without hanging
    const modelName = 'gemini-3.1-flash-lite';

    const systemInstruction = buildSystemInstruction(payload.task, payload.targetLanguage);
    const userPrompt = buildUserPrompt(payload);

    const response = await ai.models.generateContent({
      model: modelName,
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text?.trim() || '';
    let parsed: any = {};

    try {
      parsed = JSON.parse(responseText);
    } catch {
      // Fallback: extract JSON from markdown if wrapped in ```json
      const match = responseText.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {
          parsed = { replacement: responseText };
        }
      } else {
        parsed = { replacement: responseText };
      }
    }

    // Ensure we always have replacement text
    const replacement =
      typeof parsed.replacement === 'string'
        ? parsed.replacement
        : typeof parsed === 'string'
        ? parsed
        : '';

    const result: AssistantResponse = {
      success: true,
      replacement,
      critique: parsed.critique ? String(parsed.critique) : undefined,
      changesSummary: Array.isArray(parsed.changesSummary) ? parsed.changesSummary : [],
      wordCountDelta: typeof parsed.wordCountDelta === 'number' ? parsed.wordCountDelta : 0,
      warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
      modelUsed: modelName,
    };

    return res.json(result);
  } catch (error: any) {
    console.error('API /api/assist error:', error);
    const msg = error?.message || 'Writing service error';
    return res.status(500).json({
      success: false,
      error: msg,
      replacement: '',
      modelUsed: 'none',
    });
  }
});

// Dedicated Fast Writer Endpoint (Plain text direct generation)
app.post('/api/writer/generate', async (req: Request, res: Response) => {
  try {
    const { prompt, currentText, taskType, language } = req.body;
    if (!prompt && !taskType) {
      return res.status(400).json({ success: false, error: 'Prompt or taskType required.' });
    }

    const ai = getGenAI();
    const isArabic = language === 'ar' || /[\u0600-\u06FF]/.test(currentText || '');

    const systemInstruction = `You are Quiet Notepad's primary writing intelligence—an elite author, editor, and scholar.
Deliver high-quality, articulate writing in ${isArabic ? 'Modern Standard Arabic (الفصحى)' : 'English'}.
Strictly follow the user's instructions.
Never invent false citations or statistics.
Return ONLY the crafted text without conversational filler or preambles like "Here is your text:".`;

    let instruction = `TASK: ${taskType || 'Write and refine'}\n`;
    if (prompt) instruction += `USER REQUEST: ${prompt}\n\n`;
    if (currentText) instruction += `TARGET CONTEXT:\n${currentText}\n\n`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: instruction,
      config: {
        systemInstruction,
      },
    });

    const text = response.text?.trim() || '';
    return res.json({ success: true, text });
  } catch (error: any) {
    console.error('API /api/writer/generate error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Writing generation failed.',
    });
  }
});

// Multimodal OCR
app.post('/api/ocr', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType, instruction } = req.body;
    if (!imageBase64 || !mimeType) {
      return res.status(400).json({ success: false, error: 'Missing imageBase64 or mimeType' });
    }

    const ai = getGenAI();
    const prompt = instruction
      ? `Transcribe all visible text from this document image faithfully. Preserve exact paragraph breaks, lists, formulas, and Arabic/English text without alteration.\nUser note: ${instruction}`
      : 'Transcribe all visible text faithfully from this document image. Preserve layout, table lines, equations, Arabic and English text accurately. Return plain text only.';

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType,
                data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, ''),
              },
            },
            { text: prompt },
          ],
        },
      ],
    });

    const transcribed = response.text?.trim() || '';
    return res.json({ success: true, text: transcribed });
  } catch (error: any) {
    console.error('API /api/ocr error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to perform OCR on image.',
    });
  }
});

// Multi-turn Conversational Chat Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, documentText, sourceFiles } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, error: 'Messages array is required.' });
    }

    const ai = getGenAI();
    let contextIntro = 'You are the conversational writing intelligence for Quiet Notepad.\nYou discuss ideas, outline arguments, critique prose, and answer research questions without altering the user’s file unless asked.\n\n';
    if (documentText) {
      contextIntro += `CURRENT NOTEPAD DOCUMENT CONTENT:\n${documentText.slice(0, 30000)}\n\n`;
    }
    if (sourceFiles && sourceFiles.length > 0) {
      contextIntro += `REFERENCE SOURCES:\n`;
      for (const s of sourceFiles) {
        contextIntro += `[${s.name}]: ${s.content.slice(0, 10000)}\n`;
      }
    }

    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents,
      config: {
        systemInstruction: contextIntro,
      },
    });

    const reply = response.text || '';
    return res.json({ success: true, reply });
  } catch (error: any) {
    console.error('API /api/chat error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to generate chat response.',
    });
  }
});

// Google Chat Endpoint
app.post('/api/google-chat/send', async (req: Request, res: Response) => {
  try {
    const { webhookUrl, text, threadKey } = req.body;
    if (!webhookUrl || !text) {
      return res.status(400).json({ success: false, error: 'webhookUrl and text are required.' });
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify({
        text,
        ...(threadKey ? { thread: { threadKey } } : {}),
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({
        success: false,
        error: `Google Chat returned ${response.status}: ${errText}`,
      });
    }

    const data = await response.json();
    return res.json({ success: true, data });
  } catch (error: any) {
    console.error('API /api/google-chat/send error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to dispatch to Google Chat.',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Quiet Notepad server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
