import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Asset } from '../src/assets/entities/asset.entity';
import { Role } from '../src/role/entities/role.entity';
import { User } from '../src/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Op } from 'sequelize';
import * as crypto from 'crypto';

describe('AssetsController (e2e)', () => {
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
    await Asset.destroy({ where: { label: { [Op.like]: 'TEST%' } }, force: true });
    await app.close();
  });

  describe('/assets (POST)', () => {
    it('should create a new asset', () => {
      const createAssetDto = {
        label: `TEST-${Date.now()}`,
        type: 'Laptop',
        model: 'Test Model',
        serial_number: `SN${Date.now()}`,
        status: 'Active',
      };

      return request(app.getHttpServer())
        .post('/assets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createAssetDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('data');
        });
    });
  });

  describe('/assets (GET)', () => {
    it('should get all assets', () => {
      return request(app.getHttpServer())
        .get('/assets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data.items)).toBe(true);
        });
    });
  });

  describe('/assets/:id (GET)', () => {
    it('should get an asset by id', async () => {
      const asset = await Asset.findOne();
      if (asset) {
        return request(app.getHttpServer())
          .get(`/assets/${asset.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('data');
          });
      }
    });
  });

  describe('/assets/:id (PATCH)', () => {
    it('should update an asset', async () => {
      const asset = await Asset.create({
        label: `TEST-UPDATE-${Date.now()}`,
        type: 'Laptop',
        status: 'Active',
      } as any);

      return request(app.getHttpServer())
        .patch(`/assets/${asset.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'Inactive' })
        .expect(200);
    });
  });

  describe('/assets/:id (DELETE)', () => {
    it('should soft delete an asset', async () => {
      const asset = await Asset.create({
        label: `TEST-DELETE-${Date.now()}`,
        type: 'Laptop',
        status: 'Active',
      } as any);

      return request(app.getHttpServer())
        .delete(`/assets/${asset.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});

