import { World } from '../World';

export class Failure {
  public reason: string;
  constructor(reason: string) {
    this.reason = reason;
  }
  flatMap<World>(f: (t: World) => Result): Result {
    return this;
  }
  async flatMapAsync(f: (t: World) => Promise<Result>): Promise<Result> {
    return this;
  }
  onFailure(f: (reason: string) => void) {
    f(this.reason);
  }
}
export class Success {
  public value: World;
  constructor(value: World) {
    this.value = value;
  }
  flatMap(f: (t: World) => Result): Result {
    return f(this.value);
  }
  async flatMapAsync(f: (t: World) => Promise<Result>): Promise<Result> {
    return await f(this.value);
  }
  onFailure(f: (reason: string) => void) { }
}
export type Result = Success | Failure;

export function fail(reason: string): Failure {
  return new Failure(reason);
}
export function success(t: World): Success {
  return new Success(t);
}
