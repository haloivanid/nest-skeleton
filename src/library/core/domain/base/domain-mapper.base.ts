import { ObjectLiteral } from 'typeorm';
import { Entity } from './entity.base';

export abstract class DomainMapperBase<D extends Entity<any, any>, O extends ObjectLiteral> {
  abstract fromDomainToRepository(domain: D): O;
  abstract fromRepositoryToDomain(entity: O): D;
}
