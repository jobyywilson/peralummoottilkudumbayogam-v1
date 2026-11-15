const axios = require('axios');
const { SUPABASE_API_KEY, ENCRYPT_KEY } = require('./lib/family-api-config');
const PHOTO_TAG_URL = 'https://hzqpjqvopcevhucgazlh.supabase.co/rest/v1/photo_tag';

exports.handler = async (event) => {
  const memberId = event.queryStringParameters?.memberId;
  if (typeof memberId !== 'string' || !/^[A-Za-z0-9.-]+$/.test(memberId)) {
    return jsonResponse(400, { error: 'A valid memberId is required.' });
  }

  const url = `${PHOTO_TAG_URL}?user_id=eq.${encodeURIComponent(memberId)}&select=photos:photo!public_photo_tag_photo_id_fkey(big_photo_end_url,medium_photo_end_url,small_photo_end_url)`;
  try {
    const result = await axios.get(url, {
      headers: { Authorization: `Bearer ${SUPABASE_API_KEY}`, apikey: SUPABASE_API_KEY },
      responseType: 'json',
      timeout: 15000
    });
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: getEncryptedData(result.data)
    };
  } catch (error) {
    console.error('Tagged photos function failed', { status: error.response?.status, message: error.message });
    return jsonResponse(502, { error: 'Unable to load tagged photos.' });
  }
};

function jsonResponse(statusCode, body) {
  return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

function getEncryptedData(data){
    let encryptedData = encrypt(JSON.stringify(data))
    return JSON.stringify({"data":encryptedData})
}


function encrypt(data) {
    var encryptedText = '';
    for (var i = 0; i < data.length; i++) {
        var plainChar = data[i];
        var keyChar = ENCRYPT_KEY[i % ENCRYPT_KEY.length]; // Repeats key if it's shorter than plaintext
        var encryptedChar = String.fromCharCode((plainChar.charCodeAt(0) + keyChar.charCodeAt(0)) % 256);
        encryptedText += encryptedChar;
    }
    return encryptedText;
}

