import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Department } from '../src/departments/entities/department.entity';
import { Role } from '../src/role/entities/role.entity';
import { User } from '../src/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Op } from 'sequelize';
import * as crypto from 'crypto';

describe('DepartmentsController (e2e)', () => {
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

    const testUsername = `test${Date.now()}@example.com`;
    const testUserNumber = `TEST${Date.now()}`;
    testUser = await User.create({
      user_number: testUserNumber,
      username: testUsername,
      password: crypto.createHash('sha256').update('testpassword').digest('hex'),
      name: 'Test User',
      address: 'Test Address',
      work_location: 'hybrid',
      social_insurance: true,
      medical_insurance: true,
      join_date: new Date('2025-01-01'),
      role_id: adminRole.id,
    } as any);

    const payload = {
      sub: testUser.id,
      user_number: testUser.user_number,
      name: testUser.name,
      role_id: testUser.role_id,
    };
    authToken = jwtService.sign(payload, { secret: configService.get('JWT_SECRET') || 'test-secret' });
  });

  afterAll(async () => {
    if (testUser) {
      await User.destroy({ where: { id: testUser.id }, force: true });
    }
    await Department.destroy({ where: { name: { [Op.like]: 'Test%' } }, force: true });
    await app.close();
  });

  describe('/departments (POST)', () => {
    it('should create a new department', () => {
      const createDepartmentDto = {
        name: `Test Department ${Date.now()}`,
        is_active: true,
      };

      return request(app.getHttpServer())
        .post('/departments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDepartmentDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('data');
        });
    });
  });

  describe('/departments (GET)', () => {
    it('should get all departments', () => {
      return request(app.getHttpServer())
        .get('/departments')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data.items)).toBe(true);
        });
    });
  });

  describe('/departments/:id (GET)', () => {
    it('should get a department by id', async () => {
      const department = await Department.findOne();
      if (department) {
        return request(app.getHttpServer())
          .get(`/departments/${department.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('data');
          });
      }
    });
  });

  describe('/departments/:id (PATCH)', () => {
    it('should update a department', async () => {
      const department = await Department.create({
        name: `Test Update ${Date.now()}`,
        is_active: true,
      } as any);

      return request(app.getHttpServer())
        .patch(`/departments/${department.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Department' })
        .expect(200);
    });
  });

  describe('/departments/:id (DELETE)', () => {
    it('should soft delete a department', async () => {
      const department = await Department.create({
        name: `Test Delete ${Date.now()}`,
        is_active: true,
      } as any);

      return request(app.getHttpServer())
        .delete(`/departments/${department.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});

