// NPM Dependencies
import debounce from 'lodash/debounce';

// Local Dependencies
import drawDataset from '../functions/draw-dataset';

export default class Datasets {
	constructor(chart, config) {
		this.chart = chart;
		this.config = config;

		this._datasets = [];

		this.group = chart.viewport
			.append('g');

		this.draw = debounce(this.draw.bind(this), 10);

		chart.on('dimension', this.draw);
	}

	setDatasets(datasets) {
		this._datasets = datasets;

		this.chart.emit('datasets');

		this.draw();
	}

	draw() {
		this.group.html(null);

		this._datasets.forEach(
			dataset => this.group.call(drawDataset, this.chart, dataset),
		);
	}

	destroy() {
		this.chart.off('dimension', this.draw);

		this.group.remove();

		delete this._datasets;
	}
}
