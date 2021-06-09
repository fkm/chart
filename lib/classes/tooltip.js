// NPM Dependencies
import { bisectLeft } from 'd3-array';
import { timeFormat } from 'd3-time-format';
import debounce from 'lodash/debounce';

// Local Dependencies
import { getColorConverter } from '../functions/utilities';

const TYPES_IGNORE = ['static', 'area'];

export default class Tooltip {
	constructor(chart, config) {
		this.chart = chart;
		this.config = config;

		this.formatter = timeFormat(config.format);

		this.group = chart.viewport
			.append('g')
				.style('display', 'none');

		this.text = chart.container
			.append('div')
				.attr('class', 'tooltip__text')
				.style('width', config.width + 'px')
				.style('display', 'none');

		this.datetime = this.text
			.append('p')
				.attr('class', 'tooltip__datetime');

		this.list = this.text
			.append('dl')
				.attr('class', 'tooltip__list');

		this.line = this.group
			.append('line')
				.attr('class', 'tooltip__line')
				.attr('stroke-dasharray', '5 3')
				.attr('x1', 0)
				.attr('x2', 1)
				.attr('y1', 0)
				.attr('y2', chart.innerHeight);

		chart
			.on('glassover', () => {
				this.group.style('display', 'block');
				this.text.style('display', 'block');
			})
			.on('glassout', () => {
				this.group.style('display', 'none');
				this.text.style('display', 'none');
			})
			.on('glassmove', event => {
				let data = chart.xAxis.dates;
				let point = chart.xAxis.scale.invert(event.x);
				let index = bisectLeft(data, point);

				let x_value_low = data[index - 1];
				let x_value_high = data[index];
				let index_closest = Math.abs(point - x_value_low) > Math.abs(x_value_high - point)
					? index
					: Math.max(index - 1, 0);

				let date = data[index_closest];

				if (!date) {
					return;
				}

				let x_value = chart.xAxis.scale(date);

				this.datetime.text(this.formatter(date));

				this.group.selectAll('.tooltip__circle').remove();

				this.list.html(null);

				chart.datasets
					.filter(dataset => !TYPES_IGNORE.includes(dataset.type))
					.forEach((dataset, index_dataset) => {
						let value = this.getRealValue(dataset, index_closest);
						let color = this.getColor[index_dataset](value);

						this.list
							.append('dt')
								.text(dataset.label);

						this.list
							.append('dd')
								.html(value !== null ? value : '-')
								.style('border-bottom-color', color);

						if (value === null) {
							return;
						}

						let y_value = chart.yAxisLeft.scale(
							this.getPaintValue(dataset, index_closest),
						);

						this.group
							.append('circle')
								.attr('class', 'tooltip__circle')
								.attr('fill', color)
								.attr('cx', x_value)
								.attr('cy', y_value)
								.attr('r', config.radius);
					});

				if (!this.height) {
					this.height = this.text.node().offsetHeight;
				}

				let y_offset_real = event.y + chart.config.padding.top;
				let y_offset_max = (
					// Offset of viewport bottom.
					chart.height - chart.config.padding.bottom -
					// Height of tooltip and margin.
					this.height - config.margin
				);
				let y_offset_final = Math.min(y_offset_real, y_offset_max);

				let x_offset_value = chart.config.padding.left + x_value;
				let x_offset_max = chart.width - chart.config.padding.right;
				let x_overflown = x_offset_value + config.margin + config.width > x_offset_max;

				this.text.style('top', `${y_offset_final}px`);

				if (x_overflown) {
					let x_final = x_offset_max - config.margin - x_value;

					this.text
						.style('right', `${x_final}px`)
						.style('left', null);
				} else {
					let x_final = x_offset_value + config.margin;

					this.text
						.style('left', `${x_final}px`)
						.style('right', null);
				}

				this.line
					.attr('transform', `translate(${x_value}, 0)`)
					.attr('y2', chart.innerHeight);
			});

		this.update = debounce(this.update.bind(this), 10);
		this.draw = debounce(this.draw.bind(this), 10);

		chart.on('datasets', this.update);
	}

	getRealValue(dataset, index) {
		let datum = dataset.values[index];

		switch (dataset.type) {
			case 'line':    return datum.y;
			case 'bars':    return datum.y2 - datum.y1;
			case 'polygon': return datum.y2 - datum.y1;

			default: throw new Error(`Invalid dataset type. ${dataset.type}`);
		}
	}

	getPaintValue(dataset, index) {
		let datum = dataset.values[index];

		switch (dataset.type) {
			case 'line':    return datum.y;
			case 'bars':    return datum.y2;
			case 'polygon': return datum.y2;

			default: throw new Error(`Invalid dataset type. ${dataset.type}`);
		}
	}

	update() {
		this.getColor = this.chart.datasets
			.filter(dataset => !TYPES_IGNORE.includes(dataset.type))
			.map(dataset => getColorConverter(dataset));

		this.draw();
	}

	draw() {
		this.text.style('width', this.config.width + 'px');

		this.line.attr('y2', this.chart.innerHeight);
	}

	destroy() {
		chart.off('datasets', this.update);

		this.line.remove();
		this.datetime.remove(),
		this.list.remove();
		this.text.remove();
		this.group.remove();

		this.getColor = null;
	}
}
