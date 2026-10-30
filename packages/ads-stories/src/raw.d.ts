// `import text from "./file.svg?raw"` gives the file contents as a string.
declare module "*?raw" {
  const content: string;
  export default content;
}
