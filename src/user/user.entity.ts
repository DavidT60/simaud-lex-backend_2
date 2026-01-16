import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Person } from '../person/person.entity';
import { UserConfig } from './user-config.entity';

export enum UserRole {
  ADMIN = 'Admin',
  PROFESOR = 'Profesor',
  ESTUDIANTE = 'Estudiante',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column()
  password: string; // hashed

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.ESTUDIANTE,
  })
  role: UserRole;

  @OneToOne(() => Person, (person) => person.user)
  person: Person;

  @OneToOne(() => UserConfig, (config) => config.user, { cascade: true })
  config: UserConfig;
}
