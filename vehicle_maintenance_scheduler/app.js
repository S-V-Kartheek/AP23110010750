require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const express = require("express");
const bodyParser = require("body-parser");
const cron = require("node-cron");
const axios = require("axios");
const log = require("../logging_middleware/logger");

const app = express();
app.use(bodyParser.json());

let vehicles = [];
let schedules = [];

// ================= BASIC APIs =================

app.post("/vehicle", (req, res) => {
  vehicles.push(req.body);
  log("backend", "info", "controller", "Vehicle added");
  res.json({ message: "Vehicle added successfully" });
});

app.post("/schedule", (req, res) => {
  const data = req.body;

  if (!data || Object.keys(data).length === 0) {
    log("backend", "warn", "controller", "Empty schedule data");
    return res.status(400).json({ message: "Schedule data required" });
  }

  schedules.push(data);

  log("backend", "info", "controller", "Service scheduled");
  res.json({ message: "Scheduled successfully" });
});

app.get("/upcoming", (req, res) => {
  log("backend", "info", "controller", "Fetched schedules");
  res.json(schedules);
});

// ================= CRON =================

cron.schedule("* * * * *", () => {
    log("backend", "info", "cron_job", "Checking schedules");
});

// ================= CORE LOGIC =================

// Fetch depot & vehicle data
const BASE_URL = "http://20.207.122.201/evaluation-service";

async function fetchData() {
  const headers = {
    Authorization: `Bearer ${process.env.TOKEN}`
  };

  const depotRes = await axios.get(`${BASE_URL}/depots`, { headers });
  const vehicleRes = await axios.get(`${BASE_URL}/vehicles`, { headers });

  return {
    depots: depotRes.data.depots,
    vehicles: vehicleRes.data.vehicles
  };
}

// Knapsack algorithm
function optimizeVehicles(vehicles, maxHours) {
  const n = vehicles.length;

  const dp = Array.from({ length: n + 1 }, () =>
    Array(maxHours + 1).fill(0)
  );

  for (let i = 1; i <= n; i++) {
    const { Duration, Impact } = vehicles[i - 1];

    for (let w = 0; w <= maxHours; w++) {
      if (Duration <= w) {
        dp[i][w] = Math.max(
          Impact + dp[i - 1][w - Duration],
          dp[i - 1][w]
        );
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }

  return dp[n][maxHours];
}

// ================= MAIN API =================

app.get("/optimize", async (req, res) => {
  try {
    const { depots, vehicles } = await fetchData();

    const result = depots.map(depot => {
      const bestImpact = optimizeVehicles(
        vehicles,
        depot.MechanicHours
      );

      return {
        depotId: depot.ID,
        maxImpact: bestImpact
      };
    });

    log("backend", "info", "service", "Optimization completed");

    res.json(result);

  } catch (err) {
    log("backend", "error", "service", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ================= START SERVER =================

app.listen(3000, () => {
  console.log("Server running on port 3000");
});