import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import * as crypto from 'crypto';
import { User } from '../../src/users/entities/user.entity';
import { Role } from '../../src/role/entities/role.entity';
import { Op } from 'sequelize';

export class TestHelper {
  /**
   * Get authentication token for testing
   * This creates a mock JWT token for testing purposes
   */
  static async getAuthToken(app: INestApplication, roleName: string = 'admin'): Promise<string> {
    // Get admin role
    const role = await Role.findOne({ where: { name: roleName } });
    if (!role) {
      throw new Error(`Role ${roleName} not found. Please run seeds first.`);
    }

    // Get or create a test user
    let user = await User.findOne({ 
      where: { username: 'eyad@gmail.com' },
      include: [{ model: Role, as: 'role' }]
    });

    if (!user) {
      // Create a test user if it doesn't exist
      user = await User.create({
        user_number: 'TEST001',
        username: 'test@example.com',
        password: crypto.createHash('sha256').update('testpassword').digest('hex'),
        name: 'Test User',
        address: 'Test Address',
        work_location: 'hybrid',
        social_insurance: true,
        medical_insurance: true,
        join_date: new Date('2025-01-01'),
        role_id: role.id,
      } as any);
    }

    // Create a mock JWT token
    const jwtService = app.get('JwtService') || {
      sign: (payload: any) => {
        // Simple mock token for testing
        return Buffer.from(JSON.stringify(payload)).toString('base64');
      }
    };

    const payload = {
      sub: user.id,
      user_number: user.user_number,
      name: user.name,
      role_id: user.role_id,
    };

    // Try to use actual JWT service if available
    try {
      const { JwtService } = await import('@nestjs/jwt');
      const jwt = app.get(JwtService);
      return jwt.sign(payload);
    } catch (error) {
      // Fallback to mock token
      return Buffer.from(JSON.stringify(payload)).toString('base64');
    }
  }

  /**
   * Create a test user and return it
   */
  static async createTestUser(roleName: string = 'admin'): Promise<User> {
    const role = await Role.findOne({ where: { name: roleName } });
    if (!role) {
      throw new Error(`Role ${roleName} not found.`);
    }

    const userNumber = `TEST${Date.now()}`;
    return await User.create({
      user_number: userNumber,
      username: `test${Date.now()}@example.com`,
      password: crypto.createHash('sha256').update('testpassword').digest('hex'),
      name: 'Test User',
      address: 'Test Address',
      work_location: 'hybrid',
      social_insurance: true,
      medical_insurance: true,
      join_date: new Date('2025-01-01'),
      role_id: role.id,
    } as any);
  }

  /**
   * Clean up test data
   */
  static async cleanupTestData() {
    await User.destroy({ where: { user_number: { [Op.like]: 'TEST%' } }, force: true });
  }
}

