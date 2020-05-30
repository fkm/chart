// NPM Dependencies
import { isDefined, keepUniqueDates, concatArrays, ascendingDates } from '@fkm/array';
import { extent } from 'd3-array';
import { axisBottom } from 'd3-axis';
import { scaleTime, scaleBand } from 'd3-scale';
import { timeMonth } from 'd3-time';
import { timeFormat } from 'd3-time-format';
import EventEmitter from 'events';
import map from 'lodash/map';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';

/**
 * @emits {AxisEvent} emitted when the values and scales are updated.
 */
export default class xAxis extends EventEmitter {
	constructor(chart, config) {
		super(...arguments);

		this.chart = chart;
		this.config = config;

		// this.ticks = new TimeTicks(this, config.ticks);
		this.ticks = chart.viewport
			.append('g')
				.attr('class', 'ticks__x');

		this.parseData = debounce(this.parseData.bind(this), 10);
		this.update = debounce(this.update.bind(this), 10);
		this.draw = debounce(this.draw.bind(this), 10);

		chart.on('datasets', this.parseData);
		chart.on('dimension', this.update);
	}

	parseData() {
		this.dates = this.chart.datasets
			.map(dataset => map(dataset.values, 'x'))
			.reduce(concatArrays, [])
			.filter(isDefined)
			.filter(keepUniqueDates)
			.sort(ascendingDates);

		this.domain = extent(this.dates);

		this.update();
	}

	update() {
		this.range = [0, this.chart.innerWidth];

		if (isEmpty(this.domain)) {
			return;
		}

		this.scale = scaleTime()
			.domain(this.domain)
			.range(this.range);

		this.scaleBand = scaleBand()
			.domain(this.dates)
			.range(this.range)
			.padding(0.1);

		this.axis = axisBottom(this.scale)
			.ticks(timeMonth.every(1))
			.tickFormat(timeFormat('%B'));

		this.emit('axis');

		this.draw();
	}

	draw() {
		this.ticks
			.html(null)
			.attr('transform', `translate(0, ${this.chart.innerHeight})`)
			.call(this.axis);
	}

	destroy() {
		this.chart.off('datasets', this.parseData);
		this.chart.off('dimension', this.update);
	}
}
