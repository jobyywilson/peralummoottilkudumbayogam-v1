const axios = require('axios');
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;
const ENCRYPT_KEY  = process.env.ENCRYPT_KEY
const PATH = "/.netlify/functions/memberUndeployed/"
const SUPABASE_HOST = 'https://hzqpjqvopcevhucgazlh.supabase.co/rest/v1/'
const RESOURCE_NAME = 'member_undeployed'

const GET_ALL_MEMBERS = `${SUPABASE_HOST}${RESOURCE_NAME}`
exports.handler = (event, context, callback) => {
    
    let nodeId ;
    if(event.path.indexOf(PATH)!== -1){
        nodeId =event.path.replace(PATH,"")
    }
    console.log("event.path->"+event.path)
    const myHeaders = {
        'Authorization': `Bearer ${SUPABASE_API_KEY}`,
        'apiKey': SUPABASE_API_KEY
      };
      let url = GET_ALL_MEMBERS
      if(nodeId){
        let spouseParamName = isSpouseNodeId(nodeId)?'secondaryParentMemberId':'parentNodeId';
        url = `${SUPABASE_HOST}${RESOURCE_NAME}?nodeId=eq.${nodeId}&select=*,parents:relationship_undeployed!member_undeployed_parent_relationship_id_fkey(primary:relationship_undeployed_primary_member_id_fkey(nodeId,name),secondary:relationship_undeployed_secondary_member_id_fkey(nodeId,name)),childrens:member_undeployed!${spouseParamName}(nodeId,name)`
      }
      console.log("URL->"+url)

      axios.get(url, { headers: myHeaders, responseType: 'json' }) .then(json => {
        callback(null, {
            statusCode: 200,
            body: getEncryptedData(json.data)
        });
    })
    .catch(ex => callback(ex));
};

function isSpouseNodeId(nodeId) {
    return /^(.*S\d*)$/.test(nodeId);
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

