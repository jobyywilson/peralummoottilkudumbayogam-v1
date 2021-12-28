const axios = require('axios');

exports.handler = (event, context, callback) => {
    let token = "EAAF2oRAzpZCEBAPwpaXmGJP8MzQTvy7dxbcOZA341yfJEq0sRiGssaeINVzvZAFwrZBpmXNMItCRJJrr19y6K0TqcNLHhSBpco3ZB1udevj8Acw7XnZAtroCTC3JT02mG9SJakiCfgO1k7xkb9ZAplEWuoaMcaCnzzE7vtykvKsWgZDZD"
    let endpoint = `https://graph.facebook.com/v12.0/108658411591775/posts?fields=story,attachments.limit(10){title,description,description_tags,unshimmed_url,subattachments,url,media_type,media,type,target},event,full_picture&access_token=${token}`
    axios.get(endpoint)
        .then(json => {
            callback(null, {
                statusCode: 200,
                body: JSON.stringify(json.data)
            });
        })
        .catch(ex => callback(ex));


};
