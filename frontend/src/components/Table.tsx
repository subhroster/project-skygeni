import React, { useMemo, useState } from "react";
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
  IconButton,
  Tooltip,
  Snackbar,
} from "@mui/material";
import FileCopyOutlinedIcon from "@mui/icons-material/FileCopyOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
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
  padding: "6px 8px", // Reduce padding
  textAlign: "center",
  borderRight: `1px solid ${theme.palette.divider}`,
  fontSize: "0.8125rem", // Make font slightly smaller
  whiteSpace: "nowrap", // Prevent text wrapping
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
  const [copied, setCopied] = useState(false);

  // Function to handle copying table data
  const handleCopyData = () => {
    // Format data for clipboard
    let copyText =
      "Closed Fiscal Quarter,Customer Type,# of Opps,ACV,% of Total\n";

    tableData.quarters.forEach((quarter) => {
      // Existing customer row
      copyText += `${quarter},Existing Customer,${
        tableData.data[quarter]["Existing Customer"].count
      },${formatCurrency(
        tableData.data[quarter]["Existing Customer"].acv
      )},${formatPercent(
        tableData.data[quarter]["Existing Customer"].percentOfTotal
      )}\n`;

      // New customer row
      copyText += `${quarter},New Customer,${
        tableData.data[quarter]["New Customer"].count
      },${formatCurrency(
        tableData.data[quarter]["New Customer"].acv
      )},${formatPercent(
        tableData.data[quarter]["New Customer"].percentOfTotal
      )}\n`;

      // Total row
      copyText += `${quarter},Total,${
        tableData.data[quarter]["Total"].count
      },${formatCurrency(tableData.data[quarter]["Total"].acv)},${formatPercent(
        tableData.data[quarter]["Total"].percentOfTotal
      )}\n`;
    });

    // Copy to clipboard
    navigator.clipboard.writeText(copyText).then(() => {
      setCopied(true);
    });
  };

  // Update the TableContainer and the copy button styling
  return (
    <TableContainer
      component={Paper}
      sx={{
        mb: 3,
        position: "relative",
        pt: 5, // Keep padding for the button
        maxWidth: "100%", // Ensure it doesn't exceed container width
        width: "auto", // Allow it to size naturally
      }}
    >
      {/* Position the copy button at the top right */}
      <Tooltip title="Copy Table Data">
        <IconButton
          onClick={handleCopyData}
          sx={{
            position: "absolute",
            top: "8px", // Move down slightly to separate from top edge
            right: "8px",
            zIndex: 1,
          }}
        >
          {copied ? (
            <CheckCircleOutlineIcon color="success" fontSize="small" />
          ) : (
            <FileCopyOutlinedIcon fontSize="small" sx={{ color: "#666" }} />
          )}
        </IconButton>
      </Tooltip>

      <Snackbar
        open={copied}
        autoHideDuration={3000}
        onClose={() => setCopied(false)}
        message="Table data copied to clipboard"
      />

      <Table
        size="small"
        sx={{
          borderCollapse: "collapse",
          tableLayout: "fixed", // Important: fixed layout helps control width
          width: "auto", // Let the table size to content
        }}
      >
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
                    whiteSpace: "nowrap",
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
                    whiteSpace: "nowrap",
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
