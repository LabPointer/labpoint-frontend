import constantsJson from "../json/constants.json";
import classroomsJson from "../json/classrooms.json";

declare global {
  var constants: typeof constantsJson;
  var classrooms: typeof classroomsJson;
}
Object.assign(globalThis, Object.freeze({
    constants: constantsJson,
    classrooms: classroomsJson,
}));