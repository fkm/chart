// NPM Dependencies
import { merge, range } from 'd3-array';
import uniq from 'lodash/uniq';

export function calculateTickRange(config) {
	let { zero, interval, domain } = config;
	let [min, max] = domain;

	return uniq(merge([
		// Ensure the `min` tick is in the array.
		[min],
		// Add the range from `min` to `zero`.
		range(zero, min, interval * -1).reverse(),
		// Add the range from `zero` to `max`.
		range(zero, max, interval),
		// Ensure the `max` tick is in the array.
		[max],
	]));
}

/**
 * let getColor = getColorConverter(dataset);
 *
 * dataset = { colors: { '-Infinity': 'red', 0: 'green' } };
 * getColor(-Infinity); // red
 * getColor(-1); // red
 * getColor(0); // green
 * getColor(Infinity); // green
 *
 * dataset = { color: 'blue' };
 * getColor(); // blue
 *
 * @param {object} dataset
 */
export function getColorConverter(dataset) {
	let colors = dataset.colors || dataset.color;

	if (typeof colors === 'string') {
		return value => colors;
	} else if (typeof colors === 'function') {
		return colors(dataset);
	} else {
		let keys = Object.keys(colors)
			.map(key => Number(key))
			.sort((a, b) => b - a);

		return value => {
			let key = keys.find(key => value >= key);
			return colors[key];
		};
	}
};
