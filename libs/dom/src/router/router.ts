import { context, use } from '@tbh/ioc';
import { state, extend, subscribe, onDestroy } from '@tbh/state';
import type { Component } from '../component.js';
import { Path, PathParams, matchPath } from './utils/path.js';

const CurrentRouter =
  context<Router<Record<Path, (params: {}) => Component>>>();

export type Router<
  Paths extends {
    [K in Path]: (params: PathParams<K>) => Component;
  }
> = ReturnType<typeof router<Paths>>;

export function router<
  Paths extends {
    [K in keyof Paths & Path]: (params: PathParams<K>) => Component;
  }
>(config: { paths: Paths; fallback: (props: {}) => Component }) {
  const { paths, fallback } = config;

  const parentRouter = use(CurrentRouter);
  const toFullPath = (path: Path): Path => {
    return [parentRouter?.value, path].filter(Boolean).join('/') as Path;
  };
  const getPathOrFallback = () => {
    const pathname = window.location.pathname as Path;
    return pathname;
  };

  const path = state<Path>(getPathOrFallback());
  const _paths = Object.entries(paths).map(([k, v]) => {
    return [
      toFullPath(k as Path),
      v as (params: PathParams<typeof k>) => Component,
    ] as const;
  });

  let lastRoute: Path | undefined;
  subscribe(path, (value, old) => {
    lastRoute = old;
    window.history.pushState({}, '', toFullPath(value));
  });

  const handlePopState = () => {
    path.value = getPathOrFallback();
  };
  window.addEventListener('popstate', handlePopState);

  const _router = extend(path, {
    get route() {
      const currentPath = path.value;

      for (const [path, component] of _paths) {
        const match = matchPath(path, currentPath);
        if (match === false) continue;
        return component({ ...match });
      }

      return fallback({});
    },
    back() {
      if (typeof lastRoute !== 'undefined') {
        path.value = lastRoute;
      }
    },
  });

  onDestroy(_router, () => {
    window.removeEventListener('popstate', handlePopState);
  });

  return _router;
}
