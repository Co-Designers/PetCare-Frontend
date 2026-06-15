export class SignInCommand {
  constructor(
    public readonly username: string,
    public readonly password: string,
  ) {}
}
