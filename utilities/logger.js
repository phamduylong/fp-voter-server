const log4js = require("log4js");
const path = require("path");
// Other types of logs can also be defined here
// See https://log4js-node.github.io/log4js-node/index.html for more information
log4js.configure({
  appenders: { file: { type: "file", filename: path.join(path.dirname(__dirname), "logFiles/api.log") }, console: { type: "stdout"} },
  categories: { default: { appenders: ["file", "console"], level: "trace"}, API: { appenders: ["file"], level: "trace" } },
});

const logger = log4js.getLogger("API");

module.exports = logger;
