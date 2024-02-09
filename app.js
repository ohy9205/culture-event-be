const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const dotenv = require("dotenv");
const schedule = require("node-schedule");
const cors = require("cors");

dotenv.config();

// NOTE Router 추가

// NOTE DB 설정, Passport 설정
const { sequelize } = require("./models");
const { getNewEventData, getInitialData } = require("./utils/getEventData");
const v1 = require("./routes/v1");
const v2 = require("./routes/v2");
const auth = require("./routes/auth");
const user = require("./routes/user");
const comment = require("./routes/comment");
const app = express();
app.set("port", process.env.PORT || 3030);

const rule = new schedule.RecurrenceRule();

rule.hour = 23;
rule.minute = 30;
rule.tz = "Asia/Seoul";

schedule.scheduleJob(rule, function () {
  getNewEventData();
});

// NOTE DB 연결
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("데이터베이스 연결 성공");
    getInitialData();
  })
  .catch((err) => {
    console.error(err);
  });

// NOTE Middleware 연결
if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
} else {
  app.use(morgan("dev"));
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(
  cors({
    origin: ["http://localhost:3030", "http://localhost:80"],
    credentials: true,
  })
);

app.use("/v1", v1);
app.use("/v2", v2);
app.use("/auth", auth);
app.use("/user", user);
app.use("/comment", comment);

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  console.log("err middleware", err);
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== "production" ? err : {};
  res.status(err.status || 500);
  res.json({
    result: "fail",
    message: `${err.message}`,
  });
});

const server = app.listen(80, () => {
  console.log(app.get("port"), "번 포트에서 대기 중");
});

// Gracefully closing the database connection
function gracefulShutdown() {
  console.log("Closing server...");
  server.close(() => {
    console.log("Server closed.");

    console.log("Closing database connection...");
    sequelize
      .close()
      .then(() => {
        console.log("Database connection closed.");
        process.exit(0);
      })
      .catch((err) => {
        console.error("Error during database connection close:", err);
        process.exit(1);
      });
  });
}

// Listen for TERM signal .e.g. kill
process.on("SIGTERM", gracefulShutdown);

// Listen for INT signal e.g. Ctrl-C
process.on("SIGINT", gracefulShutdown);
