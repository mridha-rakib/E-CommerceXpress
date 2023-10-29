// dependencies
const app = require("./app");
const connectDatabase = require("./config/db");
const { serverPort } = require("./secret");

// listen
app.listen(serverPort, async () => {
  console.log(`Server is running at http://localhost:${serverPort}`);
  await connectDatabase();
});
