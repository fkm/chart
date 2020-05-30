// NPM Dependencies
import { extent } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import EventEmitter from 'events';
import flattenDeep from 'lodash/flattenDeep';
import isNumber from 'lodash/isNumber';
import omit from 'lodash/omit';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';

// Local Dependencies
import ValueTicks from './ticks-value';
import Grid from './grid';

/**
 * @emits {AxisEvent} emitted when the values and scales are updated.
 */
export default class yAxis extends EventEmitter {
	constructor(chart, config, position) {
		super(...arguments);

		this.chart = chart;
		this.config = config;
		this.position = position;
		this.ignoreTypes = ['static', 'area'];

		this.ticks = new ValueTicks(this, config.ticks);
		this.grid = new Grid(this, config);

		this.parseData = debounce(this.parseData.bind(this), 10);
		this.update = debounce(this.update.bind(this), 10);

		chart.on('datasets', this.parseData);
		chart.on('dimension', this.update);
	}

	adjustDomain() {
		let interval = this.config.ticks.major.interval || 1;
		let [min, max] = this.domain;

		min -= interval - Math.abs(min % interval);
		max += interval - Math.abs(max % interval);

		if (isNumber(this.config.min)) {
			min = Math.max(min, this.config.min);
		}

		if (isNumber(this.config.max)) {
			max = Math.min(max, this.config.max);
		}

		this.domain = [min, max];
	}

	parseData() {
		let values = this.chart.datasets
			.filter(dataset => !this.ignoreTypes.includes(dataset.type))
			.filter(dataset => (
				(
					this.position === 'left' &&
					(
						dataset.unit === undefined ||
						dataset.unit === this.config.unit
					)
				) || (
					this.position === 'right' &&
					(
						dataset.unit !== undefined &&
						dataset.unit === this.config.unit
					)
				)
			))
			.map(dataset => {
				return dataset.values.map(datum => {
					return Object.values(omit(datum, ['x', 'x1', 'x2']));
				});
			});

		this.domain = extent(flattenDeep(values));

		this.adjustDomain();
		this.update();
	}

	update() {
		this.range = [this.chart.innerHeight, 0];

		if (isEmpty(this.domain)) {
			return;
		}

		this.scale = scaleLinear()
			.domain(this.domain)
			.range(this.range);

		this.emit('axis');
	}

	destroy() {
		this.chart.off('datasets', this.parseData);
		this.chart.off('dimension', this.update);

		this.ticks.destroy();
		this.grid.destroy();
	}
}

export class yAxisLeft extends yAxis {
	constructor() {
		super(...arguments, 'left');
	}
}

export class yAxisRight extends yAxis {
	constructor() {
		super(...arguments, 'right');
	}
}
