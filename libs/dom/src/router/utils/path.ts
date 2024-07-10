export type Path = `/${string}`;

type PathParam<Path, NextPart> = Path extends `:${infer Param}`
  ? Record<Param, string> & NextPart
  : NextPart;

export type PathParams<P> = P extends `${infer Segment}/${infer Rest}`
  ? PathParam<Segment, PathParams<Rest>>
  : PathParam<P, {}>;

export function matchPath(path: Path, match: string) {
  const _path = path.split("/").filter(Boolean);
  const _match = match.split("/").filter(Boolean);

  if (_path.length !== _match.length) return false;

  const params: Record<string, string> = {};

  for (const [index, segment] of Object.entries(_path)) {
    const value = _match[+index];

    if (segment.startsWith(":") && typeof value !== "undefined") {
      const key = segment.substring(1);
      params[key] = value;
      continue;
    }

    if (value !== segment) return false;
  }

  return params;
}
