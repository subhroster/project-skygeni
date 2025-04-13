import React from "react";
import {
  Card as MuiCard,
  CardContent,
  CardHeader,
  Typography,
  Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";

// Styled components
const StyledCard = styled(MuiCard)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  borderRadius: theme.spacing(1),
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
  },
}));

const CardContentWrapper = styled(CardContent)({
  flexGrow: 1,
  padding: "16px",
});

interface CardProps {
  title: string;
  subheader?: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, subheader, children }) => {
  return (
    <StyledCard>
      <CardHeader
        title={title}
        subheader={subheader}
        titleTypographyProps={{ variant: "h6" }}
        subheaderTypographyProps={{ variant: "subtitle2" }}
      />
      <CardContentWrapper>{children}</CardContentWrapper>
    </StyledCard>
  );
};

export default Card;
