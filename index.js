const express = require("express");
const connectDB = require("./config/db");
const app = express();

connectDB();

const userRoutes = require("./routes/user");
const taskRoutes = require("./routes/task");

app.use(express.json({ extended: false }));

app.use("/user", userRoutes);
app.use("/task", taskRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is started on port ${PORT}`);
});
