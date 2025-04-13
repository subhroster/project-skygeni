import React from "react";
import { Box, Typography, Divider, Chip } from "@mui/material";
import Card from "../Card";

interface CustomerType {
  count: number;
  acv: number;
  closed_fiscal_quarter: string;
  Cust_Type: string;
}

interface CustomerTypeCardProps {
  data: CustomerType[];
}

const CustomerTypeCard: React.FC<CustomerTypeCardProps> = ({ data }) => {
  // Group by quarter and customer type
  const groupedData: Record<string, Record<string, CustomerType>> = {};

  data.forEach((item) => {
    if (!groupedData[item.closed_fiscal_quarter]) {
      groupedData[item.closed_fiscal_quarter] = {};
    }
    groupedData[item.closed_fiscal_quarter][item.Cust_Type] = item;
  });

  // Calculate totals
  const totalACV = data.reduce((sum, item) => sum + item.acv, 0);
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card
      title="Customer Types"
      subheader={`Total: ${totalCount} deals, $${totalACV.toLocaleString()}`}
    >
      {Object.keys(groupedData)
        .sort()
        .map((quarter) => (
          <Box key={quarter} mb={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              {quarter}
            </Typography>
            <Divider sx={{ mb: 1 }} />

            {Object.keys(groupedData[quarter]).map((custType) => {
              const item = groupedData[quarter][custType];
              return (
                <Box
                  key={custType}
                  display="flex"
                  justifyContent="space-between"
                  mb={1}
                >
                  <Box display="flex" alignItems="center">
                    <Chip
                      label={custType}
                      size="small"
                      color={
                        custType === "New Customer" ? "primary" : "default"
                      }
                      variant="outlined"
                    />
                    <Typography variant="body2" ml={1}>
                      {item.count} deals
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="medium">
                    ${item.acv.toLocaleString()}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        ))}
    </Card>
  );
};

export default CustomerTypeCard;
