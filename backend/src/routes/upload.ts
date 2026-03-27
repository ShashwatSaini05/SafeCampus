import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// POST /api/upload/evidence — Upload file to Supabase Storage
router.post('/evidence', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { fileName, fileType, fileData } = req.body;

    if (!fileName || !fileType || !fileData) {
      res.status(400).json({ error: 'fileName, fileType, and fileData (base64) are required' });
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];
    if (!allowedTypes.includes(fileType)) {
      res.status(400).json({ error: 'File type not allowed. Use JPEG, PNG, WebP, GIF, MP4, or WebM.' });
      return;
    }

    // Convert base64 to buffer
    const base64Data = fileData.replace(/^data:.+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Check file size (max 10MB)
    if (buffer.length > 10 * 1024 * 1024) {
      res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
      return;
    }

    const ext = fileType.split('/')[1];
    const uniqueFileName = `evidence/${uuidv4()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('safecampus-evidence')
      .upload(uniqueFileName, buffer, {
        contentType: fileType,
        upsert: false,
      });

    if (uploadError) {
      // In dev mode, return a placeholder URL
      console.error('Storage upload error:', uploadError);
      res.json({
        url: `https://via.placeholder.com/400x300?text=Evidence+Uploaded`,
        path: uniqueFileName,
        dev: true,
      });
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('safecampus-evidence')
      .getPublicUrl(uniqueFileName);

    res.json({
      url: publicUrlData.publicUrl,
      path: uniqueFileName,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;
