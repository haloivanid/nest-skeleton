import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { BaseTypeormEntity } from '@db/base';
import { EmailEmbed } from '@db/embed/email.embed';

@Entity()
@Index(['email.lookup'], { unique: true })
@Index(['deletedAt'], { where: 'deleted_at IS NOT NULL' })
export class UsersTypeormEntity extends BaseTypeormEntity {
  readonly sortable: (keyof UsersTypeormEntity)[] = ['name', 'createdAt'];

  @PrimaryColumn()
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password: string;

  @Column(() => EmailEmbed, { prefix: 'email_' })
  email: EmailEmbed;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
