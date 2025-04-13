const fs = require("fs");
const path = require("path");

const readJSON = (fileName) =>
  JSON.parse(
    fs.readFileSync(path.join(__dirname, `../data/${fileName}`), "utf-8")
  );

// Individual data type endpoints
exports.getCustomerTypes = (req, res) => {
  try {
    const customerTypes = readJSON("CustomerType.json");
    res.status(200).json(customerTypes);
  } catch (error) {
    console.error("Error loading customer types data:", error);
    res.status(500).json({ error: "Failed to load customer types data" });
  }
};

exports.getIndustries = (req, res) => {
  try {
    const industries = readJSON("AccountIndustry.json");
    res.status(200).json(industries);
  } catch (error) {
    console.error("Error loading industries data:", error);
    res.status(500).json({ error: "Failed to load industries data" });
  }
};

exports.getTeams = (req, res) => {
  try {
    const teams = readJSON("Team.json");
    res.status(200).json(teams);
  } catch (error) {
    console.error("Error loading teams data:", error);
    res.status(500).json({ error: "Failed to load teams data" });
  }
};

exports.getACVRanges = (req, res) => {
  try {
    const acvRanges = readJSON("ACVRange.json");
    res.status(200).json(acvRanges);
  } catch (error) {
    console.error("Error loading ACV ranges data:", error);
    res.status(500).json({ error: "Failed to load ACV ranges data" });
  }
};
