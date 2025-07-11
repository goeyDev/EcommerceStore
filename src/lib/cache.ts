import { unstable_cache as nextCache } from "next/cache";
import { cache as reactCache } from "react";

// type Callback = (...args: any[]) => Promise<any>;
// export function cache<T extends Callback>(
//   cb: T,
//   keyParts: string[],
//   options: { revalidate?: number | false; tags?: string[] } = {}
// ) {
//   return nextCache(reactCache(cb), keyParts, options);
// }

// type Callback<Args extends any[] = unknown[], Return = unknown> = (
//   ...args: Args
// ) => Promise<Return>;
// export function cache<Args extends any[], Return>(
//   cb: (...args: Args) => Promise<Return>,
//   keyParts: string[],
//   options: { revalidate?: number | false; tags?: string[] } = {}
// ): (...args: Args) => Promise<Return> {
//   return nextCache(reactCache(cb), keyParts, options);
// }

export function cache<Args extends unknown[], Return>(
  cb: (...args: Args) => Promise<Return>,
  keyParts: string[],
  options: { revalidate?: number | false; tags?: string[] } = {}
): (...args: Args) => Promise<Return> {
  return nextCache(reactCache(cb), keyParts, options);
}
