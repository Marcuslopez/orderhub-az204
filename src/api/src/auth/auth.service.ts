import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(email: string, password: string) {
    const demoUser = {
      id: 1,
      email: 'admin@orderhub.com',
      passwordHash: await bcrypt.hash('Admin123*', 10),
      role: 'admin',
    };

    if (email !== demoUser.email) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordOk = await bcrypt.compare(password, demoUser.passwordHash);

    if (!passwordOk) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: demoUser.id,
      email: demoUser.email,
      role: demoUser.role,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: demoUser.id,
        email: demoUser.email,
        role: demoUser.role,
      },
    };
  }
}