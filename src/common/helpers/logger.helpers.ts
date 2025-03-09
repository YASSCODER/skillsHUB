import chalk from "chalk";

export class LoggerHelper {
  static getFormattedTimestamp(): string {
    return new Date().toLocaleString();
  }

  static getProcessId(): number {
    return process.pid;
  }

  static colorize(level: string, message: string): string {
    switch (level) {
      case "INFO":
        return chalk.blue(message);
      case "WARN":
        return chalk.yellow(message);
      case "ERROR":
        return chalk.red(message);
      case "LOG":
      default:
        return chalk.white(message);
    }
  }
}
