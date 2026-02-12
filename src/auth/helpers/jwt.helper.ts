import * as jwt from 'jsonwebtoken';

export function generateAccessToken(payload: any) {
  return jwt.sign(payload, 'Example', {
    expiresIn: '15m',
  });
}

export function verifyAccessToken(token: string): any {
  try {
    return jwt.verify(token, 'Example');
  } catch {
    return null;
  }
}
