import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";

import apiRouter from "./routes/index.js";
import runCpp from "./containers/cppExecutor.js";
import runJava from "./containers/javaExecutor.js";
import serverConfig from "./config/server.config.js";
import SampleWorker from "./workers/SampleWorker.js";
import runPython from "./containers/pythonExecutor.js";
import bullBoardAdapter from "./config/bullboard.config.js";
import SubmissionWorker from "./workers/SubmissionWorker.js";
import SampleProducer from "./producers/sampleQueueProducer.js";
import { SAMPLE_QUEUE, SUBMISSION_QUEUE } from "./utils/constants.js";
import submissionQueueProducer from "./producers/submissionQueueProducer.js";

const app: Express = express();
const { PORT } = serverConfig;

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use("/api", apiRouter);
app.use("/admin/bull-board", bullBoardAdapter.getRouter());

// server listening
app.listen(PORT, async () => {
    console.log(`Server is listening on port: http://localhost:${PORT}`);
    console.log(`Bull Board UI → http://localhost:${PORT}/admin/bull-board`);

    // const code = `
    // #include <bits/stdc++.h>
    // using namespace std;

    // int main() {
    //     int x;
    //     cin >> x;
    //     cout << "Value of x is : " << x << endl;

    //     for(int i = 0; i <= x; i++){
    //     cout << i << " ";
    //     }
    //     return 0;
    // }

    // `.trim();

    // const inputCase = `10`

    // runCpp(code, inputCase);

    SampleWorker(SAMPLE_QUEUE);
    SubmissionWorker(SUBMISSION_QUEUE);

    // submissionQueueProducer({"1234": {
    //     language: "CPP",
    //     inputCase,
    //     code
    // }});
});
