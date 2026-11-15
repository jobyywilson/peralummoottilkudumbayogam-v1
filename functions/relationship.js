const axios = require('axios');
const { SUPABASE_API_KEY, ENCRYPT_KEY } = require('./lib/family-api-config');
const RELATIONSHIP_URL = 'https://hzqpjqvopcevhucgazlh.supabase.co/rest/v1/relationship'

exports.handler = async (event) => {

    const memberId = event.queryStringParameters?.memberId;
    if (!memberId || !/^[A-Za-z0-9.-]+$/.test(memberId)) {
      return jsonResponse(400, { error: 'A valid memberId is required.' });
    }
    const nodeId = encodeURIComponent(memberId);
    const myHeaders = {
        'Authorization': `Bearer ${SUPABASE_API_KEY}`,
        'apiKey': SUPABASE_API_KEY
      };
      let url = ''
      if(isSpouseNodeId(nodeId)){
        url = `${RELATIONSHIP_URL}?secondary_member_id=eq.${nodeId}&select=spouse:relationship_primary_member_id_fkey(nodeId,name)`
      }else{
        url = `${RELATIONSHIP_URL}?primary_member_id=eq.${nodeId}&select=spouse:relationship_secondary_member_id_fkey(nodeId,name)`
      }

      try {
        const json = await axios.get(url, { headers: myHeaders, responseType: 'json', timeout: 15000 });
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: getEncryptedData(json.data)
        };
      } catch (error) {
        console.error('Relationship function failed', { status: error.response?.status, message: error.message });
        return jsonResponse(502, { error: 'Unable to load spouse details.' });
      }
};

function jsonResponse(statusCode, body) {
    return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

function getEncryptedData(data){
    let encryptedData = encrypt(JSON.stringify(data))
    return JSON.stringify({"data":encryptedData})
}

function isSpouseNodeId(nodeId) {
    return /^(.*S\d*)$/.test(nodeId);
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

