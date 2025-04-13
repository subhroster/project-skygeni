import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import {
  DataItem,
  processDonutChartData,
  createDonutGenerators,
  formatCurrency,
  formatPercent,
} from "../utils/chartUtils";

interface DonutProps {
  data: DataItem[];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}

function Donut({
  data,
  width = 500,
  height = 400,
  margin = { top: 30, right: 30, bottom: 30, left: 30 },
}: DonutProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    // Clear any previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    // Process data using utility function
    const { pieData, totalACV } = processDonutChartData(data);

    // Get chart generators
    const { radius, pie, arc, labelArc, colorScale } = createDonutGenerators(
      width,
      height,
      margin
    );

    // Update color scale domain with actual data
    colorScale.domain(pieData.map((d) => d.name));

    // Creating the SVG
    const svg = d3.select(svgRef.current);

    // pie chart grouping
    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // pie slices
    const arcs = g
      .selectAll(".arc")
      .data(pie(pieData))
      .enter()
      .append("g")
      .attr("class", "arc");

    // slices
    arcs
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => colorScale(d.data.name))
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .on("mouseover", function (event, d) {
        // Highlight slice
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 0.8)
          .attr("transform", `scale(1.05)`);

        // Show tooltip
        tooltip
          .style("visibility", "visible")
          .html(
            `<strong>${d.data.name}</strong><br>${formatCurrency(d.data.value)}`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 30 + "px");
      })
      .on("mouseout", function () {
        // Restore slice
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 1)
          .attr("transform", `scale(1)`);

        // Hide tooltip
        tooltip.style("visibility", "hidden");
      });

    // Add outer labels with connecting lines
    arcs.each(function (d) {
      // Only add labels for segments that are big enough (more than 3%)
      const percent = (d.data.value / totalACV) * 100;
      if (percent < 3) return;

      // Calculate position for label (outside the pie)
      const pos = labelArc.centroid(d);
      const midAngle = Math.atan2(pos[1], pos[0]);
      const x = Math.cos(midAngle) * (radius * 1.2);
      const y = Math.sin(midAngle) * (radius * 1.2);

      // Create a group for each label
      const labelGroup = d3.select(this).append("g");

      // Add a line from the slice to the label
      labelGroup
        .append("line")
        .attr("x1", arc.centroid(d)[0])
        .attr("y1", arc.centroid(d)[1])
        .attr("x2", x)
        .attr("y2", y)
        .style("stroke", "#333")
        .style("stroke-width", 1);

      // Add a dot at the end of the line
      labelGroup
        .append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 2)
        .style("fill", "#333");

      // Add the percentage text
      labelGroup
        .append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("dx", x > 0 ? 8 : -8)
        .attr("dy", "0.35em")
        .style("font-size", "12px")
        .style("text-anchor", x > 0 ? "start" : "end")
        .text(`${formatPercent(percent)}`);

      // Add the segment name below the percentage
      labelGroup
        .append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("dx", x > 0 ? 8 : -8)
        .attr("dy", "1.5em")
        .style("font-size", "10px")
        .style("fill", "#666")
        .style("text-anchor", x > 0 ? "start" : "end")
        .text(d.data.name);
    });

    // You can still keep the simple percentage labels inside big slices for emphasis
    arcs
      .append("text")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "white")
      .style("pointer-events", "none")
      .text((d) => {
        const percent = (d.data.value / totalACV) * 100;
        return percent > 10 ? formatPercent(percent) : "";
      });

    // center text
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.5em")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Total ACV");

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1em")
      .style("font-size", "16px")
      .text(formatCurrency(totalACV));

    // Add legend
    const legend = svg
      .append("g")
      .attr(
        "transform",
        `translate(${width - margin.right - 100}, ${margin.top})`
      );

    pieData.forEach((item, i) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(0, ${i * 20})`);

      legendRow
        .append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", colorScale(item.name));

      legendRow
        .append("text")
        .attr("x", 15)
        .attr("y", 10)
        .attr("text-anchor", "start")
        .style("font-size", "12px")
        .text(`${item.name} (${formatPercent((item.value / totalACV) * 100)})`);
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

    // removing tooltip when component unmounts
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

export default Donut;
