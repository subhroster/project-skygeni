import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import {
  DataItem,
  processBarChartData,
  createChartScales,
  formatCurrency,
  formatCompactCurrency, // Add this import
} from "../utils/chartUtils";

interface BarChartProps {
  data: DataItem[];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}

function BarChart({
  data,
  width = 600,
  height = 400,
  margin = { top: 20, right: 30, bottom: 60, left: 80 },
}: BarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    // Clear
    d3.select(svgRef.current).selectAll("*").remove();

    // Process data using the utility function
    const processedData = processBarChartData(data);

    // Create scales
    const { xScale, yScale, colorScale } = createChartScales(
      processedData,
      width,
      height,
      margin
    );

    // SVG
    const svg = d3.select(svgRef.current);

    // First, draw the grid - this needs to come BEFORE the bars
    // Add gridlines for Y axis
    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left},0)`)
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-width + margin.left + margin.right)
          .tickFormat("") //
      )
      .style("stroke", "#33333")
      .style("stroke-opacity", 0.1)
      .style("shape-rendering", "crispEdges")
      .selectAll("line");
    //   .style("stroke-dasharray", "3,3");

    // THEN draw the bars on top
    // groups for each customer type series
    svg
      .append("g")
      .selectAll("g")
      .data(processedData.stackedData)
      .enter()
      .append("g")
      .attr("fill", (d) => colorScale(d.key))
      .selectAll("rect")
      .data((d) => d)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.data.quarter) || 0)
      .attr("y", (d) => yScale(d[1]))
      .attr("height", (d) => yScale(d[0]) - yScale(d[1]))
      .attr("width", xScale.bandwidth())
      .on("mouseover", function (event, d) {
        const custType = d3.select(this.parentNode).datum().key;
        const value = formatCurrency(d[1] - d[0]);

        d3.select(this).attr("stroke", "#000").attr("stroke-width", 1);

        tooltip
          .style("visibility", "visible")
          .html(`<strong>${custType}</strong><br>${value}`)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 30 + "px");
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke", "none");
        tooltip.style("visibility", "hidden");
      });

    // Add totals at the top of each stacked bar group
    const quarterTotals = {};
    processedData.quarters.forEach((quarter) => {
      quarterTotals[quarter] = 0;
      processedData.customerTypes.forEach((custType) => {
        quarterTotals[quarter] +=
          processedData.groupedData[quarter][custType] || 0;
      });
    });

    // After creating your bar rectangles but before adding axes
    // Add labels inside each segment showing value and percentage

    // text labels for each bar segment
    svg
      .append("g")
      .selectAll("g")
      .data(processedData.stackedData)
      .enter()
      .append("g")
      .selectAll("text")
      .data((d) => {
        // For each data point, add the quarter's total for percentage calculation
        return d.map((item) => ({
          ...item,
          quarterTotal: quarterTotals[item.data.quarter],
        }));
      })
      .enter()
      .append("text")
      .attr("x", (d) => (xScale(d.data.quarter) || 0) + xScale.bandwidth() / 2)
      .attr("y", (d) => {
        const height = yScale(d[0]) - yScale(d[1]);
        const y = yScale(d[1]) + height / 2;
        return y;
      })
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("fill", "white")
      .style("font-size", "11px")
      .style("font-weight", "medium")
      .style("text-shadow", "0px 0px 2px rgba(0,0,0,0.7)")
      .style("pointer-events", "none")
      .text((d) => {
        const value = d[1] - d[0];
        const height = yScale(d[0]) - yScale(d[1]);
        // percentage based on quarter total
        const percent = ((value / d.quarterTotal) * 100).toFixed(1);

        // text based on bar height
        if (height > 25) {
          return `${formatCompactCurrency(value)}\n(${percent}%)`;
        } else if (height > 15) {
          return formatCompactCurrency(value);
        } else {
          return "";
        }
      });

    // Add X axis

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("text-anchor", "middle") // Center the text
      .attr("dy", ".71em") // Adjust vertical positioning
      .attr("transform", "translate(0,5)"); // Add a little spacing from the axis

    // Add Y axis
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickFormat((d) => `$${d3.format(".2s")(d)}`));

    // Y axis label
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", margin.left / 3)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .text("Annual Contract Value (ACV)");

    // legend
    const legendGroup = svg
      .append("g")
      .attr(
        "transform",
        `translate(${width - margin.right - 100}, ${margin.top})`
      );

    processedData.customerTypes.forEach((custType, i) => {
      const legendRow = legendGroup
        .append("g")
        .attr("transform", `translate(0, ${i * 20})`);

      legendRow
        .append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", colorScale(custType));

      legendRow
        .append("text")
        .attr("x", 15)
        .attr("y", 10)
        .attr("text-anchor", "start")
        .style("font-size", "12px")
        .text(custType);
    });

    // tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "d3-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .style("font-size", "12px")
      .style("pointer-events", "none");

    // Add total labels on top of each bar stack
    svg
      .append("g")
      .selectAll("text")
      .data(Object.entries(quarterTotals))
      .enter()
      .append("text")
      .attr("x", (d) => (xScale(d[0]) || 0) + xScale.bandwidth() / 2)
      .attr("y", (d) => yScale(d[1]) - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text((d) => formatCompactCurrency(d[1]));

    // Clean up function to remove tooltip when component unmounts
    return () => {
      d3.select("body").selectAll(".d3-tooltip").remove();
    };
  }, [data, width, height, margin]);

  return (
    <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ maxWidth: "100%" }}
      ></svg>
    </div>
  );
}

export default BarChart;
