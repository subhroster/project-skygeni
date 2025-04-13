const express = require("express");
const router = express.Router();
const {
  getCustomerTypes,
  getIndustries,
  getTeams,
  getACVRanges,
} = require("../controllers/data.controller");

router.get("/customer-types", getCustomerTypes); // GET /api/data/customer-types
router.get("/industries", getIndustries); // GET /api/data/industries
router.get("/teams", getTeams); // GET /api/data/teams
router.get("/acv-ranges", getACVRanges); // GET /api/data/acv-ranges

module.exports = router;
