import { undef } from "./utils";

type IdType = string | number | null | undefined;

export interface PathData {
	id: string;
	pid: IdType;
	text: string;
	[x: string]: any;
}
export interface PathOptions {
	sep?: string;
	rootId?: IdType;
	processor?: (data: PathData) => PathData;
}

/**
 * @example
 * path2data(["A/B/C", "A/B/D", "A/E/C"]);
 */
export function path2data(paths: string[] | string, options: PathOptions = {}) {
	const sep = undef(options.sep, "/");
	const rootId = undef(options.rootId, null);
	const processor = undef(options.processor, null);

	const data: PathData[] = [];
	const map: { [x: string]: boolean } = Object.create(null);

	paths = Array.isArray(paths) ? paths : [paths];

	paths.forEach((path: string) => {
		const pathArray = path.split(sep as string);

		let pid = rootId;

		for (let i = 0; i < pathArray.length; i++) {
			const text = pathArray[i];
			const id = pathArray.slice(0, i + 1).join(sep);

			if (!map[id]) {
				let item: PathData = {
					id,
					pid,
					text,
				};

				if (processor) {
					item = processor(item);
				}

				data.push(item);
				map[id] = true;
			}

			pid = id;
		}
	});

	return data;
}
