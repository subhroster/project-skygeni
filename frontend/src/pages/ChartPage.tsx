import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Paper,
  Grid,
  CssBaseline,
} from "@mui/material";
import BarChart from "../components/BarChart";
import Donut from "../components/Donut";
import CustomerSalesTable from "../components/Table";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// data structure types
interface DataItem {
  count: number;
  acv: number;
  closed_fiscal_quarter: string;
  Cust_Type: string;
  [key: string]: any; // For other properties
}

//  theme
const theme = createTheme({
  typography: {
    fontFamily: [
      "Open Sans",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
  },
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

const ChartPage: React.FC = () => {
  const [customerTypes, setCustomerTypes] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          "http://localhost:5000/api/data/customer-types"
        );

        if (!response.ok) {
          throw new Error(`API returned status: ${response.status}`);
        }

        const data = await response.json();
        setCustomerTypes(data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, width: "100%", pb: 4 }}>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Typography variant="h4" gutterBottom align="left" sx={{ mb: 3 }}>
            Sales Performance Dashboard
          </Typography>

          {loading ? (
            <Box
              height="500px"
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box
              height="500px"
              display="flex"
              justifyContent="center"
              alignItems="center"
              flexDirection="column"
            >
              <Typography color="error" gutterBottom>
                {error}
              </Typography>
              <Typography variant="body2">
                Please check your connection and try again.
              </Typography>
            </Box>
          ) : (
            <>
              {/* Top row for charts */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                {/* Left column - Bar Chart */}
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      height: 450,
                    }}
                  >
                    <Typography variant="h6" gutterBottom align="left">
                      Won ACV Mix by Customer Type
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                      align="left"
                    >
                      Distribution of ACV across quarters
                    </Typography>
                    <Box height="calc(100% - 60px)" mt={2}>
                      <BarChart data={customerTypes} height={360} />
                    </Box>
                  </Paper>
                </Grid>

                {/* Right column - Donut Chart */}
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      height: 450,
                    }}
                  >
                    <Typography variant="h6" gutterBottom align="left">
                      Customer Type Distribution
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                      align="left"
                    >
                      Proportion of deals by customer type
                    </Typography>
                    <Box height="calc(100% - 60px)" mt={2}>
                      <Donut data={customerTypes} height={360} />
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              {/* Bottom row - Full-width Table */}
              <Grid container>
                <Grid item xs={12}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="h6" gutterBottom align="left">
                      Customer Data Summary
                    </Typography>
                    <CustomerSalesTable data={customerTypes} />
                  </Paper>
                </Grid>
              </Grid>
            </>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default ChartPage;
