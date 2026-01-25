import Docker from "dockerode";

import createCppContainer from "./containerFactory.js";
import { CPP_IMAGE } from "../utils/constants.js";
import decodeDockerStream, { escapeForShell } from "./dockerHelper.js";
import pullImage from "./pullImage.js";
import CodeExecutorStrategy, { ExecutionResponse } from "../types/codeExecutorStrategy.js";

class CppExecutor implements CodeExecutorStrategy {
    async execute(
        code: string,
        inputTestCase: string,
        outputTestCase: string,
    ): Promise<ExecutionResponse> {
        console.log(`Initializing cpp docker container`);

        // console.log(code, inputTestCase, outputTestCase);

        await pullImage(CPP_IMAGE);

        const safeCode = escapeForShell(code);
        let rawLogBuffer: Buffer[] = [];

        let runCommand = `echo "${safeCode}" > main.cpp && g++ main.cpp -o main && echo "${inputTestCase}" | ./main`;

        // const pythonDockerContainer = await createPythonContainer(PYTHON_IMAGE, ["python3","-c",code]);
        const cppDockerContainer = await createCppContainer(CPP_IMAGE, [
            "/bin/sh",
            "-c",
            runCommand,
        ]);

        await cppDockerContainer.start();

        console.log("start the docker container");

        const loggerStream = await cppDockerContainer.logs({
            stdout: true,
            stderr: true,
            timestamps: false,
            follow: true, // Weather logs are streamed and returned as a string.
        });

        // attach events on the stream objects to start and stop reading.
        // typeof every chunk is in form of byte.
        // every chunk consist of header -> stdout/stderr
        loggerStream.on("data", (chunk) => {
            rawLogBuffer.push(chunk);
        });

        try {
            const codeResponse: string = await this.fetchDecodedStream(loggerStream, rawLogBuffer);
            return { output: codeResponse, status: "COMPLETED" };
        } catch (error) {
            return { output: error as string, status: "ERROR" };
        } finally {
            // remove the container when done with it.
            await cppDockerContainer.remove();
        }
    }

    fetchDecodedStream(
        loggerStream: NodeJS.ReadableStream,
        rawLogBuffer: Buffer[],
    ): Promise<string> {
        // TODO: cleanup repisitive fetchDecodedStream
        // TODO: May be moved to the docker helper util'

        return new Promise((res, rej) => {
            const timeout = setTimeout(() => {
                console.log("Timeout called");
                rej("TLE");
            }, 2000);
            loggerStream.on("end", () => {
                // This callback executes when the stream ends
                clearTimeout(timeout);
                console.log(rawLogBuffer);
                const completeBuffer = Buffer.concat(rawLogBuffer);
                const decodedStream = decodeDockerStream(completeBuffer);
                // console.log(decodedStream);
                // console.log(decodedStream.stdout);
                if (decodedStream.stderr) {
                    rej(decodedStream.stderr);
                } else {
                    res(decodedStream.stdout);
                }
            });
        });
    }
}

export default CppExecutor;
