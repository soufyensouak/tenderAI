const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

router.get('/', requireAuth, async (req, res) => {
  let query = supabase.from('aos').select('*');

  // Filtres
  if (req.query.sector) query = query.eq('sector', req.query.sector);
  if (req.query.dept) query = query.eq('dept', req.query.dept);

  const { data, error } = await query.order('published_at', { ascending: false }).limit(100);
  if (error) return res.status(400).json(error);
  res.json({ results: data });
});

router.get('/:id', requireAuth, async (req, res) => {
  const { data, error } = await supabase.from('aos').eq('id', req.params.id).single();
  if (error) return res.status(404).json({ error: "AO non trouvé" });
  res.json(data);
});

module.exports = router;