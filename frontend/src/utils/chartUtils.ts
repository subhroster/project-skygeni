import * as d3 from "d3";

export interface DataItem {
  count: number;
  acv: number;
  closed_fiscal_quarter: string;
  Cust_Type: string;
}

// Process data for stacked bar chart
export function processBarChartData(data: DataItem[]) {
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

  return {
    quarters,
    customerTypes,
    groupedData,
    stackedData
  };
}

// Create scales for the bar chart
export function createChartScales(
  data: ReturnType<typeof processBarChartData>,
  width: number,
  height: number, 
  margin: { top: number; right: number; bottom: number; left: number }
) {
  const { quarters, stackedData } = data;

  // X scale
  const xScale = d3
    .scaleBand()
    .domain(quarters)
    .range([margin.left, width - margin.right])
    .padding(0.3);

  // Y scale
  const yMax = d3.max(stackedData, (layer) => d3.max(layer, (d) => d[1])) || 0;

  const yScale = d3
    .scaleLinear()
    .domain([0, yMax])
    .range([height - margin.bottom, margin.top]);

  // Color scale
  const colorScale = d3
    .scaleOrdinal<string>()
    .domain(data.customerTypes)
    .range(["#4e79a7", "#f28e2c", "#e15759", "#76b7b2"]);

  return {
    xScale,
    yScale,
    colorScale
  };
}

// Process data for donut chart
export function processDonutChartData(data: DataItem[]) {
  // Processing data by customer_type
  const customerTypeData: { [key: string]: number } = {};
  data.forEach((d) => {
    if (!customerTypeData[d.Cust_Type]) {
      customerTypeData[d.Cust_Type] = 0;
    }
    customerTypeData[d.Cust_Type] += d.acv;
  });

  // Converting to array for d3
  const pieData = Object.entries(customerTypeData).map(([name, value]) => ({
    name,
    value,
  }));

  // Calculate total ACV
  const totalACV = pieData.reduce((sum, item) => sum + item.value, 0);

  return {
    pieData,
    totalACV
  };
}

// Create donut chart generators
export function createDonutGenerators(
  width: number,
  height: number,
  margin: { top: number; right: number; bottom: number; left: number }
) {
  // Calculating radius
  const radius =
    Math.min(
      width - margin.left - margin.right,
      height - margin.top - margin.bottom
    ) / 2;

  // pie generator
  const pie = d3
    .pie<{ name: string; value: number }>()
    .sort(null)
    .value((d) => d.value);

  // arc generator
  //radius*.6 for donut hole
  const arc = d3
    .arc<d3.PieArcDatum<{ name: string; value: number }>>()
    .innerRadius(radius * 0.6)
    .outerRadius(radius);

  // label arc
  const labelArc = d3
    .arc<d3.PieArcDatum<{ name: string; value: number }>>()
    .innerRadius(radius * 0.9)
    .outerRadius(radius * 0.9);

  // color scale
  const colorScale = d3
    .scaleOrdinal<string>()
    .domain([])  // Will be set in the component with actual data
    .range([
      "#4e79a7",
      "#f28e2c",
      "#e15759",
      "#76b7b2",
      "#59a14f",
      "#edc949",
    ]);

  return {
    radius,
    pie,
    arc,
    labelArc,
    colorScale
  };
}

// Format currency
export function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

// Format percentage
export function formatPercent(value: number): string {
  return value.toFixed(1) + '%';
}

// currency fromat in compact form with K/M/B suffixes
export function formatCompactCurrency(value: number): string {
  if (value >= 1000000000) {
    return '$' + (value / 1000000000).toFixed(1) + 'B';
  } else if (value >= 1000000) {
    return '$' + (value / 1000000).toFixed(1) + 'M';
  } else if (value >= 1000) {
    return '$' + (value / 1000).toFixed(0) + 'K';
  } else {
    return '$' + value.toFixed(0);
  }
}