const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;
const ENCRYPT_KEY  = process.env.ENCRYPT_KEY
const PATH = "/.netlify/functions/users/"
const SUPABASE_HOST = 'https://hzqpjqvopcevhucgazlh.supabase.co/rest/v1/user'
const GET_ALL_MEMBERS = `${SUPABASE_HOST}?isSpouse=eq.false&select=nodeId,name,parentNodeId,spouse&order=nodeId.asc`

exports.handler = (event, context, callback) => {
  const supabase = createClient('https://hzqpjqvopcevhucgazlh.supabase.co', SUPABASE_API_KEY)


  let { data, error } =  supabase.auth.signInWithPassword({
    email: 'jobyywilson@gmail.com',
    password: 'testpassword',
  }).then(json => {
    console.log(json)
    callback(null, {
        statusCode: 200,
        body: json
    });
})

}

