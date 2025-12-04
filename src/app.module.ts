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

@Module({
  imports: [
      TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1234',
      database: 'my_db_uni',
      autoLoadEntities: true,
      synchronize: true, // only for dev
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

