import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly users = [
    {
      id: 1,
      username: 'admin',
      password: '$2b$10$Me.euhsivr0AEYX9mmcufe3/r8sRqHGFaEo3uGjYJsqmQ5cCydu7W',
      role: 'admin',
    },
    {
      id: 2,
      username: 'operator',
      password: '$2b$10$ZmxieYgv9V1QqSWV4bSYX.zfP1cgCQ3jMrbYC0lFTpnkXb12y.6gu',
      role: 'operator',
    },
    {
      id: 3,
      username: 'viewer',
      password: '$2b$10$cxjsK7A.HcPglLawB5lPpuUps0uKCVQQ6eWXTWRhqH41v.EK9hrUm',
      role: 'viewer',
    },
  ];

  constructor(private jwtService: JwtService) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = this.users.find((u) => u.username === username);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}

