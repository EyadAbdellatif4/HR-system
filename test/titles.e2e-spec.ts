import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Title } from '../src/titles/entities/title.entity';
import { Role } from '../src/role/entities/role.entity';
import { User } from '../src/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Op } from 'sequelize';
import * as crypto from 'crypto';

describe('TitlesController (e2e)', () => {
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
    await Title.destroy({ where: { name: { [Op.like]: 'Test%' } }, force: true });
    await app.close();
  });

  describe('/titles (POST)', () => {
    it('should create a new title', () => {
      const createTitleDto = {
        name: `Test Title ${Date.now()}`,
        is_active: true,
      };

      return request(app.getHttpServer())
        .post('/titles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createTitleDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('data');
        });
    });
  });

  describe('/titles (GET)', () => {
    it('should get all titles', () => {
      return request(app.getHttpServer())
        .get('/titles')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data.items)).toBe(true);
        });
    });
  });

  describe('/titles/:id (GET)', () => {
    it('should get a title by id', async () => {
      const title = await Title.findOne();
      if (title) {
        return request(app.getHttpServer())
          .get(`/titles/${title.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('data');
          });
      }
    });
  });

  describe('/titles/:id (PATCH)', () => {
    it('should update a title', async () => {
      const title = await Title.create({
        name: `Test Update ${Date.now()}`,
        is_active: true,
      } as any);

      return request(app.getHttpServer())
        .patch(`/titles/${title.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Title' })
        .expect(200);
    });
  });

  describe('/titles/:id (DELETE)', () => {
    it('should soft delete a title', async () => {
      const title = await Title.create({
        name: `Test Delete ${Date.now()}`,
        is_active: true,
      } as any);

      return request(app.getHttpServer())
        .delete(`/titles/${title.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});

