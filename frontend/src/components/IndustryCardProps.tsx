import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import Card from "../Card";

interface Industry {
  count: number;
  acv: number;
  closed_fiscal_quarter: string;
  AccountIndustry: string;
}

interface IndustryCardProps {
  data: Industry[];
}

const IndustryCard: React.FC<IndustryCardProps> = ({ data }) => {
  // Group by industry
  const groupedByIndustry: Record<string, Industry[]> = {};

  data.forEach((item) => {
    if (!groupedByIndustry[item.AccountIndustry]) {
      groupedByIndustry[item.AccountIndustry] = [];
    }
    groupedByIndustry[item.AccountIndustry].push(item);
  });

  // Calculate totals for each industry
  const industryTotals = Object.keys(groupedByIndustry).map((industry) => ({
    industry,
    totalACV: groupedByIndustry[industry].reduce(
      (sum, item) => sum + item.acv,
      0
    ),
    totalCount: groupedByIndustry[industry].reduce(
      (sum, item) => sum + item.count,
      0
    ),
  }));

  // Sort by total ACV
  industryTotals.sort((a, b) => b.totalACV - a.totalACV);

  return (
    <Card title="Industries" subheader="Deals by industry">
      {industryTotals.slice(0, 5).map((industry) => (
        <Box key={industry.industry} mb={2}>
          <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
            {industry.industry}
          </Typography>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              {industry.totalCount} deals
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              ${industry.totalACV.toLocaleString()}
            </Typography>
          </Box>
          <Divider sx={{ mt: 1 }} />
        </Box>
      ))}
      {industryTotals.length > 5 && (
        <Typography variant="caption" color="text.secondary">
          + {industryTotals.length - 5} more industries
        </Typography>
      )}
    </Card>
  );
};

export default IndustryCard;
