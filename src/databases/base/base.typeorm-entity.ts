import { BaseEntity } from 'typeorm';

export abstract class BaseTypeormEntity extends BaseEntity {
  abstract sortable: any[];
}
