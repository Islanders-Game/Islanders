export interface Failure {
  tag: 'Failure';
  reason: string;
}
export interface Success<T> {
  tag: 'Success';
  value: T;
}
export type Result<T> = Success<T> | Failure;

export function fail(reason: string): Failure {
  return { tag: 'Failure', reason };
}
export function success<T>(t: T): Success<T> {
  return { tag: 'Success', value: t };
}
