const cron = require('node-cron');
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const BOAMP_URL = 'https://boamp-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/boamp/records?limit=100&order_by=dateparution+desc';

function mapCPVtoSector(cpv) {
  if (!cpv) return 'Services';
  if (cpv.startsWith('45')) return 'Travaux';
  if (cpv.startsWith('71')) return 'Ingénierie';
  return 'Fournitures';
}

async function syncBoamp() {
  console.log('--- Syncing BOAMP ---');
  try {
    const resp = await fetch(BOAMP_URL);
    const data = await resp.json();

    const formattedAOs = data.results.map(r => ({
      id: r.idweb,
      title: r.objet,
      buyer: r.acheteur?.nom || 'Inconnu',
      amount: r.montantestime || '—',
      deadline: r.dateecheance,
      sector: mapCPVtoSector(r.cpv_principal),
      dept: r.codedepartement?.[0],
      source: 'BOAMP',
      published_at: r.dateparution,
      raw_json: r
    }));

    await supabase.from('aos').upsert(formattedAOs, { onConflict: 'id' });
    console.log(`Successfully synced ${formattedAOs.length} AOs`);
  } catch (err) {
    console.error('Sync Error:', err);
  }
}

cron.schedule('0 * * * *', syncBoamp);
module.exports = syncBoamp;