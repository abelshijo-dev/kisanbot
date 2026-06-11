import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { diagnoseCrop } from './gemini.js';
import { saveReport, getRecentReports } from './firestore.js';

dotenv.config();

const app = express();
app.use(cors());
// Increase limit to 10mb to handle base64 images
app.use(express.json({ limit: '10mb' }));

// POST /triage — main diagnosis endpoint
app.post('/triage', async (req, res) => {
  const { description, crop, district, season, language = 'English', imageBase64, imageMimeType } = req.body;

  // Allow image-only diagnosis (no description needed if image provided)
  if (!crop) {
    return res.status(400).json({ error: 'crop is required' });
  }
  if (!description && !imageBase64) {
    return res.status(400).json({ error: 'Either description or image is required' });
  }

  try {
    const result = await diagnoseCrop({ description, crop, district, season, language, imageBase64, imageMimeType });

    saveReport({ crop, district, issue: result.issue, severity: result.severity }).catch(console.error);

    res.json(result);
  } catch (err) {
    console.error('Triage error:', err);
    res.status(500).json({ error: 'AI diagnosis failed. Please try again.' });
  }
});

// GET /reports — recent community reports for heatmap
app.get('/reports', async (req, res) => {
  try {
    const reports = await getRecentReports();
    res.json(reports);
  } catch (err) {
    console.error('Reports error:', err);
    res.status(500).json({ error: 'Could not fetch reports' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`KisanBot server running on port ${PORT}`));
