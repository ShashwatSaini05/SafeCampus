import { Router, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';
import { classifyReport } from '../lib/aiClassifier';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

function generateTrackingId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'RPT-';
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

// GET /api/reports — Public feed (paginated, no emails exposed)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const category = req.query.category as string;
    const status = req.query.status as string;

    let query = supabase
      .from('reports')
      .select('id, tracking_id, category, description, location, status, priority, created_at, anonymous_id', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category && category !== 'all') query = query.eq('category', category);
    if (status && status !== 'all') query = query.eq('status', status);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({
      reports: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (err: unknown) {
    console.error('Get reports error:', err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// GET /api/reports/track/:trackingId — Status check
router.get('/track/:trackingId', async (req, res) => {
  try {
    const { trackingId } = req.params;
    const { data, error } = await supabase
      .from('reports')
      .select('tracking_id, category, description, location, status, priority, created_at')
      .eq('tracking_id', trackingId.toUpperCase())
      .single();

    if (error || !data) {
      res.status(404).json({ error: 'Report not found. Check your tracking ID.' });
      return;
    }

    res.json({ report: data });
  } catch (err: unknown) {
    console.error('Track report error:', err);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// POST /api/reports — Submit report (auth required)
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      category: z.enum(['ragging', 'harassment', 'safety', 'other']).optional(),
      description: z.string().min(20, 'Description must be at least 20 characters').max(2000),
      location: z.string().max(200).optional(),
      evidence_urls: z.array(z.string().url()).optional(),
    });

    const { category: manualCategory, description, location, evidence_urls } = schema.parse(req.body);

    // AI classification
    const { category: aiCategory, priority } = classifyReport(description);
    const finalCategory = manualCategory || aiCategory;
    const trackingId = generateTrackingId();

    const { data: report, error } = await supabase
      .from('reports')
      .insert({
        id: uuidv4(),
        tracking_id: trackingId,
        category: finalCategory,
        description,
        location: location || null,
        status: 'Pending',
        priority,
        anonymous_id: req.user!.anonymousId,
      })
      .select()
      .single();

    if (error) throw error;

    // Store evidence
    if (evidence_urls && evidence_urls.length > 0) {
      const evidenceRows = evidence_urls.map((url) => ({
        id: uuidv4(),
        report_id: report.id,
        file_url: url,
      }));
      await supabase.from('evidence').insert(evidenceRows);
    }

    res.status(201).json({
      message: 'Report submitted successfully',
      trackingId,
      category: finalCategory,
      priority,
      reportId: report.id,
    });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      const firstIssue = err.issues?.[0] ?? err;
      const msg = (firstIssue as { message?: string })?.message ?? 'Validation error';
      res.status(400).json({ error: msg });
      return;
    }
    console.error('Submit report error:', err);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

// POST /api/reports/sos — Emergency SOS
router.post('/sos', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      description: z.string().default('EMERGENCY SOS — Immediate assistance required!'),
      location: z.string().optional(),
    });

    const { description, location } = schema.parse(req.body);
    const trackingId = generateTrackingId();

    const { error } = await supabase.from('reports').insert({
      id: uuidv4(),
      tracking_id: trackingId,
      category: 'safety',
      description: `🆘 SOS EMERGENCY: ${description}`,
      location: location || null,
      status: 'Pending',
      priority: 'High',
      anonymous_id: req.user!.anonymousId,
    });

    if (error) throw error;

    res.status(201).json({
      message: 'SOS report sent! Help is on the way.',
      trackingId,
      priority: 'High',
    });
  } catch (err: unknown) {
    console.error('SOS error:', err);
    res.status(500).json({ error: 'Failed to submit SOS' });
  }
});

// POST /api/reports/classify — AI preview
router.post('/classify', async (req, res) => {
  const { description } = req.body;
  if (!description || description.length < 5) {
    res.status(400).json({ error: 'Description too short' });
    return;
  }
  const result = classifyReport(description);
  res.json(result);
});

export default router;
