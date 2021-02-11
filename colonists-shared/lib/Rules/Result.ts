import { World } from '../World';

export class Failure {
  public reason: string;
  constructor(reason: string) {
    this.reason = reason;
  }
  public flatMap(_: (t: World) => Result): Result {
    return this;
  }
  public async flatMapAsync(_: (t: World) => Promise<Result>): Promise<Result> {
    return this;
  }
  public onFailure(f: (reason: string) => void) {
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
    return await f(this.value);
  }
  public onFailure(_: (reason: string) => void) {
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
