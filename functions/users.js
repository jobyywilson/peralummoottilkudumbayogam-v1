const axios = require('axios');
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;
const ENCRYPT_KEY  = process.env.ENCRYPT_KEY
const PATH = "/.netlify/functions/users/"
const SUPABASE_HOST = 'https://hzqpjqvopcevhucgazlh.supabase.co/rest/v1/'
const MEMBER_DEPLOYED_RESOURCE_NAME = 'user'

const GET_ALL_MEMBERS_WITHOUT_SPOUSE = `https://hzqpjqvopcevhucgazlh.supabase.co/rest/v1/rpc/get_members?familytreecode=KPK`
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

     
      if(nodeId){
        let spouseParamName = isSpouseNodeId(nodeId)?'secondaryParentMemberId':'parentNodeId';
        url = `${SUPABASE_HOST}${MEMBER_DEPLOYED_RESOURCE_NAME}?nodeId=eq.${nodeId}&select=*,parents:relationship!user_parent_relationship_id_fkey(primary:relationship_primary_member_id_fkey(nodeId,name,familyName:family_tree!user_family_tree_id_fkey(family_tree_name)),secondary:relationship_secondary_member_id_fkey(nodeId,name,familyName:family_tree!user_family_tree_id_fkey(family_tree_name))),childrens:user!${spouseParamName}(nodeId,name)`
      }
      console.log(url)
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

