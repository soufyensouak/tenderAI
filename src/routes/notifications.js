const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const { createClient } = require('@supabase/supabase-js');

// On utilise la clé anon car le middleware a déjà validé l'utilisateur
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

/**
 * GET /api/notifications
 * Liste toutes les notifications de l'entreprise de l'utilisateur
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        aos (
          id,
          title,
          buyer,
          amount
        )
      `)
      .eq('company_id', req.user.company_id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * PATCH /api/notifications/:id
 * Marquer une notification comme lue
 */
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', req.params.id)
      .eq('company_id', req.user.company_id) // Sécurité : vérifie que la notif appartient bien à l'entreprise
      .select();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * PATCH /api/notifications/read-all
 * Marquer toutes les notifications de l'entreprise comme lues
 */
router.patch('/read-all', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('company_id', req.user.company_id)
      .eq('read', false);

    if (error) throw error;
    res.json({ message: "Toutes les notifications ont été marquées comme lues" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * DELETE /api/notifications/:id
 * Supprimer une notification
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', req.params.id)
      .eq('company_id', req.user.company_id);

    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;