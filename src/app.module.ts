import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { SequelizeModule } from '@nestjs/sequelize';
import * as fs from 'fs';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from './users/users.module';
import { RoleModule } from './role/role.module';
import { TitlesModule } from './titles/titles.module';
import { PhonesModule } from './phones/phones.module';
import { DepartmentsModule } from './departments/departments.module';
import { AssetsModule } from './assets/assets.module';
import { AssetTrackingModule } from './asset-tracking/asset-tracking.module';
import databaseModels from './shared/database/databaseModel';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const dbHost = configService.get('DB_HOST') || '';
        const isCloudSqlSocket = dbHost.startsWith('/cloudsql/');
        const isProduction = configService.get('NODE_ENV') === 'production';
        
        // For Cloud SQL Unix socket connections, SSL is not needed
        // For TCP connections in production, SSL is required
        const needsSSL = isProduction && !isCloudSqlSocket;
        
        // Production password from package.json deploy script
        const productionPassword = '$parkflaresR00t';
        const dbPassword = configService.get('DB_PASSWORD') || (isProduction ? productionPassword : undefined);
        
        if (dbPassword === undefined || dbPassword === null) {
          throw new Error('DB_PASSWORD environment variable is not set');
        }
        
        return {
          dialect: 'postgres',
          host: dbHost,
          port: configService.get('DB_PORT') || 5432,
          username: 'postgres',
          password: String(dbPassword),
          database: configService.get('DB_DATABASE'),
          schema: configService.get('DB_SCHEMA'),
          dialectOptions: {
            ...(needsSSL
              ? {
                  ssl: {
                    require: true,
                    rejectUnauthorized: false,
                    ca: configService.get<string>('DB_SSL_CA')
                      ? fs
                          .readFileSync(configService.get<string>('DB_SSL_CA')!)
                          .toString()
                      : undefined,
                  },
                }
              : {}),
          },
          models: databaseModels(),
          force: false,
          pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
          },
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    RoleModule,
    TitlesModule,
    PhonesModule,
    DepartmentsModule,
    AssetsModule,
    AssetTrackingModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerModule,
    },
  ],
})
export class AppModule {}
