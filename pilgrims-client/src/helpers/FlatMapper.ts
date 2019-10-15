import {
    World,
    Result,
    Success,
    Failure
  } from '../../../pilgrims-shared/dist/Shared';

export const flatMap = (r: Result, f: (t: World) => Result): Result => {
    if (r as Success) {
        return f((r as Success).value);
    } else return r
}

export const onFailure = (r: Result, f: (reason: string) => void): void => {
    if (r as Failure) f((r as Failure).reason);
}