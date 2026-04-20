const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

router.get('/', requireAuth, async (req, res) => {
  const { data } = await supabase.from('pipeline')
    .select('*, aos(*)')
    .eq('company_id', req.user.company_id);
  res.json(data);
});

router.patch('/:id', requireAuth, async (req, res) => {
  const { data } = await supabase.from('pipeline')
    .update(req.body)
    .eq('id', req.params.id)
    .eq('company_id', req.user.company_id); // Sécurité
  res.json(data);
});

module.exports = router;