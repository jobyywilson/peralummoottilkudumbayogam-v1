const axios = require('axios');
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;
const ENCRYPT_KEY  = process.env.ENCRYPT_KEY
const PATH = "/.netlify/functions/users/"
const SUPABASE_HOST = 'https://hzqpjqvopcevhucgazlh.supabase.co/rest/v1/user'
const GET_ALL_MEMBERS = `${SUPABASE_HOST}?isSpouse=eq.false&select=nodeId,name,parentNodeId,spouse&order=nodeId.asc`

exports.handler = (event, context, callback) => {
    console.log(process.env.ALL_USERS_HASHCODE)
    process.env.ALL_USERS_HASHCODE = "TEST"
    let nodeId ;
    if(event.path.indexOf(PATH)!== -1){
        nodeId =event.path.replace(PATH,"")
    }
    const myHeaders = {
        'Authorization': `Bearer ${SUPABASE_API_KEY}`,
        'apiKey': SUPABASE_API_KEY
      };
      let users = []

      let url = GET_ALL_MEMBERS
      if(nodeId){
        url = `${SUPABASE_HOST}?nodeId=eq.${nodeId}`
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

