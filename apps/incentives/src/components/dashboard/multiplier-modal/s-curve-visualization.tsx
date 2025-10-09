'use client';

import * as d3 from 'd3';
import { useEffect, useRef } from 'react';
import { calculateXrdFromMultiplier } from '~/lib/utils';

type SCurveVisualizationProps = {
  currentMultiplier: number;
};

export const SCurveVisualization = ({
  currentMultiplier,
}: SCurveVisualizationProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const currentXrd = calculateXrdFromMultiplier(currentMultiplier);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous content

    // Get the container width for responsive design
    const container = svgRef.current.parentElement;
    const containerWidth = container?.clientWidth || 500;

    // Check if scrollbar is present
    const hasScrollbar = container
      ? container.scrollHeight > container.clientHeight
      : false;
    const scrollbarWidth = hasScrollbar ? 20 : 0;

    // Adjust margins for very small screens
    const isVerySmall = containerWidth < 400;
    const baseMargin = {
      top: 20,
      right: isVerySmall ? 20 : 30,
      bottom: isVerySmall ? 70 : 60,
      left: isVerySmall ? 40 : 60,
    };

    // Calculate available width accounting for scrollbar
    const availableWidth =
      containerWidth - scrollbarWidth - (isVerySmall ? 20 : 30);
    const plotWidth =
      Math.max(250, availableWidth) - baseMargin.left - baseMargin.right;

    // Center the plot if there's extra space
    const totalPlotArea = plotWidth + baseMargin.left + baseMargin.right;
    const extraSpace = Math.max(0, availableWidth - totalPlotArea);
    const centeringOffset = extraSpace / 2;

    const margin = {
      ...baseMargin,
      left: baseMargin.left + centeringOffset,
      right: baseMargin.right + centeringOffset,
    };

    const width = plotWidth;
    const height = Math.max(220, width * 0.6) - margin.bottom - margin.top;

    // Update SVG dimensions
    svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Generate data points for S-curve starting from 10K
    const xrdValues = d3.range(10000, 100000000, 50000);
    const data = xrdValues.map((xrd) => {
      let multiplier: number;
      if (xrd < 10000) {
        multiplier = 0.5;
      } else if (xrd < 75000000) {
        const lnB = Math.log(xrd);
        const expTerm = Math.exp(-0.9 * (lnB - 14.4));
        multiplier = 0.5 + 2.586 / (1 + expTerm);
      } else {
        multiplier = 3.0;
      }
      return { xrd, multiplier };
    });

    // Scales
    const xScale = d3.scaleLog().domain([10000, 100000000]).range([0, width]);

    const yScale = d3.scaleLinear().domain([0.4, 3.1]).range([height, 0]);

    // Line generator
    const line = d3
      .line<{ xrd: number; multiplier: number }>()
      .x((d) => xScale(d.xrd))
      .y((d) => yScale(d.multiplier))
      .curve(d3.curveMonotoneX);

    // Grid lines
    const xTicks = [10000, 100000, 1000000, 10000000, 100000000];
    const yTicks = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0];

    // X grid lines
    g.selectAll('.grid-x')
      .data(xTicks)
      .enter()
      .append('line')
      .attr('class', 'grid-x')
      .attr('x1', (d) => xScale(d))
      .attr('x2', (d) => xScale(d))
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', 'currentColor')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.2);

    // Y grid lines
    g.selectAll('.grid-y')
      .data(yTicks)
      .enter()
      .append('line')
      .attr('class', 'grid-y')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .attr('stroke', 'currentColor')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.2);

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickValues(xTicks)
          .tickFormat((d) => {
            const num = Number(d);
            if (num >= 1000000) return `${num / 1000000}M`;
            if (num >= 1000) return `${num / 1000}K`;
            return num.toString();
          }),
      )
      .selectAll('text')
      .style('fill', 'currentColor')
      .style('font-size', isVerySmall ? '9px' : '11px');

    // Y axis
    g.append('g')
      .call(
        d3
          .axisLeft(yScale)
          .tickValues(yTicks)
          .tickFormat((d) => {
            const num = Number(d);
            return `${new Intl.NumberFormat(undefined, {
              minimumFractionDigits: num % 1 === 0 ? 0 : 1,
              maximumFractionDigits: 1,
            }).format(num)}x`;
          }),
      )
      .selectAll('text')
      .style('fill', 'currentColor')
      .style('font-size', isVerySmall ? '9px' : '11px');

    // Axis lines
    g.selectAll('.domain')
      .style('stroke', 'currentColor')
      .style('stroke-width', 1);

    g.selectAll('.tick line')
      .style('stroke', 'currentColor')
      .style('stroke-width', 1);

    // Create tooltip
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '1000');

    // S-curve line
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#FF43CA') // Brand pink
      .attr('stroke-width', 3)
      .attr('d', line);

    // Create invisible wider line for hover detection
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'transparent')
      .attr('stroke-width', 20)
      .attr('d', line)
      .style('cursor', 'crosshair')
      .on('mouseover', () => {
        tooltip.style('opacity', 1);
      })
      .on('mousemove', (event) => {
        const [mouseX] = d3.pointer(event);
        const xValue = xScale.invert(mouseX);

        // Calculate multiplier for this XRD value
        let multiplier: number;
        if (xValue < 10000) {
          multiplier = 0.5;
        } else if (xValue < 75000000) {
          const lnB = Math.log(xValue);
          const expTerm = Math.exp(-0.9 * (lnB - 14.4));
          multiplier = 0.5 + 2.586 / (1 + expTerm);
        } else {
          multiplier = 3.0;
        }

        const formatXrd = (value: number) => {
          if (value >= 1000000) {
            const millions = new Intl.NumberFormat(undefined, {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            }).format(value / 1000000);
            return `${millions}M XRD`;
          }
          if (value >= 1000) {
            const thousands = new Intl.NumberFormat(undefined, {
              maximumFractionDigits: 0,
            }).format(value / 1000);
            return `${thousands}K XRD`;
          }
          return `${new Intl.NumberFormat(undefined, {
            maximumFractionDigits: 0,
          }).format(value)} XRD`;
        };

        const formattedMultiplier = new Intl.NumberFormat(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(multiplier);

        tooltip
          .html(`${formatXrd(xValue)}<br/>${formattedMultiplier}x multiplier`)
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 10 + 'px');
      })
      .on('mouseout', () => {
        tooltip.style('opacity', 0);
      });

    // Current position marker
    if (currentMultiplier > 0 && currentXrd >= 10000) {
      g.append('circle')
        .attr('cx', xScale(currentXrd))
        .attr('cy', yScale(currentMultiplier))
        .attr('r', 6)
        .attr('fill', '#21FFBE') // Brand cyan
        .attr('stroke', 'white')
        .attr('stroke-width', 2);
    }

    // Axis labels
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - height / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('fill', 'currentColor')
      .style('font-size', '12px')
      .style('opacity', 0.7)
      .text('Multiplier');

    g.append('text')
      .attr(
        'transform',
        `translate(${width / 2}, ${height + margin.bottom - 10})`,
      )
      .style('text-anchor', 'middle')
      .style('fill', 'currentColor')
      .style('font-size', '12px')
      .style('opacity', 0.7)
      .text('XRD Amount');

    // Cleanup function
    return () => {
      d3.select('body').selectAll('.tooltip').remove();
    };
  }, [currentMultiplier, currentXrd]);

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-sm">Multiplier S-Curve</h4>
      <div className="rounded-lg border bg-muted/50 p-4">
        <svg
          ref={svgRef}
          className="h-auto w-full"
          style={{ maxWidth: '100%', height: 'auto' }}
        />

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div
              className="h-2 w-6 rounded"
              style={{ backgroundColor: '#FF43CA' }}
            />
            <span className="text-muted-foreground">S-Curve</span>
          </div>
          {currentMultiplier > 0 && (
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: '#21FFBE' }}
              />
              <span className="text-muted-foreground">Your Position</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
