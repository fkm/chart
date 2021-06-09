// NPM Dependencies
import { select } from 'd3-selection';
import EventEmitter from 'events';
import debounce from 'lodash/debounce';

// Local Dependencies
import drawDataset from '../functions/draw-dataset';
import Sources from './sources';
import xAxis from './axis-x';
import { yAxisLeft, yAxisRight } from './axis-y';
import Tooltip from './tooltip';
import Frame from './frame';
import Glass from './glass';

/**
 * @emits {DatasetsEvent} emitted when new datasets are available.
 * @emits {SourcesEvent} emitted when new sources are available.
 * @emits {ConfigEvent} emitted when the configuration has changed.
 * @emits {ResizeEvent} emitted when the dimensions have changed.
 * @emits {GlassOverEvent} emitted when the pointer enters the viewport.
 * @emits {GlassOutEvent} emitted when the pointer leaves the viewport.
 * @emits {GlassMoveEvent} emitted when the pointer moves over the viewport.
 *
 * @param {ConfigObject} config The complete configuration for the chart.
 */
export default class Chart extends EventEmitter {
	constructor(config) {
		super(...arguments);

		this.config = config;
		this.container = select(config.container);
		this.datasets = [];

		if (this.container.empty()) {
			throw new Error(`Container node "${config.container}" not found.`);
		}

		this.update = debounce(this.update.bind(this), 10);
		this.draw = debounce(this.draw.bind(this), 10);
		this.drawData = debounce(this.drawData.bind(this), 10);

		this.container.attr('class', 'chart');

		this.svg = this.container
			.append('svg');

		this.viewport = this.svg
			.append('g')
				.attr('class', 'viewport');

		this.data = this.viewport
			.append('g');

		this.update();

		this.sources = new Sources(this, config.sources);

		this.xAxis = new xAxis(this, config.xAxis);
		this.yAxisLeft = new yAxisLeft(this, config.yAxisLeft);

		if (config.yAxisRight) {
			this.yAxisRight = new yAxisRight(this, config.yAxisRight);
		}

		this.tooltip = new Tooltip(this, config.tooltip);

		this.frame = new Frame(this, config.frame);
		this.glass = new Glass(this, config.glass);

		this.emit('dimension');
	}

	setConfig(config) {
		for (let key in config) {
			Object.assign(this.config[key], config[key]);
		}

		this.emit('config');
	}

	setDatasets(datasets) {
		this.datasets = datasets;

		this.emit('datasets');

		setTimeout(this.drawData, 1000);
	}

	setSources(sources) {
		this.sources._sources = sources;

		this.emit('sources');
	}

	update() {
		let { offsetWidth, offsetHeight } = this.container.node();

		if (
			this.width === offsetWidth &&
			isNaN(this.config.ratio) &&
			this.height === offsetHeight
		) {
			return;
		}

		let { padding } = this.config;

		this.width = offsetWidth;
		this.innerWidth = this.width - padding.left - padding.right;

		if (this.config.ratio) {
			this.innerHeight = this.innerWidth * this.config.ratio;
			this.height = this.innerHeight + padding.top + padding.bottom; // OR? chart.width * chart.ratio
		} else {
			this.height = offsetHeight;
			this.innerHeight = this.height - padding.top - padding.bottom;
		}

		this.emit('dimension');

		this.draw();
		this.drawData();
	}

	draw() {
		this.svg
			.attr('width', this.width)
			.attr('height', this.height);

		let { top, left } = this.config.padding;

		this.viewport
			.attr('transform', `translate(${left}, ${top})`);
	}

	drawData() {
		this.data.html(null);

		this.datasets.forEach(
			dataset => this.data.call(drawDataset, this, dataset),
		);
	}

	destroy() {
		this.sources.destroy();
		this.xAxis.destroy();
		this.yAxisLeft.destroy();

		if (this.yAxisRight) {
			this.yAxisRight.destroy();
		}

		this.tooltip.destroy();
		this.frame.destroy();
		this.glass.destroy();

		this.viewport.remove();
		this.svg.remove();

		delete this.container;
		this.config.container = null;
	}
}
