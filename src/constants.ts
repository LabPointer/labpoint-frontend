import constantsJson from "../json/constants.json";

declare global {
  var constants: typeof constantsJson;
}
Object.assign(globalThis, Object.freeze({
    constants: constantsJson,
}));