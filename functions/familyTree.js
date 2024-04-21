const axios = require('axios');
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;
const ENCRYPT_KEY  = process.env.ENCRYPT_KEY
const FAMILY_TREE_URL = 'https://hzqpjqvopcevhucgazlh.supabase.co/rest/v1/family_tree'

exports.handler = (event, context, callback) => {

    let familyTreeCode = event.queryStringParameters.familyTreeCode;
    const myHeaders = {
        'Authorization': `Bearer ${SUPABASE_API_KEY}`,
        'apiKey': SUPABASE_API_KEY
      };
      let url = ''
      if(familyTreeCode){
        url = `${FAMILY_TREE_URL}?family_tree_code=eq.${familyTreeCode}`
      }

      axios.get(url, { headers: myHeaders, responseType: 'json' }) .then(json => {
        callback(null, {
            statusCode: 200,
            body: getEncryptedData(json.data)
        });
    })
    .catch(ex => callback(ex));
};


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

