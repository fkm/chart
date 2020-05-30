// NPM Dependencies
import { format } from 'd3-format';
import { axisLeft, axisRight } from 'd3-axis';
import EventEmitter from 'events';
import isString from 'lodash/isString';
import pullAll from 'lodash/pullAll';
import debounce from 'lodash/debounce';

// Local Dependencies
import { calculateTickRange } from '../functions/utilities';

export default class ValueTicks extends EventEmitter {
	/**
	 *
	 * @param {yAxisLeft|yAxisRight} axis
	 * @param {*} config
	 */
	constructor(axis, config) {
		super(...arguments);

		this.axis = axis;
		this.config = config;

		this.majorGroup = axis.chart.viewport
			.append('g')
				.attr('class', `ticks__y__${axis.position}__major`);

		this.minorGroup = axis.chart.viewport
			.append('g')
				.attr('class', `ticks__y__${axis.position}__minor`);

		this.update = debounce(this.update.bind(this), 10);
		this.draw = debounce(this.draw.bind(this), 10);

		axis.on('axis', this.update);
	}

	update() {
		let { showLabels, tickFormat } = this.config.major;

		if (!showLabels) {
			this.formatter = '';
		} else if (isString(tickFormat)) {
			this.formatter = format(tickFormat);
		} else {
			this.formatter = tickFormat || null;
		}

		this.majorValues = calculateTickRange({
			zero: this.axis.config.zero || 0,
			interval: this.config.major.interval || 1,
			domain: this.axis.domain,
		});

		if (this.config.minor) {
			this.minorValues = pullAll(
				calculateTickRange({
					zero: this.axis.config.zero || 0,
					interval: (
						this.config.minor.interval ||
						(this.config.major.interval || 1) / 5
					),
					domain: this.axis.domain,
				}),
				this.majorValues,
			);
		}

		this.draw();
	}

	draw() {
		let axis = this.axis.position === 'right'
			? axisRight
			: axisLeft;

		if (this.axis.position === 'right') {
			this.majorGroup.attr('transform', `translate(${this.axis.chart.innerWidth},0)`);
			this.minorGroup.attr('transform', `translate(${this.axis.chart.innerWidth},0)`);
		}

		//  __  __        _
		// |  \/  | __ _ (_) ___  _ __
		// | |\/| |/ _` || |/ _ \| '__|
		// | |  | | (_| || | (_) | |
		// |_|  |_|\__,_|/ |\___/|_|
		// 	           |__/
		//

		let major_axis = axis(this.axis.scale)
			.tickValues(this.majorValues)
			.tickFormat(this.formatter)
			.tickSizeInner(this.config.major.tickSizeInner || 0)
			.tickSizeOuter(this.config.major.tickSizeOuter || 0)
			.tickPadding(this.config.major.tickPadding || 0);

		let major_selection = this.majorGroup
			.html(null)
			.call(major_axis);

		if (this.config.major.showLabels && this.config.major.rotateLabels) {
			let { degree, anchor, dx, dy } = this.config.major.rotateLabels;

			major_selection
				.selectAll('text')
				.style('text-anchor', anchor || 'start')
				.attr('dx', dx || 0)
				.attr('dy', dy || 0)
				.attr('transform', `rotate(${degree || 0})`);
		}

		//  __  __ _
		// |  \/  (_)_ __   ___  _ __
		// | |\/| | | '_ \ / _ \| '__|
		// | |  | | | | | | (_) | |
		// |_|  |_|_|_| |_|\___/|_|
		//

		if (this.minorValues) {
			let minor_axis = axis(this.axis.scale)
				.tickValues(this.minorValues)
				.tickFormat('')
				.tickSizeInner(this.config.minor.tickSizeInner || 0)
				.tickSizeOuter(0)
				.tickPadding(0);

			this.minorGroup
				.html(null)
				.call(minor_axis);
		}
	}

	destroy() {
		this.axis.off('axis', this.update);

		this.majorGroup.remove();
		this.minorGroup.remove();

		this.formatter = null;
	}
}
