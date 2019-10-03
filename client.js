/* eslint-disable @typescript-eslint/camelcase */
const request = require('request');

/**
 * ```json
 * {
 * "client_id": "{CLIENT_ID}",
 * "client_secret": "{CLIENT_SECRET}",
 * "audience": "http://localhost:3000/ping"
 * ```
}

 */
const secrets = require('./auth0-secret');

const tokenReq = {
  method: 'POST',
  url: 'https://apitoday.auth0.com/oauth/token',
  headers: {'content-type': 'application/json'},
  json: true,
  body: {
    ...secrets,
    grant_type: 'client_credentials',
    scope: 'greet',
  },
};

request(tokenReq, function(tokenError, response, body) {
  if (tokenError) throw new Error(tokenError);

  console.log(body);

  const greetReq = {
    method: 'GET',
    url: 'http://localhost:3000/greet',
    headers: {
      authorization: `Bearer ${body.access_token}`,
    },
  };

  request(greetReq, function(greetError, response2, user) {
    if (greetError) throw new Error(greetError);

    console.log(user);
  });
});
