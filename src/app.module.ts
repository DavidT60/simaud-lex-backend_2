import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { PersonModule } from './person/person.module';
import { NnaModule } from './nna/nna.module';
import { ProcesoJudicialModule } from './proceso-judicial/proceso-judicial.module';
import { CommonModule } from './common/common.module';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config'

@Module({
  imports: [
      ConfigModule.forRoot({
        isGlobal:true
      }),
      TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: (config: ConfigService) => ({
          type: "postgres",
          url: config.get<string>("DATABASE_URL"),
          autoLoadEntities: true,
          synchronize: true,
        }),
        inject: [ConfigService],
      }),
    UserModule,
    AuthModule,
    PersonModule,
    NnaModule,
    ProcesoJudicialModule,
    CommonModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

