import CppExecutor from "../containers/cppExecutor";
import JavaExecutor from "../containers/javaExecutor";
import PythonExecutor from "../containers/pythonExecutor";
import CodeExecutorStrategy from "../types/codeExecutorStrategy";

export default function codeExecutor(codeLanguage: string): CodeExecutorStrategy | null {
    // console.log("Type of code language: ", typeof codeLanguage);

    if (codeLanguage.toLowerCase() === "java") {
        return new JavaExecutor();
    } else if (codeLanguage.toLowerCase() === "python") {
        return new PythonExecutor();
    } else if (codeLanguage.toLowerCase() === "cpp") {
        return new CppExecutor();
    } else {
        return null;
    }
}
