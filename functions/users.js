const axios = require('axios');

const { SUPABASE_API_KEY, ENCRYPT_KEY } = require('./lib/family-api-config');
const PATH = '/.netlify/functions/users';
const SUPABASE_HOST = 'https://hzqpjqvopcevhucgazlh.supabase.co/rest/v1/';
const MEMBER_RESOURCE = 'user';
const GET_ALL_MEMBERS = 'https://hzqpjqvopcevhucgazlh.supabase.co/rest/v1/rpc/get_members?familytreecode=KPK';

exports.handler = async (event) => {
  if (!SUPABASE_API_KEY) {
    console.error('Missing SUPABASE_API_KEY or SUPABASE_ANON_KEY in Netlify environment.');
    return jsonResponse(500, { error: 'The users service is not configured.' });
  }

  try {
    const requestPath = event.rawPath || event.path || '';
    const nodeIdFromPath = requestPath.startsWith(PATH)
      ? decodeURIComponent(requestPath.slice(PATH.length).replace(/^\/+/, ''))
      : '';
    const nodeId = nodeIdFromPath || event.queryStringParameters?.nodeId || '';
    const headers = {
      Authorization: `Bearer ${SUPABASE_API_KEY}`,
      apikey: SUPABASE_API_KEY
    };

    let url = GET_ALL_MEMBERS;

    if (nodeId) {
      const spouseParamName = isSpouseNodeId(nodeId) ? 'secondaryParentMemberId' : 'parentNodeId';
      const encodedNodeId = encodeURIComponent(nodeId);
      const select = '*,parents:relationship!user_parent_relationship_id_fkey(primary:relationship_primary_member_id_fkey(nodeId,name,familyName:family_tree!user_family_tree_id_fkey(family_tree_name)),secondary:relationship_secondary_member_id_fkey(nodeId,name,familyName:family_tree!user_family_tree_id_fkey(family_tree_name))),childrens:user!' + spouseParamName + '(nodeId,name,secondaryParentMemberId,parent_relationship_id)';
      url = `${SUPABASE_HOST}${MEMBER_RESOURCE}?nodeId=eq.${encodedNodeId}&select=${encodeURIComponent(select)}`;
    }

    const response = await axios.get(url, {
      headers,
      responseType: 'json',
      timeout: 15000
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60'
      },
      body: JSON.stringify({ data: encrypt(JSON.stringify(response.data)) })
    };
  } catch (error) {
    const upstreamStatus = error.response?.status;
    console.error('Users function failed', {
      status: upstreamStatus,
      message: error.message,
      response: error.response?.data
    });

    return jsonResponse(502, {
      error: 'Unable to load family members.',
      upstreamStatus
    });
  }
};

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };
}

function isSpouseNodeId(nodeId) {
  return /^(.*S\d*)$/.test(nodeId);
}

function encrypt(data) {
  let encryptedText = '';

  for (let i = 0; i < data.length; i++) {
    const plainChar = data[i];
    const keyChar = ENCRYPT_KEY[i % ENCRYPT_KEY.length];
    encryptedText += String.fromCharCode((plainChar.charCodeAt(0) + keyChar.charCodeAt(0)) % 256);
  }

  return encryptedText;
}
