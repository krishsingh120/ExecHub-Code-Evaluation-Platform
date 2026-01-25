import Docker from "dockerode";

async function createContainers(imageName: string, cmdExecutable: string[]) {
    const docker = new Docker();

    const container = docker.createContainer({
        name: `ExecHub-evaluator-${Date.now()}`,
        Image: imageName,
        Cmd: cmdExecutable,

        AttachStdin: true, // To enable input streams
        AttachStdout: true, // To enable output streams
        AttachStderr: true, // To enable error streams

        Tty: false,
        OpenStdin: true, // keep input stream open even no interaction is there.

        HostConfig: {
            // AutoRemove: true,
            Memory: 256 * 1024 * 1024, // 256MB
            CpuShares: 512,
            NetworkMode: "none", // security
        },
    });

    return container;
}

export default createContainers;
