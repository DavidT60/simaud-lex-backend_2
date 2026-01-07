import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Person } from 'src/person/person.entity';
import { UserConfig } from './user-config.entity';

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

  @OneToOne(() => Person, (person) => person.user)
  person: Person;

  @OneToOne(() => UserConfig, (config) => config.user, { cascade: true })
  config: UserConfig;
}
