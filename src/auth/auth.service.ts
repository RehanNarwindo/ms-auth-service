import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { hashPass, comparePass } from './helpers/bcrypt.helper';
import { LoginDto } from "./dto/login.dto";
import { generateAccessToken } from "./helpers/jwt.helper";

@Injectable()
export class AuthService {
  // In-memory storage for development
  private users = new Map<string, any>();
  private refreshTokens = new Map<string, string>();

  constructor() {
    // Add a test user for development
    this.users.set('test@example.com', {
      id: '1',
      email: 'test@example.com',
      password: '$2b$10$YourHashedPasswordHere', // password: password123
      firstName: 'Test',
      lastName: 'User',
      createdAt: new Date()
    });
  }

  async register(registerDto: RegisterDto) {
    // Check if user exists
    if (this.users.has(registerDto.email)) {
      throw new ConflictException('Email already registered');
    }

    // Here you would hash the password
    const hashedPassword = await hashPass(registerDto.password);

    const user = {
      id: Date.now().toString(),
      ...registerDto,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.users.set(registerDto.email, user);

    // Generate tokens
    const tokens = generateAccessToken({
          sub: user.id,
          email: user.email,
        });


    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      tokens
    };
  }

  async login(loginDto: LoginDto) {
    const user = this.users.get(loginDto.email);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Here you would verify the password
    const isValidPassword = await comparePass(loginDto.password, user.password);
    
    if (!isValidPassword) {
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
        lastName: user.lastName
      },
      tokens
    };
  }

  async refreshToken(refreshToken: string) {
    // Verify refresh token
    const userId = this.refreshTokens.get(refreshToken);
    
    if (!userId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Find user
    const user = Array.from(this.users.values()).find(u => u.id === userId);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate new access token
      const tokens = generateAccessToken({
      sub: user.id,
      email: user.email,
    });

    return { tokens };
  }

  async logout(refreshToken: string) {
    this.refreshTokens.delete(refreshToken);
    return true;
  }

  // For testing
  getUsers() {
    return Array.from(this.users.values());
  }
}