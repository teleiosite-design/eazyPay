import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_SECRET || 'EAZYPAY_SUPER_SECRET_KEY_BABCOCK_2026',
    });
  }

  async validate(payload: any) {
    // Inject this payload object directly into Request.user
    return { id: payload.sub, phone: payload.phone, name: payload.name };
  }
}
