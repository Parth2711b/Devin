import { Temporal as _Temporal } from 'temporal-polyfill';

declare global {
  const Temporal: typeof _Temporal;
}
