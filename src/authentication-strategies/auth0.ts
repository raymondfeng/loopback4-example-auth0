import {inject} from '@loopback/context';
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

export class JWTAuthenticationStrategy implements AuthenticationStrategy {
  name = 'auth0-jwt';

  constructor(
    @inject(RestBindings.Http.RESPONSE)
    private response: Response,
    @inject(AuthenticationBindings.METADATA)
    private metadata: AuthenticationMetadata,
  ) {}

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    const jwtCheck = jwt({
      secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: 'https://apitoday.auth0.com/.well-known/jwks.json',
      }),
      audience: 'http://localhost:3000/ping',
      issuer: 'https://apitoday.auth0.com/',
      algorithms: ['RS256'],
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
