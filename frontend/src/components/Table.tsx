import React, { useMemo } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  styled,
  Typography,
} from "@mui/material";
import {
  processTableData,
  formatCurrency,
  formatPercent,
} from "../utils/tableDataUtils";

interface DataItem {
  count: number;
  acv: number;
  closed_fiscal_quarter: string;
  Cust_Type: string;
}

interface TableProps {
  data: DataItem[];
}

// Styled components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: "8px 16px",
  textAlign: "center",
  borderRight: `1px solid ${theme.palette.divider}`,
  //   fontWeight: "100 !important",
  "&:last-child": {
    borderRight: "none",
  },
}));

const HeaderTableCell = styled(StyledTableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  //   fontWeight: "bold",
}));

const SubHeaderTableCell = styled(StyledTableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  //   fontWeight: "bold",
}));

const TotalRowCell = styled(StyledTableCell)(({ theme }) => ({
  backgroundColor: theme.palette.action.hover,
  //   fontWeight: "bold",
}));

const CustomerSalesTable: React.FC<TableProps> = ({ data }) => {
  const tableData = useMemo(() => processTableData(data), [data]);

  return (
    <TableContainer component={Paper} sx={{ overflowX: "auto", mb: 3 }}>
      <Table size="small" sx={{ minWidth: 650, borderCollapse: "collapse" }}>
        <TableHead>
          <TableRow>
            {/* First row header */}
            <HeaderTableCell
              sx={{
                backgroundColor: "white",
                color: "text.primary",
                whiteSpace: "nowrap",
              }}
            >
              <Typography variant="subtitle2" fontWeight="medium">
                Closed Fiscal Quarter
              </Typography>
            </HeaderTableCell>

            {/*  Main quarter headers spanning 3 columns each */}
            {tableData.quarters.map((quarter, idx) => (
              <HeaderTableCell
                key={quarter}
                colSpan={3}
                sx={{
                  backgroundColor: idx % 2 === 0 ? "#1976d2" : "#2196f3",
                  color: "white",
                }}
              >
                {quarter}
              </HeaderTableCell>
            ))}
          </TableRow>
          <TableRow>
            {/* Cust Type header in second row */}
            <SubHeaderTableCell
              sx={{
                backgroundColor: "white",
                color: "text.primary",
                whiteSpace: "nowrap",
              }}
            >
              Cust Type
            </SubHeaderTableCell>

            {/* Second row headers for each quarter */}
            {tableData.quarters.map((quarter) => (
              <React.Fragment key={`${quarter}-headers`}>
                <SubHeaderTableCell
                  sx={{
                    backgroundColor: "white",
                    color: "black",
                  }}
                >
                  # of Opps
                </SubHeaderTableCell>
                <SubHeaderTableCell
                  sx={{
                    backgroundColor: "white",
                    color: "black",
                  }}
                >
                  ACV
                </SubHeaderTableCell>
                <SubHeaderTableCell
                  sx={{
                    backgroundColor: "white",
                    color: "black",
                  }}
                >
                  % of Total
                </SubHeaderTableCell>
              </React.Fragment>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {/* Existing Customer Row */}
          <TableRow
            sx={{
              "&:nth-of-type(odd)": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
            }}
          >
            <StyledTableCell sx={{ textAlign: "left" }}>
              Existing Customer
            </StyledTableCell>
            {tableData.quarters.map((quarter) => (
              <React.Fragment key={`${quarter}-existing`}>
                <StyledTableCell>
                  {tableData.data[quarter]["Existing Customer"].count}
                </StyledTableCell>
                <StyledTableCell>
                  {formatCurrency(
                    tableData.data[quarter]["Existing Customer"].acv
                  )}
                </StyledTableCell>
                <StyledTableCell>
                  {formatPercent(
                    tableData.data[quarter]["Existing Customer"].percentOfTotal
                  )}
                </StyledTableCell>
              </React.Fragment>
            ))}
          </TableRow>

          {/* New Customer Row */}
          <TableRow>
            <StyledTableCell sx={{ textAlign: "left" }}>
              New Customer
            </StyledTableCell>
            {tableData.quarters.map((quarter) => (
              <React.Fragment key={`${quarter}-new`}>
                <StyledTableCell>
                  {tableData.data[quarter]["New Customer"].count}
                </StyledTableCell>
                <StyledTableCell>
                  {formatCurrency(tableData.data[quarter]["New Customer"].acv)}
                </StyledTableCell>
                <StyledTableCell>
                  {formatPercent(
                    tableData.data[quarter]["New Customer"].percentOfTotal
                  )}
                </StyledTableCell>
              </React.Fragment>
            ))}
          </TableRow>

          {/* Total Row */}
          <TableRow>
            <TotalRowCell sx={{ textAlign: "left" }}>Total</TotalRowCell>
            {tableData.quarters.map((quarter) => (
              <React.Fragment key={`${quarter}-total`}>
                <TotalRowCell>
                  {tableData.data[quarter]["Total"].count}
                </TotalRowCell>
                <TotalRowCell>
                  {formatCurrency(tableData.data[quarter]["Total"].acv)}
                </TotalRowCell>
                <TotalRowCell>
                  {formatPercent(
                    tableData.data[quarter]["Total"].percentOfTotal
                  )}
                </TotalRowCell>
              </React.Fragment>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CustomerSalesTable;
