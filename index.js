import express from "express";
import { bootstrap } from "./src/modules/bootstap.js";
import { scheduleUserCleanup } from "./src/utils/cleanup-jobs.js";

const app = express();

scheduleUserCleanup();

const port = process.env.PORT || 3000;
app.use("/uploads", express.static("uploads"));

bootstrap(app);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
