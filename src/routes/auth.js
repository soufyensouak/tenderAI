const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Inscription : Création Entreprise + User Auth + User Table
router.post('/register', async (req, res) => {
  const { email, password, firstName, lastName, companyName } = req.body;

  // 1. Créer l'entreprise
  const { data: company, error: coErr } = await supabase
    .from('companies')
    .insert([{ name: companyName }]).select().single();
  if (coErr) return res.status(400).json(coErr);

  // 2. Créer l'utilisateur dans Supabase Auth
  const { data: authUser, error: authErr } = await supabase.auth.signUp({ email, password });
  if (authErr) return res.status(400).json(authErr);

  // 3. Créer l'entrée dans notre table 'users'
  await supabase.from('users').insert([{
    id: authUser.user.id,
    email,
    first_name: firstName,
    last_name: lastName,
    company_id: company.id,
    role: 'admin'
  }]);

  res.json({ message: "Compte créé avec succès" });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json(error);
  res.json(data); // Renvoie le session object avec le access_token (JWT)
});

module.exports = router;