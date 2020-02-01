/**
 * @example
 * path2data(["A/B/C", "A/B/D", "A/E/C"]);
 */

type IdType = string | number | null | undefined;

export interface PathData {
	id: string;
	pid: IdType;
	text: string;
}

export function path2data(paths: string[] | string, sep: string = "/", rootId: IdType = null) {
	const data: PathData[] = [];
	const map: { [prop: string]: PathData } = Object.create(null);

	paths = Array.isArray(paths) ? paths : [paths];

	paths.forEach((path: string) => {
		const pathArray = path.split(sep);

		let pid = rootId;

		for (let i = 0; i < pathArray.length; i++) {
			const text = pathArray[i];
			const id = pathArray.slice(0, i + 1).join(sep);

			if (!map[id]) {
				const node = {
					id,
					pid,
					text,
				};

				data.push(node);
				map[id] = node;
			}

			pid = id;
		}
	});

	return data;
}
