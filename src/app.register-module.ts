import { Application } from "express";
import logger from "./common/utils/logger";
import UserModule from "./modules/user/user.module";
import CommunityModule from "./modules/community/community.module";
import CommentModule from "./modules/comment/comment.module";
import ForumModel from "./modules/Forum/forum.module";
import BadgeModule from "./modules/badge/badge.module";
import ChallengeModule from "./modules/challenge/challange.module";
import FeedbackModule from "./modules/feedback/feedback.module";
import RoleModule from "./modules/roles/role.module";
import AuthModule from "./modules/auth/auth.modules";
import WalletModule from "./modules/wallet/wallet.module";
import RewardModule from "./modules/reward/reward.module";
import SalonModule, { CalendarModule } from "./modules/salon/salon.module";
import SessionModule from "./modules/session/session.module";
import EventModule from "./modules/Event/event.module";
import MarketplaceModule from "./modules/Marketplace/Marketplace.module";
import ContactModule from "./modules/contact/contact.module";
import CategoryModule from "./modules/Category/Category.module";

const modules = [
  UserModule,
  CommunityModule,
  CommentModule,
  ForumModel,
  BadgeModule,
  ChallengeModule,
  FeedbackModule,
  RoleModule,
  AuthModule,
  WalletModule,
  RewardModule,
  SalonModule,
  SessionModule,
  ForumModel,
  CommunityModule,
  EventModule,
  MarketplaceModule,
  CalendarModule,
  ContactModule,
  CategoryModule,
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
