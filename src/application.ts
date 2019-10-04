import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import * as path from 'path';
import {MySequence} from './sequence';
import {JWTAuthenticationStrategy} from './authentication-strategies/auth0';
import {
  registerAuthenticationStrategy,
  AuthenticationComponent,
  AuthenticationBindings,
} from '@loopback/authentication';

export class Loopback4ExampleAuth0Application extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Bind authentication component related elements
    this.component(AuthenticationComponent);

    // Register the Auth0 JWT authentication strategy
    registerAuthenticationStrategy(this, JWTAuthenticationStrategy);
    this.configure(
      `${AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME}.JWTAuthenticationStrategy`,
    ).to({
      jwksUri: 'https://apitoday.auth0.com/.well-known/jwks.json',
      audience: 'http://localhost:3000/ping',
      issuer: 'https://apitoday.auth0.com/',
      algorithms: ['RS256'],
    });

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.bind(RestExplorerBindings.CONFIG).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
}
