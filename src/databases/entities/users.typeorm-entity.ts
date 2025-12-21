import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { BaseTypeormEntity } from '@db/library/base.typeorm-entity';

@Entity()
export class UsersTypeormEntity extends BaseTypeormEntity {
  readonly sortable: (keyof this)[] = ['name', 'email', 'createdAt'];

  @PrimaryColumn()
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Index({ nullFiltered: true })
  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
