require("dotenv").config(); 

const express = require("express");
const bodyParser = require("body-parser");
const log = require("../logging_middleware/logger");
console.log("TOKEN:", process.env.TOKEN);
const app = express();
app.use(bodyParser.json());

let notifications = [];

app.post("/notification", (req, res) => {
  try {
    notifications.push(req.body);
    log("backend", "info", "controller", "Notification created");
    res.json({ message: "Notification sent successfully" });
  } catch (err) {
    log("backend", "error", "handler", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/notifications", (req, res) => {
  try {
    log("backend", "info", "controller", "Fetched notifications");
    res.json(notifications);
  } catch (err) {
    log("backend", "error", "handler", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(4000, () => {
  console.log("Server running on port 4000");
});