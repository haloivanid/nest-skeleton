import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { BaseTypeormEntity } from '@db/base';
import { UserEmailEmbed } from '@db/embed/user-email.embed';

@Entity()
export class UsersTypeormEntity extends BaseTypeormEntity {
  readonly sortable: (keyof this)[] = ['name', 'createdAt'];

  @PrimaryColumn()
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'jsonb', nullable: false })
  email: UserEmailEmbed;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Index({ nullFiltered: true })
  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
