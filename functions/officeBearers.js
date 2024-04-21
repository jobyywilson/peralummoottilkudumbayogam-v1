const axios = require('axios');
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;
const ENCRYPT_KEY  = process.env.ENCRYPT_KEY
const PATH = "/.netlify/functions/officeBearers/"
const OFFICE_BEARERS_URL = 'https://hzqpjqvopcevhucgazlh.supabase.co/rest/v1/office_bearers'
const GET_ALL_OFFICE_BEARERS = `${OFFICE_BEARERS_URL}?select=name,address,postion,year&order=year.desc`

exports.handler = (event, context, callback) => {
    let nodeId = event.queryStringParameters.memberId;
    const myHeaders = {
        'Authorization': `Bearer ${SUPABASE_API_KEY}`,
        'apiKey': SUPABASE_API_KEY
      };
      let users = []

      let url = GET_ALL_OFFICE_BEARERS
      if(nodeId){
        url = `${OFFICE_BEARERS_URL}?officeBearerUserId=eq.${nodeId}&select=postion,year&order=year.desc`
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

