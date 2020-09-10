# loopback4-example-auth0

This module contains an example application to use [Auth0](https://auth0.com/) for JWT based authentication.

## Define an authentication strategy for Auth0

- src/authentication-strategies/auth0.ts

```ts
export class JWTAuthenticationStrategy implements AuthenticationStrategy {
  name = 'auth0-jwt';

  constructor(
    @inject(RestBindings.Http.RESPONSE)
    private response: Response,
    @inject(AuthenticationBindings.METADATA)
    private metadata: AuthenticationMetadata,
    @config()
    private options: Auth0Config,
  ) {}

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    // ...
  }
```

## Register the authentication strategy

Add the following code to `src/application.ts`:

```ts
export class Loopback4ExampleAuth0Application extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Bind authentication component related elements
    this.component(AuthenticationComponent);

    this.service(JWTServiceProvider);

    // Register the Auth0 JWT authentication strategy
    registerAuthenticationStrategy(this, JWTAuthenticationStrategy);
    this.configure(KEY).to({
      jwksUri: 'https://apitoday.auth0.com/.well-known/jwks.json',
      audience: 'http://localhost:3000/ping',
      issuer: 'https://apitoday.auth0.com/',
      algorithms: ['RS256'],
    });

    // Set up the custom sequence
    this.sequence(MySequence);
  }

  // ...
}
```

## Decorate a method to apply Auth0 JWT authentication

Add a method to `src/controllers/ping.controller.ts`:

```ts
@authenticate('auth0-jwt', {scopes: ['greet']})
  async greet(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<UserProfile> {
    // (@jannyHou)FIXME: explore a way to generate OpenAPI schema
    // for symbol property
    currentUserProfile.id = currentUserProfile[securityId];
    delete currentUserProfile[securityId];
    return currentUserProfile;
  }
}
```

## Give it try

1. Start the server

```sh
npm run start
```

2. Run the client

First add credentials to `auth0-secret.json`:

```json
{
  "client_id": "client-id from auth0",
  "client_secret": "client-secret from auth0",
  "audience": "http://localhost:3000/ping"
}
```

```sh
node client
```

You should see messages like:

```
node client
{
  access_token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IlFrSXhORU0wTkVRME9FRXdOa0k0TURBelJqTTJPVVl6TVRrMk9ESTVRelkxTXpsRk5rTTBNZyJ9.eyJpc3MiOiJodHRwczovL2FwaXRvZGF5LmF1dGgwLmNvbS8iLCJzdWIiOiJFVHJqSHpGY0VoRWt3ZTZvSHlZOGlUWDZKU3MxVnA0M0BjbGllbnRzIiwiYXVkIjoiaHR0cDovL2xvY2FsaG9zdDozMDAwL3BpbmciLCJpYXQiOjE1NzAyMjA4NDEsImV4cCI6MTU3MDMwNzI0MSwiYXpwIjoiRVRyakh6RmNFaEVrd2U2b0h5WThpVFg2SlNzMVZwNDMiLCJzY29wZSI6ImdyZWV0IiwiZ3R5IjoiY2xpZW50LWNyZWRlbnRpYWxzIn0.h8yrNQSU5FqdzTjFYawV_nUBv43hHeSghCJOdupfHR5lM_kvGq5MnEfsX6-oGcUy3c0d8YD5lW8aBVcuSsM34Qtt-hbhqkWMqaicM4TldfiOWoEnu_lYIF4z6ybUqxxUWX0VE0DDl6sfPtmKqftm2u30ndHCxOb_2nEg_mon9Wmp8kRIpWIKAVLrQ8wObdCwnjIinK5h2HlWe0z53hPBKpaBeLW1y3uWbWAJ2UUOuEfK2Bn3KQ9TpO-mwnuvU7R0Z2IkYrf567wR3Xe3lDKY2lKeUFuXiDhlWpPcU_3vBJfsCs61BQoe4h5MZV0tQmdUJxdsqg4KYmpf_RKGd2djWw',
  expires_in: 86400,
  token_type: 'Bearer'
}
{"iss":"https://apitoday.auth0.com/","sub":"ETrjHzFcEhEkwe6oHyY8iTX6JSs1Vp43@clients","aud":"http://localhost:3000/ping","iat":1570220841,"exp":1570307241,"azp":"ETrjHzFcEhEkwe6oHyY8iTX6JSs1Vp43","scope":"greet","gty":"client-credentials"}

```
