import UserRepo from "./repositories/user.repository.js";
import ProjectRepo from "./repositories/project.repository.js";
import DeploymentRepo from "./repositories/deployment.repository.js";
import LogRepo from "./repositories/log.repository.js";
import AnalyticsRepo from "./repositories/analytics.repository.js";
import ProjectBandwidthRepository from "./repositories/projectBandwidth.repository.js";

import UserService from "./services/user.service.js";
import ProjectService from "./services/project.service.js";
import DeploymentService from "./services/deployment.service.js";
import LogsService from "./services/logs.service.js";
import AnalyticsService from "./services/analytics.service.js";

import ProjectController from "./controllers/projectController.js";
import DeploymentController from "./controllers/deploymentController.js";
import LogsController from "./controllers/logsController.js";
import AnalyticsController from "./controllers/analyticsController.js";

import { client } from "./config/clickhouse.config.js";
import PaymentService from "./services/payment.service.js";
import PaymentController from "./controllers/paymentController.js";
import RedisService from "./cache/redisCache.js";
import { redisClient } from "./config/redis.config.js";
import OtpRepository from "./repositories/otpVerify.repository.js";
import OtpService from "./services/otpVerify.service.js";


export const userRepo = new UserRepo();
export const projectRepo = new ProjectRepo();
export const deploymentRepo = new DeploymentRepo();
export const projectBandwidthRepo = new ProjectBandwidthRepository();
export const otpRepo = new OtpRepository()

export const logRepo = new LogRepo(client);
export const analyticsRepo = new AnalyticsRepo(client);

export const redisCacheService = new RedisService(redisClient)


export const logsService = new LogsService(logRepo, deploymentRepo);
export const otpService = new OtpService(otpRepo)
export const projectService = new ProjectService(projectRepo, userRepo, projectBandwidthRepo, deploymentRepo, logsService, redisCacheService);
export const analyticsService = new AnalyticsService(analyticsRepo, projectBandwidthRepo);
export const userService = new UserService(userRepo, projectService, otpService);
export const deploymentService = new DeploymentService(deploymentRepo, projectRepo, userService, logsService, redisCacheService);
export const paymentService = new PaymentService(userRepo);

export const projectController = new ProjectController(projectService);
export const deploymentController = new DeploymentController(deploymentService);
export const logsController = new LogsController(logsService);
export const analyticsController = new AnalyticsController(analyticsService);
export const paymentController = new PaymentController(paymentService);

