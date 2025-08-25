'use client';

import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';

type AccountBalanceData = {
  accountAddress: string;
  timestamp: Date;
  data: Array<{
    activityId: string;
    usdValue: string;
    categoryId: string;
  }>;
};

type BubbleMapProps = {
  data: AccountBalanceData[] | undefined;
};

export const BubbleMap = ({ data }: BubbleMapProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: width,
          height: Math.min(600, width * 0.75), // Maintain aspect ratio
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const { width, height } = dimensions;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Process and group data by account address -> category -> activities
    const accountGroups = data
      .map((balance) => {
        // Group activities by category first
        const categoriesMap = new Map<
          string,
          Array<{
            activityId: string;
            value: number;
          }>
        >();

        balance.data
          .filter((item) => {
            const value = parseFloat(item.usdValue);
            return !Number.isNaN(value) && value > 0;
          })
          .forEach((item) => {
            const category = item.categoryId || 'Unknown';
            const value = parseFloat(item.usdValue);
            if (!categoriesMap.has(category)) {
              categoriesMap.set(category, []);
            }
            categoriesMap.get(category)?.push({
              activityId: item.activityId,
              value: value,
            });
          });

        // Convert to hierarchical structure
        const categories = Array.from(categoriesMap.entries())
          .map(([categoryId, activities]) => ({
            categoryId,
            children: activities
              .filter((activity) => activity.value > 0)
              .map((activity) => ({
                id: `${balance.accountAddress}-${categoryId}-${activity.activityId}`,
                activityId: activity.activityId,
                value: activity.value,
              })),
            totalValue: activities.reduce((sum, a) => sum + a.value, 0),
          }))
          .filter(
            (category) =>
              category.totalValue > 0 && category.children.length > 0,
          );

        return {
          accountAddress: balance.accountAddress,
          children: categories,
          totalValue: categories.reduce((sum, cat) => sum + cat.totalValue, 0),
        };
      })
      .filter((group) => group.totalValue > 0 && group.children.length > 0);

    if (accountGroups.length === 0) {
      // Show message when no data
      const svg = d3.select(svgRef.current);
      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#a1a1aa')
        .text('No balance data available');
      return;
    }

    // Create hierarchy for pack layout with grouped structure
    const hierarchyData = {
      name: 'root',
      children: accountGroups,
    };

    const root = d3
      .hierarchy(hierarchyData)
      .sum((d: any) => d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    // Create pack layout
    const pack = d3
      .pack<any>()
      .size([width - 40, height - 40])
      .padding(15);

    const nodes = pack(root);

    // Create color scales
    const categoryIds = [
      ...new Set(
        accountGroups.flatMap((g) => g.children.map((c) => c.categoryId)),
      ),
    ];
    const activityIds = [
      ...new Set(
        accountGroups.flatMap((g) =>
          g.children.flatMap((c) => c.children.map((a) => a.activityId)),
        ),
      ),
    ];

    // Create category color scale
    const categoryColorScale = d3
      .scaleOrdinal()
      .domain(categoryIds)
      .range(d3.schemeCategory10);

    // Create activity color scale with more distinct colors
    const colorInterpolator = d3.interpolateRainbow;
    const activityColorScale = d3
      .scaleOrdinal()
      .domain(activityIds)
      .range(
        activityIds.map((_, i) => colorInterpolator(i / activityIds.length)),
      );

    const accountColorScale = d3
      .scaleOrdinal()
      .domain(accountGroups.map((g) => g.accountAddress))
      .range(d3.schemeSet3);

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create tooltip
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'bubble-tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none');

    // Add a background rectangle for better zoom/pan interaction
    svg
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .style('fill', 'none')
      .style('pointer-events', 'all');

    // Create main group
    const mainGroup = svg.append('g').attr('transform', 'translate(20, 20)');

    // Create zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5])
      .on('zoom', (event) => {
        mainGroup.attr('transform', event.transform);

        // Update label visibility based on zoom level
        const zoomScale = event.transform.k;

        // Show more activity labels when zoomed in
        mainGroup
          .selectAll('.activity-label-group')
          .style('display', (d: any) => {
            const minRadius = 12 / zoomScale; // Adjust threshold based on zoom
            return d.r > minRadius ? 'block' : 'none';
          });

        // Update activity ID labels
        mainGroup
          .selectAll('.activity-label')
          .style('font-size', `${9 / Math.sqrt(zoomScale)}px`)
          .text((d: any) => {
            // Dynamically adjust text based on visible size
            const effectiveRadius = d.r * zoomScale;
            const maxChars = Math.floor(effectiveRadius / 3);
            const text = d.data.activityId;
            return text.length > maxChars && maxChars > 3
              ? `${text.substring(0, maxChars - 1)}…`
              : text;
          });

        // Update value labels
        mainGroup
          .selectAll('.value-label')
          .style('font-size', `${8 / Math.sqrt(zoomScale)}px`)
          .style('display', (d: any) => {
            // Hide value label if bubble is too small even when zoomed
            const effectiveRadius = d.r * zoomScale;
            return effectiveRadius > 16 ? 'block' : 'none';
          });

        // Adjust account labels based on zoom
        mainGroup
          .selectAll('.account-label')
          .style('display', (d: any) => {
            const minRadius = 60 / zoomScale; // Adjust threshold based on zoom
            return d.r > minRadius ? 'block' : 'none';
          })
          .style('font-size', `${12 / Math.sqrt(zoomScale)}px`);

        // Adjust category labels based on zoom
        mainGroup
          .selectAll('.category-label')
          .style('display', (d: any) => {
            const minRadius = 30 / zoomScale; // Adjust threshold based on zoom
            return d.r > minRadius ? 'block' : 'none';
          })
          .style('font-size', `${10 / Math.sqrt(zoomScale)}px`);
      });

    svg.call(zoom);

    // Draw account group circles (level 1 - accounts)
    const accountNodes = nodes.descendants().filter((d) => d.depth === 1);

    mainGroup
      .selectAll('.account-group')
      .data(accountNodes)
      .enter()
      .append('circle')
      .attr('class', 'account-group')
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('r', (d) => d.r)
      .style('fill', 'none')
      .style(
        'stroke',
        (d: any) => accountColorScale(d.data.accountAddress) as string,
      )
      .style('stroke-width', 3)
      .style('stroke-dasharray', '5,5')
      .style('opacity', 0.6);

    // Draw category group circles (level 2 - categories)
    const categoryNodes = nodes.descendants().filter((d) => d.depth === 2);

    mainGroup
      .selectAll('.category-group')
      .data(categoryNodes)
      .enter()
      .append('circle')
      .attr('class', 'category-group')
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('r', (d) => d.r)
      .style('fill', 'none')
      .style(
        'stroke',
        (d: any) => categoryColorScale(d.data.categoryId) as string,
      )
      .style('stroke-width', 2)
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.4);

    // Draw activity bubbles (level 3 - activities)
    const activityNodes = nodes.descendants().filter((d) => d.depth === 3);

    const bubbles = mainGroup
      .selectAll('.activity-bubble')
      .data(activityNodes)
      .enter()
      .append('circle')
      .attr('class', 'activity-bubble')
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('r', 0)
      .style(
        'fill',
        (d: any) => activityColorScale(d.data.activityId) as string,
      )
      .style('fill-opacity', 0.7)
      .style(
        'stroke',
        (d: any) => activityColorScale(d.data.activityId) as string,
      )
      .style('stroke-width', 1.5)
      .on('mouseover', function (event, d: any) {
        d3.select(this).style('fill-opacity', 1).style('stroke-width', 3);

        tooltip.transition().duration(200).style('opacity', 0.9);

        const accountAddress = d.parent.parent.data.accountAddress;
        const categoryId = d.parent.data.categoryId;
        tooltip
          .html(`
          <div>
            <strong>Account:</strong> ${accountAddress.slice(0, 8)}...${accountAddress.slice(-6)}<br/>
            <strong>Category:</strong> ${categoryId}<br/>
            <strong>Activity:</strong> ${d.data.activityId}<br/>
            <strong>Value:</strong> $${d.data.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        `)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', function (_event, _d: any) {
        d3.select(this).style('fill-opacity', 0.7).style('stroke-width', 1.5);

        tooltip.transition().duration(500).style('opacity', 0);
      });

    // Animate bubbles
    bubbles
      .transition()
      .duration(600)
      .attr('r', (d) => d.r)
      .ease(d3.easeCubicOut);

    // Add account labels (all, but initially hidden for small ones)
    const _accountLabels = mainGroup
      .selectAll('.account-label')
      .data(accountNodes)
      .enter()
      .append('text')
      .attr('class', 'account-label')
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y - d.r + 15)
      .attr('text-anchor', 'middle')
      .style('fill', '#e5e5e5')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('pointer-events', 'none')
      .style('display', (d) => (d.r > 60 ? 'block' : 'none'))
      .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.8)')
      .text(
        (d: any) =>
          `${d.data.accountAddress.slice(0, 6)}...${d.data.accountAddress.slice(-4)}`,
      );

    // Add category labels
    const _categoryLabels = mainGroup
      .selectAll('.category-label')
      .data(categoryNodes)
      .enter()
      .append('text')
      .attr('class', 'category-label')
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y - d.r + 12)
      .attr('text-anchor', 'middle')
      .style('fill', '#d1d5db')
      .style('font-size', '10px')
      .style('font-weight', 'bold')
      .style('pointer-events', 'none')
      .style('display', (d) => (d.r > 30 ? 'block' : 'none'))
      .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.8)')
      .text((d: any) => d.data.categoryId);

    // Add activity labels (all, but initially hidden for small ones)
    const activityLabels = mainGroup
      .selectAll('.activity-label')
      .data(activityNodes)
      .enter()
      .append('g')
      .attr('class', 'activity-label-group')
      .attr('transform', (d) => `translate(${d.x}, ${d.y})`)
      .style('pointer-events', 'none')
      .style('display', (d) => (d.r > 12 ? 'block' : 'none'));

    // Activity ID text
    activityLabels
      .append('text')
      .attr('class', 'activity-label')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.3em')
      .style('fill', 'white')
      .style('font-size', '9px')
      .style('font-weight', 'bold')
      .style(
        'text-shadow',
        '1px 1px 2px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8)',
      )
      .text((d: any) => {
        // Truncate text if bubble is too small
        const maxChars = Math.floor(d.r / 3);
        const text = d.data.activityId;
        return text.length > maxChars && maxChars > 3
          ? `${text.substring(0, maxChars - 1)}…`
          : text;
      });

    // USD value text
    activityLabels
      .append('text')
      .attr('class', 'value-label')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.9em')
      .style('fill', 'white')
      .style('font-size', '8px')
      .style(
        'text-shadow',
        '1px 1px 2px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8)',
      )
      .text((d: any) => {
        const value = d.data.value;
        if (value >= 1000000) {
          return `$${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
          return `$${(value / 1000).toFixed(1)}K`;
        } else {
          return `$${value.toFixed(0)}`;
        }
      });

    // Add legend at the bottom with wrapping (show categories)
    const legendGroup = svg
      .append('g')
      .attr('transform', `translate(20, ${height - 80})`);

    // Calculate legend layout for categories
    const itemsPerRow = Math.floor((width - 40) / 120);
    const _legendRows = Math.ceil(categoryIds.length / itemsPerRow);

    const legend = legendGroup
      .selectAll('.legend-item')
      .data(categoryIds)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (_d, i) => {
        const row = Math.floor(i / itemsPerRow);
        const col = i % itemsPerRow;
        return `translate(${col * 120}, ${row * 20})`;
      });

    legend
      .append('circle')
      .attr('r', 6)
      .attr('cx', 0)
      .attr('cy', 0)
      .style('fill', (d) => categoryColorScale(d) as string)
      .style('fill-opacity', 0.7)
      .style('stroke', (d) => categoryColorScale(d) as string)
      .style('stroke-width', 1);

    legend
      .append('text')
      .attr('x', 10)
      .attr('y', 0)
      .attr('dy', '.35em')
      .style('font-size', '11px')
      .style('fill', '#a1a1aa')
      .text((d) => d);

    // Add zoom instructions
    svg
      .append('text')
      .attr('x', width - 10)
      .attr('y', height - 10)
      .attr('text-anchor', 'end')
      .style('font-size', '10px')
      .style('fill', '#999')
      .text('Scroll to zoom • Drag to pan');

    // Cleanup tooltip on unmount
    return () => {
      d3.select('body').selectAll('.bubble-tooltip').remove();
    };
  }, [data, dimensions]);

  return (
    <div ref={containerRef} className="bubble-map-container w-full">
      <svg ref={svgRef} />
    </div>
  );
};
