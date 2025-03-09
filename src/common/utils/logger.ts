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

  error(message: string) {
    this.printLog("ERROR", message);
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
