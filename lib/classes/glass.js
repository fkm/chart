// NPM Dependencies
import { clientPoint, event } from 'd3-selection';
import debounce from 'lodash/debounce';

export default class Glass {
	constructor(chart, config) {
		this.chart = chart;
		this.config = config;

		this.rect = chart.viewport
			.append('rect')
				.attr('class', 'glass')
				.on('mouseover', () => chart.emit('glassover'))
				.on('mouseout', () => chart.emit('glassout'))
				.on('mousemove', function () {
					let [x, y] = clientPoint(this, event);

					let detail = {
						x: Math.max(0, Math.min(x, chart.innerWidth)),
						y: Math.max(0, Math.min(y, chart.innerHeight)),
					};

					chart.emit('glassmove', detail);
				});

		this.draw = debounce(this.draw.bind(this), 10);

		chart.on('dimension', this.draw);
	}

	draw() {
		this.rect
			.attr('width', this.chart.innerWidth)
			.attr('height', this.chart.innerHeight);
	}

	destroy() {
		this.chart.off('dimension', this.draw);

		this.rect.remove();
	}
}
