import type { ParseSelector } from 'typed-query-selector/parser.js'

export function query<Selector extends string, Strict extends boolean = false>(
	selector: Selector,
	root: Document | Element = document,
	{
		strict = false as Strict,
	}: {
		strict?: Strict
	} = {},
): Strict extends true
	? ParseSelector<Selector>
	: ParseSelector<Selector> | null {
	const el = root.querySelector(selector)
	if (strict && el === null) {
		throw new Error(`Element ${selector} not found`)
	}
	return el as ParseSelector<Selector>
}

export function queryAll<
	Selector extends string,
	Strict extends boolean = false,
>(
	selector: Selector,
	root: Document | Element = document,
	{
		strict = false as Strict,
	}: {
		strict?: Strict
	} = {},
): NodeListOf<ParseSelector<Selector>> {
	const el = root.querySelectorAll(selector)
	if (strict && el.length === 0) {
		throw new Error(`Element ${selector} not found`)
	}
	return el as NodeListOf<ParseSelector<Selector>>
}
