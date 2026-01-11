import { DomainMapperBase, Entity } from '@libs/core/domain';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EntityManager, EntityTarget, Repository } from 'typeorm';
import { BaseTypeormEntity } from './base.typeorm-entity';

export abstract class BaseTypeOrmPort<
  Domain extends Entity<any, any>,
  OrmEntity extends BaseTypeormEntity,
  Mapper extends DomainMapperBase<Domain, OrmEntity>,
> extends Repository<OrmEntity> {
  constructor(
    repo: EntityTarget<OrmEntity>,
    manager: EntityManager,
    readonly mapper: Mapper,
    readonly eventEmitter: EventEmitter2,
  ) {
    super(repo, manager);
  }

  async writeDomainToRepository(domain: Domain): Promise<OrmEntity> {
    const entity: OrmEntity = this.mapper.fromDomainToRepository(domain);
    const savedEntity = await this.save(entity);

    void domain.publishEvents(this.eventEmitter);

    return savedEntity;
  }

  async writeDomainsToRepository(domains: Domain[]): Promise<OrmEntity[]> {
    const entities: OrmEntity[] = domains.map((d) => this.mapper.fromDomainToRepository(d));
    const savedEntities = await this.save(entities);

    void Promise.all(domains.map((d) => d.publishEvents(this.eventEmitter)));

    return savedEntities;
  }
}
