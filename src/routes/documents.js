
const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

router.post('/', requireAuth, async (req, res) => {
  const { ao_id, title, html_url, score } = req.body;
  const { data, error } = await supabase
    .from('documents')
    .insert([{
      company_id: req.user.company_id,
      ao_id,
      title,
      html_url,
      score
    }]).select();
  if (error) return res.status(400).json(error);
  res.json(data);
});

router.get('/', requireAuth, async (req, res) => {
  const { data } = await supabase
    .from('documents')
    .select('*')
    .eq('company_id', req.user.company_id);
  res.json(data);
});

module.exports = router;