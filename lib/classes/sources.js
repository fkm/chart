// NPM Dependencies
import isEmpty from 'lodash/isEmpty';
import toPairs from 'lodash/toPairs';
import debounce from 'lodash/debounce';
import isPlainObject from 'lodash/isPlainObject';
import isFunction from 'lodash/isFunction';

export default class Sources {
	constructor(chart, config) {
		this.chart = chart;
		this.config = config;

		this.group = chart.svg
			.append('g')
				.attr('class', 'sources');

		this.update = debounce(this.update.bind(this), 10);
		this.draw = debounce(this.draw.bind(this), 10);

		chart.on('sources', this.update);
		chart.on('dimension', this.draw);
	}

	format(source) {
		let output;

		if (isPlainObject(this.config)) {
			let match = toPairs(this.config).find(config => {
				let regex = new RegExp(config[0], 'i');
				return regex.test(source);
			});
			output = match ? match[1] : source;
		} else if (isFunction(this.config)) {
			output = this.config(source);
		} else {
			output = source;
		}

		return output;
	}

	update() {
		this.list = this._sources.map(source => ({
			label: this.format(source),
			address: source,
		}));

		this.draw();
	}

	draw() {
		this.group.html(null);

		if (isEmpty(this.list)) {
			return;
		}

		let position = [
			this.chart.config.padding.left,
			this.chart.height - 12,
		].join(',');

		this.group
			.attr('transform', `translate(${position})`);

		this.group
			.append('text')
				.attr('class', 'sources__label')
				.text('Sources:');

		this.list.forEach((source, index) => {
			this.group
				.append('a')
					.attr('class', 'sources__link')
					.attr('href', source.address)
				.append('text')
					.attr('x', 50 + 100 * index)
					.text(source.label);
		});
	}

	destroy() {
		this.chart.off('sources', this.update);
		this.chart.off('dimension', this.draw);

		this.group.remove();
	}
}
