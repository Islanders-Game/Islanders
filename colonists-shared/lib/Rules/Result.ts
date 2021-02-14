import { World } from '../World';

export class Failure {
  public reason: string;

  constructor(reason: string) {
    this.reason = reason;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public flatMap(_: (t: World) => Result): Result {
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async flatMapAsync(_: (t: World) => Promise<Result>): Promise<Result> {
    return this;
  }

  public onFailure(f: (reason: string) => void): void {
    f(this.reason);
  }
}
export class Success {
  public value: World;

  constructor(value: World) {
    this.value = value;
  }

  public flatMap(f: (t: World) => Result): Result {
    return f(this.value);
  }

  public async flatMapAsync(f: (t: World) => Promise<Result>): Promise<Result> {
    return f(this.value);
  }

  // eslint-disable-next-line class-methods-use-this
  public onFailure(_: (reason: string) => void): void {
    // Do nothing
  }
}
export type Result = Success | Failure;

export function fail(reason: string): Failure {
  return new Failure(reason);
}
export function success(t: World): Success {
  return new Success(t);
}

export function toResultInstance(result: any): Result {
  if (result.value) {
    return success(result.value);
  }
  if (result.reason) {
    return fail(result.reason);
  }
  throw TypeError(`${result} is not of Result type`);
}
