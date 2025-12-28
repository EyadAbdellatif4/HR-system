import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { User } from '../src/users/entities/user.entity';
import { Role } from '../src/role/entities/role.entity';
import { Title } from '../src/titles/entities/title.entity';
import { Phone } from '../src/phones/entities/phone.entity';
import { Department } from '../src/departments/entities/department.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Op } from 'sequelize';
import * as crypto from 'crypto';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let adminRole: Role;
  let testUser: User;
  let testTitle: Title;
  let testDepartment: Department;
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

    // Get or create admin role
    let foundRole = await Role.findOne({ where: { name: 'admin' } });
    if (!foundRole) {
      foundRole = await Role.create({
        name: 'admin',
        is_active: true,
      } as any);
    }
    adminRole = foundRole;

    // Get or create test title
    let foundTitle = await Title.findOne({ where: { name: 'Software Engineer' } });
    if (!foundTitle) {
      foundTitle = await Title.create({
        name: 'Software Engineer',
        is_active: true,
      } as any);
    }
    testTitle = foundTitle;

    // Get or create test department
    let foundDepartment = await Department.findOne({ where: { name: 'Engineering' } });
    if (!foundDepartment) {
      foundDepartment = await Department.create({
        name: 'Engineering',
        is_active: true,
      } as any);
    }
    testDepartment = foundDepartment;

    // Create test user for authentication
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

    // Generate auth token
    const payload = {
      sub: testUser.id,
      user_number: testUser.user_number,
      name: testUser.name,
      role_id: testUser.role_id,
    };
    authToken = jwtService.sign(payload, { secret: configService.get('JWT_SECRET') || 'test-secret' });
  });

  afterAll(async () => {
    // Clean up test data
    await User.destroy({ where: { user_number: { [Op.like]: 'TEST%' } }, force: true });
    await app.close();
  });

  describe('/users (POST)', () => {
    it('should create a new user', () => {
      const createUserDto = {
        user_number: `TEST${Date.now()}`,
        name: 'John Doe',
        address: '123 Main St',
        work_location: 'hybrid',
        social_insurance: true,
        medical_insurance: true,
        join_date: '2025-01-01',
        role_id: adminRole.id,
        title_id: testTitle.id,
        departments: [testDepartment.id],
        phones: [
          {
            number: '+1234567890',
            company: 'Verizon',
            is_active: true,
          },
        ],
      };

      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createUserDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.name).toBe('John Doe');
        });
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ user_number: 'TEST001', name: 'Test' })
        .expect(401);
    });
  });

  describe('/users (GET)', () => {
    it('should get all users', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data.items)).toBe(true);
        });
    });

    it('should filter users by name', () => {
      return request(app.getHttpServer())
        .get('/users')
        .query({ name: 'Test' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should paginate users', () => {
      return request(app.getHttpServer())
        .get('/users')
        .query({ page: 1, limit: 10 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('items');
          expect(res.body.data).toHaveProperty('meta');
        });
    });
  });

  describe('/users/:id (GET)', () => {
    it('should get a user by id', async () => {
      const user = await User.findOne({ where: { user_number: testUser.user_number } });
      if (!user) {
        throw new Error('Test user not found');
      }
      
      return request(app.getHttpServer())
        .get(`/users/${user.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body.data.id).toBe(user.id);
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/users/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/users/:id (PATCH)', () => {
    it('should update a user', async () => {
      const user = await User.findOne({ where: { user_number: testUser.user_number } });
      if (!user) {
        throw new Error('Test user not found');
      }
      const updateDto = {
        name: 'Updated Name',
      };

      return request(app.getHttpServer())
        .patch(`/users/${user.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body.data.name).toBe('Updated Name');
        });
    });
  });

  describe('/users/:id (DELETE)', () => {
    it('should soft delete a user', async () => {
      const newUser = await User.create({
        user_number: `TEST${Date.now()}`,
        name: 'Delete Test User',
        address: 'Test Address',
        work_location: 'hybrid',
        social_insurance: true,
        medical_insurance: true,
        join_date: new Date('2025-01-01'),
        role_id: adminRole.id,
      } as any);

      return request(app.getHttpServer())
        .delete(`/users/${newUser.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });
  });
});

