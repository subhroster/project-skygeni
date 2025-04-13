import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface DataItem {
  count: number;
  acv: number;
  closed_fiscal_quarter: string;
  Cust_Type: string;
}

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

    // get quarters and customer types
    const quarters = Array.from(
      new Set(data.map((d) => d.closed_fiscal_quarter))
    ).sort();
    const customerTypes = Array.from(new Set(data.map((d) => d.Cust_Type)));

    // stacking
    const groupedData: {
      [quarter: string]: { [custType: string]: number } & { quarter: string };
    } = {};

    quarters.forEach((quarter) => {
      groupedData[quarter] = { quarter };
      customerTypes.forEach((custType) => {
        groupedData[quarter][custType] = 0;
      });
    });

    data.forEach((d) => {
      groupedData[d.closed_fiscal_quarter][d.Cust_Type] += d.acv;
    });

    const stackedData = d3
      .stack<any>()
      .keys(customerTypes)
      .value((d, key) => d[key] || 0)(Object.values(groupedData));

    //  scales
    const xScale = d3
      .scaleBand()
      .domain(quarters)
      .range([margin.left, width - margin.right])
      .padding(0.3);

    const yMax =
      d3.max(stackedData, (layer) => d3.max(layer, (d) => d[1])) || 0;

    const yScale = d3
      .scaleLinear()
      .domain([0, yMax])
      .range([height - margin.bottom, margin.top]);

    // color scale
    const colorScale = d3
      .scaleOrdinal<string>()
      .domain(customerTypes)
      .range(["#4e79a7", "#f28e2c", "#e15759", "#76b7b2"]);

    // SVG
    const svg = d3.select(svgRef.current);

    // groups for each customer type series
    svg
      .append("g")
      .selectAll("g")
      .data(stackedData)
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
        const value = (d[1] - d[0]).toLocaleString();

        d3.select(this).attr("stroke", "#000").attr("stroke-width", 1);

        tooltip
          .style("visibility", "visible")
          .html(`<strong>${custType}</strong><br>$${value}`)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 30 + "px");
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke", "none");

        tooltip.style("visibility", "hidden");
      });

    // Add X axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

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

    customerTypes.forEach((custType, i) => {
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

    // Add tooltip
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
