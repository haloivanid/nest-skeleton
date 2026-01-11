import { DomainEvent, DomainEventFields } from '@libs/core/domain';

export class UserRegisteredDomainEvent extends DomainEvent {
  readonly email: string;
  readonly name: string;

  constructor(props: DomainEventFields<UserRegisteredDomainEvent>) {
    super(props);

    this.email = props.email;
    this.name = props.name;
  }
}
