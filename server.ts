import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    platform: 'RogueByte Police Digital Forensics Suite (RBP-DFS) v1.0.4',
    author: 'SidoDev-Dz',
    organization: 'RogueByte',
    timestamp: new Date().toISOString(),
    cryptoAvailable: true,
  });
});

// Evidence Hash verification endpoint
app.post('/api/forensics/verify-hash', (req, res) => {
  try {
    const { contentBase64, expectedHash } = req.body;
    if (!contentBase64) {
      return res.status(400).json({ error: 'contentBase64 is required' });
    }
    const buffer = Buffer.from(contentBase64, 'base64');
    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
    const sha1 = crypto.createHash('sha1').update(buffer).digest('hex');
    const md5 = crypto.createHash('md5').update(buffer).digest('hex');

    const match = expectedHash ? (sha256.toLowerCase() === expectedHash.toLowerCase()) : null;

    res.json({
      sha256,
      sha1,
      md5,
      bytes: buffer.length,
      verified: match !== null ? match : true,
      mismatchAlert: match === false,
      calculatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Hash calculation failed' });
  }
});

// Module 14: AI-Assisted Forensic Review
app.post('/api/ai/review', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured in environment. AI assistance is optional and offline analysis remains 100% operational.',
      });
    }

    const { artifacts, inquiry, caseNumber } = req.body;
    if (!artifacts || !Array.isArray(artifacts)) {
      return res.status(400).json({ error: 'artifacts array is required' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are the forensic review engine for RogueByte Police Digital Forensics Suite (RBP-DFS).
Developer: SidoDev-Dz | Organization: RogueByte.

CRITICAL FORENSIC RULES:
1. Every observation, anomaly, or timeline correlation MUST cite the specific underlying artifact ID, file path, timestamp, or record identifier.
2. Clearly distinguish between "CONFIRMED FACT" (directly observed in parsed records) and "INVESTIGATIVE HYPOTHESIS / UNVERIFIED LEAD" (requires human examiner corroboration).
3. AI must NEVER invent evidence, assume facts not present in provided artifacts, or fabricate timestamps.
4. If an anomaly, timestamp skew, or suspicious anti-forensic activity is detected (e.g. timestomping, wiped WAL logs, wiped SMS threads, mismatched magic bytes), document the specific bytes or records indicating it.
5. Format your output strictly in clean structured sections:
   - ## EXECUTIVE SUMMARY (Scope & Verified Scope)
   - ## KEY CHRONOLOGY & CORRELATED EVENTS (with Artifact IDs)
   - ## ANOMALIES & POTENTIAL INCONSISTENCIES (with evidence citations)
   - ## INVESTIGATIVE HYPOTHESES REQUIRING EXAMINER VERIFICATION (marked unverified)
   - ## LIMITATIONS & RECOMMENDED NEXT ACTIONS`;

    const userPrompt = `CASE IDENTIFIER: ${caseNumber || 'RBP-CASE-UNKNOWN'}
USER INQUIRY: ${inquiry || 'Perform comprehensive forensic cross-artifact review and anomaly detection'}

PARSED EVIDENCE ARTIFACTS:
${JSON.stringify(artifacts.slice(0, 30), null, 2)}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2, // Low temperature for high forensic consistency
      },
    });

    res.json({
      success: true,
      analysis: response.text,
      timestamp: new Date().toISOString(),
      disclaimer: 'UNVERIFIED AI-ASSISTED REVIEW: Generated for investigative lead triage only. Not certified without independent examiner verification.',
    });
  } catch (err: any) {
    console.error('AI Review error:', err);
    res.status(500).json({ error: err.message || 'AI Review processing failed' });
  }
});

// Setup Vite middlewares for development or static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RBP-DFS] RogueByte Police Digital Forensics Suite server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[RBP-DFS] Server failed to start:', err);
  process.exit(1);
});
