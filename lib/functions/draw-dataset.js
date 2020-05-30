// NPM Dependencies
import chroma from 'chroma-js';
import { scaleBand } from 'd3-scale';
import { line, area, curveMonotoneX, curveCatmullRom } from 'd3-shape';

// Local Dependencies
import { getColorConverter } from './utilities';

export default function drawDataset(selection, chart, dataset) {
	let getColor = getColorConverter(dataset);
	let yAxis = chart.yAxisRight && dataset.unit === chart.yAxisRight.unit
		? 'yAxisRight'
		: 'yAxisLeft';

	switch (dataset.type) {
		case 'line': {
			let path = line()
				.defined(datum => datum.y !== null)
				.x(datum => chart.xAxis.scale(datum.x))
				.y(datum => chart[yAxis].scale(datum.y))
				.curve(curveCatmullRom.alpha(0.5));

			selection
				.selectAll(`.dataset__line--${dataset.key}`)
					.remove();

			selection
				.append('path')
					.datum(dataset.values)
					.attr('class', `dataset__line dataset__line--${dataset.key}`)
					.attr('clip-path', `url(#clip--${chart.config.key})`)
					.attr('stroke', getColor(null))
					.attr('d', path);

			break;
		}

		case 'bars': {
			let scale_band = scaleBand()
				.domain(dataset.values.map(datum => datum.x))
				.range(chart.xAxis.range)
				.padding(0.1);

			let bar_selection = selection
				.selectAll(`.dataset__bars--${dataset.key}`)
					.data(dataset.values);

			bar_selection
				.enter()
					.append('rect')
						.attr('class', `dataset__bars dataset__bars--${dataset.key}`)
						.attr('clip-path', `url(#clip--${chart.config.key})`)
						.attr('fill', datum => getColor(datum.y2 - datum.y1))
						.attr('x', datum => scale_band(datum.x))
						.attr('y', datum => chart[yAxis].scale(datum.y2))
						.attr('width', scale_band.bandwidth())
						.attr('height', datum =>
							chart.innerHeight - chart[yAxis].scale(
								datum.y2 - datum.y1,
							),
						);

			bar_selection
				.exit()
					.remove();

			break;
		}

		case 'polygon': {
			let polygon = area()
				.defined(datum => datum.y1 !== null && datum.y2 !== null)
				.x(datum => chart.xAxis.scale(datum.x))
				.y0(datum => chart[yAxis].scale(datum.y1))
				.y1(datum => chart[yAxis].scale(datum.y2))
				.curve(curveMonotoneX);

			selection
				.selectAll(`.dataset__polygon--${dataset.key}`)
					.remove();

			selection
				.append('path')
					.datum(dataset.values)
					.attr('class', `dataset__polygon dataset__polygon--${dataset.key}`)
					.attr('clip-path', `url(#clip--${chart.config.key})`)
					.attr('fill', getColor(null))
					.attr('d', polygon);

			break;
		}

		case 'static': {
			let datum = dataset.values[0];

			selection
				.selectAll(`.dataset__static--${dataset.key}`)
					.remove();

			let group_selection = selection
				.append('g')
					.attr('class', `dataset__static dataset__static--${dataset.key}`);

			if (datum.hasOwnProperty('y')) {
				group_selection
					.append('line')
						.attr('class', 'dataset__static__line')
						.attr('clip-path', `url(#clip--${chart.config.key})`)
						.attr('stroke', getColor(null))
						.attr('x1', 0)
						.attr('x2', chart.innerWidth)
						.attr('y1', chart[yAxis].scale(datum.y))
						.attr('y2', chart[yAxis].scale(datum.y) + 1);

				group_selection
					.append('text')
						.attr('class', 'dataset__static__label')
						.attr('fill', getColor(null))
						.attr('x', 10)
						.attr('y', chart[yAxis].scale(datum.y) - 6)
						.text(dataset.label);
			} else {
				group_selection
					.append('line')
						.attr('class', 'dataset__static__line')
						.attr('clip-path', `url(#clip--${chart.config.key})`)
						.attr('stroke', getColor(null))
						.attr('x1', chart.xAxis.scale(datum.x))
						.attr('x2', chart.xAxis.scale(datum.x) + 1)
						.attr('y1', 0)
						.attr('y2', chart.innerHeight);

				group_selection
					.append('text')
						.attr('class', 'dataset__static__label')
						.attr('fill', getColor(null))
						.attr('x', 0)
						.attr('y', 0)
						.attr('transform', `rotate(90) translate(5, -${chart.xAxis.scale(datum.x) + 8})`)
						.text(dataset.label);
			}
			break;
		}

		case 'area': {
			let datum = dataset.values[0];

			selection
				.selectAll(`.dataset__area--${dataset.key}`)
					.remove();

			let group_selection = selection
				.append('g')
					.attr('class', `dataset__area dataset__area--${dataset.key}`);

			if (datum.hasOwnProperty('x1')) {
				group_selection
					.append('rect')
						.attr('class', 'dataset__area__rect')
						.attr('clip-path', `url(#clip--${chart.config.key})`)
						.attr('fill', getColor(null))
						.attr('x', chart.xAxis.scale(datum.x1))
						.attr('y', 0)
						.attr('width', chart.xAxis.scale(datum.x2) - chart.xAxis.scale(datum.x1))
						.attr('height', chart.innerHeight);

				group_selection
					.append('text')
						.attr('class', 'dataset__area__label')
						.attr('fill', chroma(getColor(null)).darken(1).css())
						.attr('x', 0)
						.attr('y', 0)
						.attr('transform', `rotate(90) translate(5, -${chart.xAxis.scale(datum.x1) + 10})`)
						.text(dataset.label);
			} else {
				group_selection
					.append('rect')
						.attr('class', 'dataset__area__rect')
						.attr('clip-path', `url(#clip--${chart.config.key})`)
						.attr('fill', getColor(null))
						.attr('x', 0)
						.attr('width', chart.innerWidth)
						.attr('y', chart[yAxis].scale(datum.y1))
						.attr('height',
							chart.innerHeight - chart[yAxis].scale(
								datum.y2 - datum.y1,
							),
						);

				group_selection
					.append('text')
						.attr('class', 'dataset__area__label')
						.attr('fill', chroma(getColor(null)).darken(1).css())
						.attr('x', 10)
						.attr('y', chart.innerHeight - chart[yAxis].scale(datum.y2) - 6)
						.text(dataset.label);
			}
			break;
		}
	}
}
