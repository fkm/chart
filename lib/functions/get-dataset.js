// NPM Dependencies
import { stack } from 'd3-shape';

export function getLineSet(data, config) {
	return {
		...config,

		type: 'line',
		values: data.map(datum => ({
			x: datum.date,
			y: datum[config.key],
		})),
	};
}

export function getBarSet(data, config) {
	return {
		...config,

		type: 'bars',
		values: data.map(datum => ({
			x: datum.date,
			y1: 0,
			y2: datum[config.key],
		})),
	};
}

export function getStackedSets(data, type, configs) {
	let keys = configs.map(config => config.key);

	let data_stacked = stack().keys(keys)(data);

	return configs.map((config, index) => {
		let data_current = data_stacked[index];

		return {
			...config,

			type,
			values: data_current.map(datum => ({
				x: datum.data.date,
				y1: datum[0],
				y2: datum[1],
			})),
		};
	});
}
