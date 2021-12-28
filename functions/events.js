const axios = require('axios');

exports.handler = (event, context, callback) => {
    let token = "EAAF2oRAzpZCEBAEcuZC1Cur3kaPCrQMCaZCrPSmZBZBn0cBkdIEv5tAhSzZArbPmZBQ05enFZAf5hNq1V8UgcSsYNlSmMWf6dVM8t5gDAFaD704SuOhW1OQ6QF6pjrelCZAF1UkZCET4AgZAPYlJfi6K4MroPno7MEREBmrDcKgsGUAEwZDZD"
    let endpoint = `https://graph.facebook.com/v12.0/108658411591775/events?fields=cover,name,description,start_time,end_time,place,category&access_token=${token}`
    axios.get(endpoint)
        .then(json => {
            callback(null, {
                statusCode: 200,
                body: JSON.stringify(json.data)
            });
        })
        .catch(ex => callback(ex));


};
