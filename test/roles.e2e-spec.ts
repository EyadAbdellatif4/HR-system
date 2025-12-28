import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Role } from '../src/role/entities/role.entity';
import { User } from '../src/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

describe('RoleController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let adminRole: Role;
  let testUser: User;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();

    jwtService = app.get(JwtService);
    const configService = app.get(ConfigService);

    let foundRole = await Role.findOne({ where: { name: 'admin' } });
    if (!foundRole) {
      foundRole = await Role.create({
        name: 'admin',
        is_active: true,
      } as any);
    }
    adminRole = foundRole;

    const existingUser = await User.findOne({ where: { username: 'test@example.com' } });
    if (existingUser) {
      testUser = existingUser;
    } else {
      testUser = await User.create({
        user_number: 'TEST001',
        username: 'test@example.com',
        password: crypto.createHash('sha256').update('testpassword').digest('hex'),
        name: 'Test User',
        address: 'Test Address',
        work_location: 'hybrid',
        social_insurance: true,
        medical_insurance: true,
        join_date: new Date('2025-01-01'),
        role_id: adminRole.id,
      } as any);
    }

    const payload = {
      sub: testUser.id,
      user_number: testUser.user_number,
      name: testUser.name,
      role_id: testUser.role_id,
    };
    authToken = jwtService.sign(payload, { secret: configService.get('JWT_SECRET') || 'test-secret' });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/roles (POST)', () => {
    it('should create a new role', () => {
      const createRoleDto = {
        name: `test_role_${Date.now()}`,
        is_active: true,
      };

      return request(app.getHttpServer())
        .post('/roles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createRoleDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('data');
        });
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/roles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('/roles (GET)', () => {
    it('should get all roles', () => {
      return request(app.getHttpServer())
        .get('/roles')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data.items)).toBe(true);
        });
    });

    it('should filter roles by name', () => {
      return request(app.getHttpServer())
        .get('/roles')
        .query({ name: 'admin' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('/roles/:id (GET)', () => {
    it('should get a role by id', async () => {
      return request(app.getHttpServer())
        .get(`/roles/${adminRole.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body.data.id).toBe(adminRole.id);
        });
    });
  });

  describe('/roles/:id (PATCH)', () => {
    it('should update a role', () => {
      const updateDto = {
        is_active: false,
      };

      return request(app.getHttpServer())
        .patch(`/roles/${adminRole.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200);
    });
  });

  describe('/roles/:id (DELETE)', () => {
    it('should soft delete a role', async () => {
      const newRole = await Role.create({
        name: `test_delete_${Date.now()}`,
        is_active: true,
      } as any);

      return request(app.getHttpServer())
        .delete(`/roles/${newRole.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});

