import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AssetTracking } from '../src/asset-tracking/entities/asset-tracking.entity';
import { Asset } from '../src/assets/entities/asset.entity';
import { Role } from '../src/role/entities/role.entity';
import { User } from '../src/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Op } from 'sequelize';
import * as crypto from 'crypto';

describe('AssetTrackingController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let adminRole: Role;
  let testUser: User;
  let testAsset: Asset;
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

    testAsset = await Asset.create({
      label: `TEST-ASSET-${Date.now()}`,
      type: 'Laptop',
      status: 'Active',
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
    await AssetTracking.destroy({ where: { user_id: testUser.id }, force: true });
    await Asset.destroy({ where: { label: { [Op.like]: 'TEST%' } }, force: true });
    await app.close();
  });

  describe('/asset-tracking (POST)', () => {
    it('should create a new asset tracking record', () => {
      const createDto = {
        asset_id: testAsset.id,
        user_id: testUser.id,
        assigned_at: new Date().toISOString(),
      };

      return request(app.getHttpServer())
        .post('/asset-tracking')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('data');
        });
    });
  });

  describe('/asset-tracking (GET)', () => {
    it('should get all asset tracking records', () => {
      return request(app.getHttpServer())
        .get('/asset-tracking')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data.items)).toBe(true);
        });
    });
  });

  describe('/asset-tracking/:id (GET)', () => {
    it('should get an asset tracking record by id', async () => {
      const tracking = await AssetTracking.create({
        asset_id: testAsset.id,
        user_id: testUser.id,
        assigned_at: new Date(),
      } as any);

      return request(app.getHttpServer())
        .get(`/asset-tracking/${tracking.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
        });
    });
  });

  describe('/asset-tracking/:id (PATCH)', () => {
    it('should update an asset tracking record', async () => {
      const tracking = await AssetTracking.create({
        asset_id: testAsset.id,
        user_id: testUser.id,
        assigned_at: new Date(),
      } as any);

      return request(app.getHttpServer())
        .patch(`/asset-tracking/${tracking.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ removed_at: new Date().toISOString() })
        .expect(200);
    });
  });

  describe('/asset-tracking/:id (DELETE)', () => {
    it('should soft delete an asset tracking record', async () => {
      const tracking = await AssetTracking.create({
        asset_id: testAsset.id,
        user_id: testUser.id,
        assigned_at: new Date(),
      } as any);

      return request(app.getHttpServer())
        .delete(`/asset-tracking/${tracking.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});

