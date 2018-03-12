/*
* Wildcard module which allows importing HTML to TS files.
*/
declare module "*.html" {
  const value: string;
  export default value;
}
