require("dotenv/config");
const errorHandler = require("./middleware/error");
const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const app = express();
const PORT = process.env.PORT || 5000;
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

//routes
const auth = require("./routes/auth");
const user = require("./routes/user");
const project = require("./routes/project");
const task = require("./routes/task");

// * Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
  })
);
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan("combined"));

app.get("/", (req, res) => {
  return res.send("Server is running...");
});

//mount routs
app.use("/api/auth", auth);
app.use("/api/user", user);
app.use("/api/projects", project);
app.use("/api/tasks", task);

app.use(errorHandler);
app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));
