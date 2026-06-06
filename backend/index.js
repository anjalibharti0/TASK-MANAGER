require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const AuthRouter = require("./Routers/AuthRouters");
const TaskRouter = require("./Routers/TaskRouter");
const SubtaskRouter = require("./Routers/SubtaskRouter");
const ContactRouter = require("./Routers/ContactRouter");
const CompanyRouter = require("./Routers/CompanyRouter");
const DealRouter = require("./Routers/DealRouter");

require("./Models/db");

const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello from the server");
});

app.use('/auth', AuthRouter);
app.use("/tasks", TaskRouter);
app.use("/subtasks", SubtaskRouter);
app.use("/contacts", ContactRouter);
app.use("/companies", CompanyRouter);
app.use("/deals", DealRouter);

app.listen(PORT, () => {
    console.log(`Server is running on PORT=${PORT}`);
});
