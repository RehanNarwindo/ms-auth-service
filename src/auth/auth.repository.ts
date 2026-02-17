import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { User } from './interfaces/user.interface';

@Injectable()
export class AuthRepository {
  constructor(@Inject('PG_POOL') private readonly db: Pool) {}

  async createUser(user: User) {
    const query = `
      INSERT INTO users (email, password, first_name, last_name)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [user.email, user.password, user.firstName, user.lastName];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }
  async findByEmail(email: string) {
    const query = `SELECT * FROM users WHERE email = $1`;
    const result = await this.db.query(query, [email]);
    return result.rows[0];
  }

  async findById(id: string) {
    const query = `SELECT * FROM users WHERE id = $1`;
    const result = await this.db.query(query, [id]);
    return result.rows[0];
  }

  async saveRefreshToken(token: string, userId: string) {
    const query = `
      INSERT INTO refresh_tokens (token, user_id, expires_at)
      VALUES ($1, $2, NOW() + INTERVAL '7 days')
    `;

    await this.db.query(query, [token, userId]);
  }

  async findRefreshToken(token: string) {
    const query = `
      SELECT * FROM refresh_tokens
      WHERE token = $1
      AND expires_at > NOW()
    `;

    const result = await this.db.query(query, [token]);
    return result.rows[0];
  }

  async deleteRefreshToken(token: string) {
    const query = `DELETE FROM refresh_tokens WHERE token = $1`;
    await this.db.query(query, [token]);
  }
}
