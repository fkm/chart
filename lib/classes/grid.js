// NPM Dependencies
import { axisLeft } from 'd3-axis';
import debounce from 'lodash/debounce';

// Local Dependencies
import { calculateTickRange } from '../functions/utilities';

export default class Grid {
	constructor(axis, config) {
		this.axis = axis;
		this.config = config;

		this.group = axis.chart.viewport
			.append('g')
				.attr('class', 'grid');

		this.update = debounce(this.update.bind(this), 10);
		this.draw = debounce(this.draw.bind(this), 10);

		axis.on('axis', this.update);
	}

	update() {
		this.values = calculateTickRange({
			zero: this.axis.config.zero || 0,
			interval: this.config.ticks.major.interval || 1,
			domain: this.axis.domain,
		});

		this.draw();
	}

	draw() {
		let axis = axisLeft(this.axis.scale)
			.tickValues(this.values)
			.tickFormat('')
			.tickSizeInner(-this.axis.chart.innerWidth)
			.tickSizeOuter(0);

		this.group
			.html(null)
			.call(axis);
	}

	destroy() {
		this.axis.off('axis', this.update);

		this.group.remove();
	}
}
