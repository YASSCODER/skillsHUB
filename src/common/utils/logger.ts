import { LoggerHelper } from "../helpers/logger.helpers";

class Logger {
  log(message: string) {
    this.printLog("LOG", message);
  }

  info(message: string) {
    this.printLog("INFO", message);
  }

  warn(message: string) {
    this.printLog("WARN", message);
  }

  /*error(message: string, error: unknown) {
    this.printLog("ERROR", message);
  }*/
error(message: string, error: unknown) {
  const errorMessage = error instanceof Error ? error.stack || error.message : JSON.stringify(error);
  this.printLog("ERROR", `${message} | ${errorMessage}`);
}
  private printLog(level: string, message: string) {
    const timestamp = LoggerHelper.getFormattedTimestamp();
    const processId = LoggerHelper.getProcessId();
    const coloredMessage = LoggerHelper.colorize(level, message);

    console.log(
      `[Express] ${processId} - ${timestamp}     ${level} ${coloredMessage}`
    );
  }
}

const logger = new Logger();
export default logger;
