import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {get, Request, ResponseObject, RestBindings} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';

/**
 * OpenAPI response for ping()
 */
const PING_RESPONSE: ResponseObject = {
  description: 'Ping Response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          greeting: {type: 'string'},
          date: {type: 'string'},
          url: {type: 'string'},
          headers: {
            type: 'object',
            properties: {
              'Content-Type': {type: 'string'},
            },
            additionalProperties: true,
          },
        },
      },
    },
  },
};

export const UserProfileSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: {type: 'string'},
    email: {type: 'string'},
    name: {type: 'string'},
  },
};

/**
 * A simple controller to bounce back http requests
 */
export class PingController {
  constructor(@inject(RestBindings.Http.REQUEST) private req: Request) {}

  // Map to `GET /ping`
  @get('/ping', {
    responses: {
      '200': PING_RESPONSE,
    },
  })
  ping(): object {
    // Reply with a greeting, the current time, the url, and request headers
    return {
      greeting: 'Hello from LoopBack',
      date: new Date(),
      url: this.req.url,
      headers: Object.assign({}, this.req.headers),
    };
  }

  @get('/greet', {
    responses: {
      '200': {
        description: 'Greet the logged in user',
        content: {
          'application/json': {
            schema: UserProfileSchema,
          },
        },
      },
    },
  })
  @authenticate({strategy: 'auth0-jwt', options: {scopes: ['greet']}})
  async greet(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<Partial<UserProfile>> {
    // (@jannyHou)FIXME: explore a way to generate OpenAPI schema
    // for symbol property
    currentUserProfile.id = currentUserProfile[securityId];
    const user: Partial<UserProfile> = {...currentUserProfile};
    delete user[securityId];
    return user;
  }
}
