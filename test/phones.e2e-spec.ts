import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Phone } from '../src/phones/entities/phone.entity';
import { Role } from '../src/role/entities/role.entity';
import { User } from '../src/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Op } from 'sequelize';
import * as crypto from 'crypto';

describe('PhonesController (e2e)', () => {
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
    await Phone.destroy({ where: { number: { [Op.like]: '+TEST%' } }, force: true });
    await app.close();
  });

  describe('/phones (POST)', () => {
    it('should create a new phone', () => {
      const createPhoneDto = {
        number: `+TEST${Date.now()}`,
        company: 'Test Company',
        user_id: testUser.id,
        is_active: true,
      };

      return request(app.getHttpServer())
        .post('/phones')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createPhoneDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('data');
        });
    });
  });

  describe('/phones (GET)', () => {
    it('should get all phones', () => {
      return request(app.getHttpServer())
        .get('/phones')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data.items)).toBe(true);
        });
    });
  });

  describe('/phones/:id (GET)', () => {
    it('should get a phone by id', async () => {
      const phone = await Phone.findOne({ where: { user_id: testUser.id } });
      if (phone) {
        return request(app.getHttpServer())
          .get(`/phones/${phone.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('data');
          });
      }
    });
  });

  describe('/phones/:id (PATCH)', () => {
    it('should update a phone', async () => {
      const phone = await Phone.create({
        number: `+TESTUPDATE${Date.now()}`,
        user_id: testUser.id,
        is_active: true,
      } as any);

      return request(app.getHttpServer())
        .patch(`/phones/${phone.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ company: 'Updated Company' })
        .expect(200);
    });
  });

  describe('/phones/:id (DELETE)', () => {
    it('should soft delete a phone', async () => {
      const phone = await Phone.create({
        number: `+TESTDELETE${Date.now()}`,
        user_id: testUser.id,
        is_active: true,
      } as any);

      return request(app.getHttpServer())
        .delete(`/phones/${phone.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});

