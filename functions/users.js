const axios = require('axios');
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;
const ENCRYPT_KEY  = process.env.ENCRYPT_KEY
const PATH = "/.netlify/functions/users/"
const SUPABASE_HOST = 'https://hzqpjqvopcevhucgazlh.supabase.co/rest/v1/user'
const GET_ALL_MEMBERS_WITHOUT_SPOUSE = `https://hzqpjqvopcevhucgazlh.supabase.co/rest/v1/rpc/get_members`
const GET_ALL_MEMBERS = `${SUPABASE_HOST}?select=nodeId,name,parentNodeId,spouse&order=nodeId.asc`

exports.handler = (event, context, callback) => {
    
    let nodeId ;
    if(event.path.indexOf(PATH)!== -1){
        nodeId =event.path.replace(PATH,"")
    }
    const myHeaders = {
        'Authorization': `Bearer ${SUPABASE_API_KEY}`,
        'apiKey': SUPABASE_API_KEY
      };
      let users = []
      let url = GET_ALL_MEMBERS_WITHOUT_SPOUSE
      if(event.queryStringParameters && event.queryStringParameters.showSpouse){
        url = GET_ALL_MEMBERS;
      }

     
      if(nodeId){
        let spouseParamName = isSpouseNodeId(nodeId)?'secondaryParentMemberId':'parentNodeId';
        url = `${SUPABASE_HOST}?nodeId=eq.${nodeId}&select=*,parents:relationship!user_parent_relationship_id_fkey(primary:relationship_primary_member_id_fkey(nodeId,name),secondary:relationship_secondary_member_id_fkey(nodeId,name)),childrens:user!${spouseParamName}(nodeId,name)`
      }
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

