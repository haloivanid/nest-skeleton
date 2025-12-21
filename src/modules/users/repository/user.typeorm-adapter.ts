import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersTypeormEntity } from '@db/entities/users.typeorm-entity';
import { Repository } from 'typeorm';
import { UserRepository } from '@module/users/repository/user.repository';

@Injectable()
export class UserTypeormAdapter extends UserRepository {
  constructor(@InjectRepository(UsersTypeormEntity) private readonly repo: Repository<UsersTypeormEntity>) {
    super(UsersTypeormEntity, repo.manager, repo.queryRunner);
  }
}
