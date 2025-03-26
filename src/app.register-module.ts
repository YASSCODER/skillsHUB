import { Application, Router, Request, Response } from "express";
import logger from "./common/utils/logger";
import UserModule from "./modules/user/user.module";
import BadgeModule from "./modules/badge/badge.module";
import ChallengeModule from "./modules/challenge/challange.module";
import FeedbackModule from "./modules/feedback/feedback.module";
import RoleModule from "./modules/roles/role.module";
import WalletModule from "./modules/wallet/wallet.module";
import RewardModule from "./modules/reward/reward.module";

interface Module {
  path: string;
  handler: Router;
}

const modules: Module[] = [
  UserModule,
  BadgeModule,
  ChallengeModule,
  FeedbackModule,
  RoleModule,
  WalletModule,
  RewardModule
];

const appRegisterModules = (app: Application): void => {
  const apiPrefix = "/api";
  modules.forEach((module) => {
    app.use(`${apiPrefix}${module.path}`, module.handler);
    logger.info(`[ModuleResolver] Mapped {${module.path}} module`);

    module.handler.stack.forEach((middleware: any) => {
      if (middleware.route) {
        const method = Object.keys(middleware.route.methods)[0].toUpperCase();
        const path = middleware.route.path;
        logger.info(
          `[RoutesResolver] Mapped {${method} ${apiPrefix}${module.path}${path}}`
        );
      }
    });
  });

  if (modules.length === 0) {
    logger.warn("[RoutesResolver] No modules found. Add modules to the array.");
  }
};

export default appRegisterModules;
