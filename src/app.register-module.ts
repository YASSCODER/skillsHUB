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
import SalonModule from  "./modules/salon/salon.module"; 
import SessionModule from  "./modules/session/session.module"; 
import EventModule from "./modules/Event/event.module";


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
];

// Ajoutez ce log pour déboguer
console.log('Modules registered:', modules.map(m => m.path));

const appRegisterModules = (app: Application): void => {
  const apiPrefix = "/api"; // Vérifiez ce préfixe
  modules.forEach((module) => {
    app.use(`${apiPrefix}${module.path}`, module.handler);
    logger.info(`[ModuleResolver] Mapped {${module.path}} module`);
    
    // Log pour déboguer
    console.log(`Route registered: ${apiPrefix}${module.path}`);
  });
};

export default appRegisterModules;
