import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SecretsService } from '../secrets/secrets.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly secretsService: SecretsService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: async (_request, _rawJwtToken, done) => {
        try {
          const secret = await secretsService.getSecret(
            'jwt-secret',
            'JWT_SECRET',
          );
          done(null, secret);
        } 
          catch (error) {
          done(error as Error, undefined);
        }
      },
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}