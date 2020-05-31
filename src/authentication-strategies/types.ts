import {BindingKey} from '@loopback/context';
import jwt from 'express-jwt';
import {
  AuthenticationStrategy,
  AuthenticationBindings,
} from '@loopback/authentication';

export interface Auth0Config {
  jwksUri: string; // 'https://apitoday.auth0.com/.well-known/jwks.json',
  audience: string; // 'http://localhost:3000/ping',
  issuer: string; // 'https://apitoday.auth0.com/';
  algorithms: string[]; // ['RS256'],
}

export const JWT_SERVICE = BindingKey.create<jwt.RequestHandler>(
  'services.JWTService',
);

export const KEY = BindingKey.create<AuthenticationStrategy>(
  `${AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME}.JWTAuthenticationStrategy`,
);
