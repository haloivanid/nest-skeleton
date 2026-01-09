import { Column } from 'typeorm';

export class EmailEmbed {
  @Column({ nullable: false, type: 'varchar', length: 255 })
  mask: string;

  @Column({ nullable: false, type: 'bytea' })
  lookup: Buffer;

  @Column({ nullable: false, type: 'bytea' })
  blob: Buffer;
}
