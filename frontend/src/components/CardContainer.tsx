import React, { useState, useEffect } from "react";
import { Grid, CircularProgress, Box, Typography } from "@mui/material";
import CustomerTypeCard from "./cards/CustomerTypeCard";
import IndustryCard from "./cards/IndustryCard";
import TeamCard from "./cards/TeamCard";
import ACVRangeCard from "./cards/ACVRangeCard";

const API_BASE_URL = "http://localhost:5000/api/data";

const CardContainer: React.FC = () => {
  const [customerTypes, setCustomerTypes] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [teams, setTeams] = useState([]);
  const [acvRanges, setAcvRanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [customerTypesRes, industriesRes, teamsRes, acvRangesRes] =
          await Promise.all([
            fetch(`${API_BASE_URL}/customer-types`),
            fetch(`${API_BASE_URL}/industries`),
            fetch(`${API_BASE_URL}/teams`),
            fetch(`${API_BASE_URL}/acv-ranges`),
          ]);

        if (
          !customerTypesRes.ok ||
          !industriesRes.ok ||
          !teamsRes.ok ||
          !acvRangesRes.ok
        ) {
          throw new Error("Network response was not ok");
        }

        const customerTypesData = await customerTypesRes.json();
        const industriesData = await industriesRes.json();
        const teamsData = await teamsRes.json();
        const acvRangesData = await acvRangesRes.json();

        setCustomerTypes(customerTypesData);
        setIndustries(industriesData);
        setTeams(teamsData);
        setAcvRanges(acvRangesData);
      } catch (err) {
        setError("Failed to fetch data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="50vh"
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3} padding={2}>
      <Grid item xs={12} md={6} lg={3}>
        <CustomerTypeCard data={customerTypes} />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <IndustryCard data={industries} />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <TeamCard data={teams} />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <ACVRangeCard data={acvRanges} />
      </Grid>
    </Grid>
  );
};

export default CardContainer;
