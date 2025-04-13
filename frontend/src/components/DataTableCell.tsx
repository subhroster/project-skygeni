import { styled, TableCell } from "@mui/material";

// Create a separate DataTableCell for data cells only
const DataTableCell = styled(TableCell)(({ theme }) => ({
  padding: "8px 16px",
  textAlign: "center",
  borderRight: `1px solid ${theme.palette.divider}`,
  fontWeight: "400 !important", // Force normal weight
  "&:last-child": {
    borderRight: "none",
  },
}));

export default DataTableCell;
