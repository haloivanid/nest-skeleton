import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersTypeormEntity } from '@db/entities/users.typeorm-entity';
import { Repository } from 'typeorm';
import { UserRepository } from '@module/users/repository/user.repository';
import { UserMapper } from '../mapper';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class UserTypeormAdapter extends UserRepository {
  constructor(
    @InjectRepository(UsersTypeormEntity) readonly repo: Repository<UsersTypeormEntity>,
    readonly mapper: UserMapper,
    readonly eventEmitter: EventEmitter2,
  ) {
    super(UsersTypeormEntity, repo.manager, mapper, eventEmitter);
  }

  public async findOneByEmail(email: Buffer): Promise<UsersTypeormEntity | null> {
    return this.repo.createQueryBuilder('t1').where('t1.email_lookup = :email', { email }).getOne();
  }
}
