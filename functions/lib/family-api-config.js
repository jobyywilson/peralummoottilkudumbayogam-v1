// Public anon key already used by the browser client. Server configuration takes precedence.
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6cXBqcXZvcGNldmh1Y2dhemxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODMyNzA2ODQsImV4cCI6MTk5ODg0NjY4NH0.sWqpgYXhcdsrjhLloL4lzD3GvQ9Ix4l4m1nXQnc471Q';

module.exports = {
  SUPABASE_API_KEY: process.env.SUPABASE_API_KEY || process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY,
  // Keep the default aligned with the browser CryptoService.
  ENCRYPT_KEY: process.env.ENCRYPT_KEY || 'hf8685345fhjs9h8',
  // The legacy byte cipher can only round-trip ASCII. Escape Unicode before encryption.
  serializeFamilyData: data => JSON.stringify(data).replace(/[\u007f-\uffff]/g, char =>
    '\\u' + char.charCodeAt(0).toString(16).padStart(4, '0'))
};
