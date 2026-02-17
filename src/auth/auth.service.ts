import {
  Inject,
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { RegisterDto } from './dto/register.dto';
import { hashPass, comparePass } from './helpers/bcrypt.helper';
import { LoginDto } from './dto/login.dto';
import { generateAccessToken } from './helpers/jwt.helper';
import { User } from './interfaces/user.interface';

@Injectable()
@Injectable()
export class AuthService {
  constructor(
    @Inject('PG_POOL')
    private readonly db: Pool,
  ) {}

  async register(registerDto: RegisterDto) {
    const existing = await this.db.query(
      `SELECT id FROM users WHERE email = $1`,
      [registerDto.email],
    );

    if (existing.rowCount) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await hashPass(registerDto.password);

    const result = await this.db.query(
      `
      INSERT INTO users (email, password, first_name, last_name)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, first_name, last_name
      `,
      [
        registerDto.email,
        hashedPassword,
        registerDto.firstName,
        registerDto.lastName,
      ],
    );

    const user: User = result.rows[0];

    const tokens = generateAccessToken({
      sub: user.id,
      email: user.email,
    });

    return { user, tokens };
  }

  async login(loginDto: LoginDto) {
    const result = await this.db.query(`SELECT * FROM users WHERE email = $1`, [
      loginDto.email,
    ]);

    const user: User = result.rows[0];

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await comparePass(loginDto.password, user.password);

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = generateAccessToken({
      sub: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      tokens,
    };
  }

  async me(userId: string) {
    const res = await this.db.query(
      `SELECT id, email, first_name, last_name FROM users WHERE id = $1`,
      [userId],
    );

    return res.rows[0];
  }
}
