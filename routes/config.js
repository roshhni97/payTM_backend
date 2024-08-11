const { JWT_SECRET } = require("../config");

// config.js
module.exports = {
  db: {
    host: "localhost",
    user: "root",
    password: "password",
  },
  server: {
    port: 3000,
  },
  JWT_SECRET: "roshani",
};
