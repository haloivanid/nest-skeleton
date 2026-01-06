export class JwtPayloadDto {
  constructor(private readonly id: string) {}

  toObject() {
    return Object.freeze({ id: this.id });
  }
}
