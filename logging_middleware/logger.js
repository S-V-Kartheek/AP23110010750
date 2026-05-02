require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const axios = require("axios");

const LOG_API = process.env.LOG_API;
const TOKEN = process.env.TOKEN;

async function log(stack, level, pkg, message) {
  try {
    await axios.post(
      LOG_API,
      {
        stack: stack,
        level: level,
        package: pkg,
        message: message
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log(`Log sent: [${level}] ${message}`);

  } catch (err) {
    console.error("Log failed:", err.response?.data || err.message);
  }
}

module.exports = log;