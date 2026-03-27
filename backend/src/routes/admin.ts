import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { adminMiddleware } from '../middleware/auth';

const router = Router();

// All admin routes require admin secret
router.use(adminMiddleware);

// GET /api/admin/reports
router.get('/reports', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;
    const status = req.query.status as string;
    const priority = req.query.priority as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('reports')
      .select('*, evidence(file_url)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category && category !== 'all') query = query.eq('category', category);
    if (status && status !== 'all') query = query.eq('status', status);
    if (priority && priority !== 'all') query = query.eq('priority', priority);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({
      reports: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (err) {
    console.error('Admin get reports error:', err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// PATCH /api/admin/reports/:id
router.patch('/reports/:id', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      status: z.enum(['Pending', 'Under Review', 'Resolved']).optional(),
      priority: z.enum(['Low', 'Medium', 'High']).optional(),
    });

    const updates = schema.parse(req.body);
    const { id } = req.params;

    const { data, error } = await supabase
      .from('reports')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    res.json({ message: 'Report updated', report: data });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid update values' });
      return;
    }
    console.error('Admin update error:', err);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

// GET /api/admin/analytics
router.get('/analytics', async (_req: Request, res: Response) => {
  try {
    const { data: reports, error } = await supabase
      .from('reports')
      .select('category, status, priority, created_at');

    if (error) throw error;

    const total = reports?.length || 0;
    const byStatus = {
      Pending: reports?.filter(r => r.status === 'Pending').length || 0,
      'Under Review': reports?.filter(r => r.status === 'Under Review').length || 0,
      Resolved: reports?.filter(r => r.status === 'Resolved').length || 0,
    };
    const byCategory = {
      ragging: reports?.filter(r => r.category === 'ragging').length || 0,
      harassment: reports?.filter(r => r.category === 'harassment').length || 0,
      safety: reports?.filter(r => r.category === 'safety').length || 0,
      other: reports?.filter(r => r.category === 'other').length || 0,
    };
    const byPriority = {
      High: reports?.filter(r => r.priority === 'High').length || 0,
      Medium: reports?.filter(r => r.priority === 'Medium').length || 0,
      Low: reports?.filter(r => r.priority === 'Low').length || 0,
    };

    // Last 7 days trend
    const now = new Date();
    const trend = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];
      return {
        date: dateStr,
        count: reports?.filter(r => r.created_at?.startsWith(dateStr)).length || 0,
      };
    });

    res.json({ total, byStatus, byCategory, byPriority, trend });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
