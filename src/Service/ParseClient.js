import Parse from "parse";

const PARSE_APPLICATION_ID = "LUkqiHJ0bWoYIGiuEhy8ufNowQIBX193Arg1sFnp";
const PARSE_JAVASCRIPT_KEY = "jsdicEGhltNWaMDBTd4xoOZUd84A6dK1eK5q4DOS";
const PARSE_SERVER_URL = "https://parseapi.back4app.com/";

Parse.initialize(
  PARSE_APPLICATION_ID,
  PARSE_JAVASCRIPT_KEY
);

Parse.serverURL = PARSE_SERVER_URL;

export default Parse;