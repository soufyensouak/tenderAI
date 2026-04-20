const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) return res.status(401).json({ error: 'Invalid token' });

    // On récupère le profil utilisateur avec son company_id
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) return res.status(404).json({ error: 'User profile not found' });

    req.user = profile; // Contient l'ID et le company_id
    next();
  } catch (err) {
    res.status(500).json({ error: 'Internal Auth Error' });
  }
};

module.exports = requireAuth;