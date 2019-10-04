import {inject, config} from '@loopback/context';
import {Response, Request, RestBindings} from '@loopback/rest';
import {
  AuthenticationStrategy,
  AuthenticationBindings,
  AuthenticationMetadata,
} from '@loopback/authentication';
import {UserProfile} from '@loopback/security';

import * as jwt from 'express-jwt';
const jwtAuthz = require('express-jwt-authz');
const jwks = require('jwks-rsa');

export interface Auth0Config {
  jwksUri: string; // 'https://apitoday.auth0.com/.well-known/jwks.json',
  audience: string; // 'http://localhost:3000/ping',
  issuer: string; // 'https://apitoday.auth0.com/';
  algorithms: string[]; // ['RS256'],
}

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
    const auth0Config = this.options || {};
    // Use `express-jwt` to verify the Auth0 JWT token
    const jwtCheck = jwt({
      secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: auth0Config.jwksUri,
      }),
      audience: auth0Config.audience,
      issuer: auth0Config.issuer,
      algorithms: auth0Config.algorithms || ['RS256'],
      // Customize `getToken` to allow `access_token` query string in addition
      // to `Authorization` header
      getToken: req => {
        if (
          req.headers.authorization &&
          req.headers.authorization.split(' ')[0] === 'Bearer'
        ) {
          return req.headers.authorization.split(' ')[1];
        } else if (req.query && req.query.access_token) {
          return req.query.access_token;
        }
        return null;
      },
    });
    return new Promise<UserProfile | undefined>((resolve, reject) => {
      jwtCheck(request, this.response, (err?: Error) => {
        if (err) {
          console.error(err);
          reject(err);
          return;
        }
        // If the `@authenticate` requires `scopes` check
        if (this.metadata.options && this.metadata.options.scopes) {
          jwtAuthz(this.metadata.options!.scopes, {failWithError: true})(
            request,
            this.response,
            (err2?: Error) => {
              if (err2) {
                console.error(err2);
                reject(err2);
                return;
              }
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              resolve((request as any).user);
            },
          );
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          resolve((request as any).user);
        }
      });
    });
  }
}
