import { path2data } from "../src";

test("path2data -1", () => {
	const data = path2data("A/B/C/D/E/F");
	expect(data.length).toEqual(6);
	expect(data.map(item => item.text)).toEqual(["A", "B", "C", "D", "E", "F"]);
	expect(data.map(item => item.pid)).toEqual([null, "A", "A/B", "A/B/C", "A/B/C/D", "A/B/C/D/E"]);
	expect(data.map(item => item.id)).toEqual([
		"A",
		"A/B",
		"A/B/C",
		"A/B/C/D",
		"A/B/C/D/E",
		"A/B/C/D/E/F",
	]);
});

test("path2data -2", () => {
	const data = path2data(["A/B", "A/B/C", "A/B/D", "A/E/F", "A/N", "D/B"]);
	expect(data.length).toEqual(9);
	expect(data.map(item => item.text)).toEqual(["A", "B", "C", "D", "E", "F", "N", "D", "B"]);
	expect(data.map(item => item.pid)).toEqual([
		null,
		"A",
		"A/B",
		"A/B",
		"A",
		"A/E",
		"A",
		null,
		"D",
	]);
	expect(data.map(item => item.id)).toEqual([
		"A",
		"A/B",
		"A/B/C",
		"A/B/D",
		"A/E",
		"A/E/F",
		"A/N",
		"D",
		"D/B",
	]);
});

test("path2data -3", () => {
	const data = path2data(["A_B", "A_B_C", "A_B_D", "A_E_F", "A_N", "D_B"], {
		sep: "_",
		rootId: 0,
		processor(data) {
			data.label = data.text;
			return data;
		},
	});
	expect(data.length).toEqual(9);
	expect(data.map(item => item.text)).toEqual(["A", "B", "C", "D", "E", "F", "N", "D", "B"]);
	expect(data.map(item => item.label)).toEqual(["A", "B", "C", "D", "E", "F", "N", "D", "B"]);
	expect(data.map(item => item.pid)).toEqual([0, "A", "A_B", "A_B", "A", "A_E", "A", 0, "D"]);
	expect(data.map(item => item.id)).toEqual([
		"A",
		"A_B",
		"A_B_C",
		"A_B_D",
		"A_E",
		"A_E_F",
		"A_N",
		"D",
		"D_B",
	]);
});
