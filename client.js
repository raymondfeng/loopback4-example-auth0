const axios = require('axios');

/**
 * Please add `auth0-secret.json` for your credentials
 * @example
 * ```json
 * {
 * "client_id": "{CLIENT_ID}",
 * "client_secret": "{CLIENT_SECRET}",
 * "audience": "http://localhost:3000/ping"
 * }
 * ```
 */
const secrets = require('./auth0-secret');

/**
 * Request an access token using client credentials
 */
const tokenReq = {
  method: 'POST',
  url: 'https://apitoday.auth0.com/oauth/token',
  headers: {'content-type': 'application/json'},
  responseType: 'json',
  data: {
    ...secrets,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    grant_type: 'client_credentials',
    scope: 'greet',
  },
};

async function main() {
  let res = await axios(tokenReq);
  console.log(res.data);

  /**
   * Now try to run the /greet api using the access token
   */
  const greetReq = {
    method: 'GET',
    url: 'http://localhost:3000/greet',
    headers: {
      authorization: `Bearer ${res.data.access_token}`,
    },
  };

  res = await axios(greetReq);

  console.log(res.data);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
