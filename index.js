import express from "express";
import { json } from 'express';
import cors from "cors";
import { bootstrap } from "./src/modules/bootstap.js";
import { webhookStripe } from "./src/utils/webhook.js";

const app = express();

const port = process.env.PORT || 3000;

app.post('/webhook', express.raw({type: 'application/json'}), webhookStripe)

app.use(json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

bootstrap(app);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
