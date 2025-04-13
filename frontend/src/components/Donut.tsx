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

    // Add labels
    arcs
      .append("text")
      .attr("transform", (d) => `translate(${labelArc.centroid(d)})`)
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", (d) => {
        // percentage
        const percent = (d.data.value / totalACV) * 100;
        return percent > 5 ? "white" : "none"; // Only show text for slices large enough
      })
      .text((d) => {
        // percentage calculation
        const percent = (d.data.value / totalACV) * 100;
        return percent > 5 ? formatPercent(percent) : "";
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
