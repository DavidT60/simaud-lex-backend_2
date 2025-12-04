import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './user.entity';
import { PersonModule } from 'src/person/person.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), PersonModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
