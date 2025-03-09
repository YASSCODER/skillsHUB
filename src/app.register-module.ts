import { Application, Router, Request, Response } from "express";
import logger from "./common/utils/logger";

interface Module {
  path: string;
  handler: Router;
}

const modules: Module[] = [];

const appRegisterModules = (app: Application): void => {
  const apiPrefix = "/api";
  modules.forEach((module) => {
    app.use(`${apiPrefix}${module.path}`, module.handler);
    logger.info(`[RoutesResolver] Mapped {${module.path}} module`);
  });

  if (modules.length === 0) {
    logger.warn("[RoutesResolver] No modules found. Add modules to the array.");
  }
};

export default appRegisterModules;
