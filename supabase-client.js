/* ══════════════════════════════════════════════════════════════
   FREDDY FINANCE — Supabase Client Init
   ══════════════════════════════════════════════════════════════ */

const SUPABASE_URL = 'https://wxqpknldzbardytzxohv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cXBrbmxkemJhcmR5dHp4b2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2OTM1NDAsImV4cCI6MjA5NDI2OTU0MH0.uQyOqUuHeyNyZ-QExj0aSO643cKEExLXYkvEu7ivfn8';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
