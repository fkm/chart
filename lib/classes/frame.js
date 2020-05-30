// NPM Dependencies
import debounce from 'lodash/debounce';

export default class Frame {
	constructor(chart, config) {
		this.chart = chart;
		this.config = config;

		this.clipPath = chart.viewport
			.append('clipPath')
				.attr('id', `clip--${chart.config.key}`)
			.append('rect');

		this.border = chart.viewport
			.append('rect')
				.attr('class', 'frame__border');

		this.draw = debounce(this.draw.bind(this), 10);

		chart.on('dimension', this.draw);
	}

	draw() {
		this.clipPath
			.attr('width', this.chart.innerWidth)
			.attr('height', this.chart.innerHeight);

		this.border
			.attr('width', this.chart.innerWidth)
			.attr('height', this.chart.innerHeight);
	}

	destroy() {
		this.chart.off('dimension', this.draw);

		this.clipPath.remove();
		this.border.remove();
	}
}
