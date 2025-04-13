interface DataItem {
  count: number;
  acv: number;
  closed_fiscal_quarter: string;
  Cust_Type: string;
  [key: string]: any;
}

interface ProcessedTableData {
  quarters: string[];
  data: Record<string, Record<string, {
    count: number;
    acv: number;
    percentOfTotal: number;
  }>>;
}

/**
 * raw data items into structured table data
 */
export const processTableData = (data: DataItem[]): ProcessedTableData => {
  // Group by quarter and customer type
  const quarterData: Record<string, Record<string, DataItem>> = {};
  const quarters = new Set<string>();
  
  data.forEach(item => {
    quarters.add(item.closed_fiscal_quarter);
    
    if (!quarterData[item.closed_fiscal_quarter]) {
      quarterData[item.closed_fiscal_quarter] = {};
    }
    
    quarterData[item.closed_fiscal_quarter][item.Cust_Type] = item;
  });
  
  // Sort quarters
  const sortedQuarters = Array.from(quarters).sort();
  
  // Calculate totals for each quarter
  const results: Record<string, any> = {};
  let grandTotalCount = 0;
  let grandTotalACV = 0;
  
  sortedQuarters.forEach(quarter => {
    const quarterItems = quarterData[quarter] || {};
    const existingCustomer = quarterItems['Existing Customer'] || { count: 0, acv: 0 };
    const newCustomer = quarterItems['New Customer'] || { count: 0, acv: 0 };
    
    const totalCount = existingCustomer.count + newCustomer.count;
    const totalACV = existingCustomer.acv + newCustomer.acv;
    
    grandTotalCount += totalCount;
    grandTotalACV += totalACV;
    
    results[quarter] = {
      'Existing Customer': {
        count: existingCustomer.count,
        acv: existingCustomer.acv,
        percentOfTotal: totalACV ? (existingCustomer.acv / totalACV) * 100 : 0
      },
      'New Customer': {
        count: newCustomer.count,
        acv: newCustomer.acv,
        percentOfTotal: totalACV ? (newCustomer.acv / totalACV) * 100 : 0
      },
      'Total': {
        count: totalCount,
        acv: totalACV,
        percentOfTotal: 100
      }
    };
  });
  
  // Calculate grand totals by customer type
  const grandTotalExistingCount = sortedQuarters.reduce(
    (sum, q) => sum + (results[q]['Existing Customer']?.count || 0), 
    0
  );
  const grandTotalExistingACV = sortedQuarters.reduce(
    (sum, q) => sum + (results[q]['Existing Customer']?.acv || 0), 
    0
  );
  const grandTotalNewCount = sortedQuarters.reduce(
    (sum, q) => sum + (results[q]['New Customer']?.count || 0), 
    0
  );
  const grandTotalNewACV = sortedQuarters.reduce(
    (sum, q) => sum + (results[q]['New Customer']?.acv || 0), 
    0
  );
  
  results['Total'] = {
    'Existing Customer': {
      count: grandTotalExistingCount,
      acv: grandTotalExistingACV,
      percentOfTotal: grandTotalACV ? (grandTotalExistingACV / grandTotalACV) * 100 : 0
    },
    'New Customer': {
      count: grandTotalNewCount,
      acv: grandTotalNewACV,
      percentOfTotal: grandTotalACV ? (grandTotalNewACV / grandTotalACV) * 100 : 0
    },
    'Total': {
      count: grandTotalCount,
      acv: grandTotalACV,
      percentOfTotal: 100
    }
  };
  
  return {
    quarters: [...sortedQuarters, 'Total'],
    data: results
  };
};

/**
 * Format currency values
 */
export const formatCurrency = (value: number): string => {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

/**
 * Format percentage values
 */
export const formatPercent = (value: number): string => {
  return `${Math.round(value)}%`;
};