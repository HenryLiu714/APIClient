import express, { type RequestHandler } from "express";
import cors from "cors";
import 'dotenv/config'

import type { Request, Response } from 'express'
import { type IApp } from "./contract.js";
import type { ILoggingService } from "./services/LoggingService.js";

type AsyncRequestHandler = RequestHandler

function asyncHandler(fn: AsyncRequestHandler) {
  return function (req: Request, res: Response, next: any) {
    return Promise.resolve(fn(req, res, next)).catch(next)
  }
}

export class ExpressApp implements IApp {
    private readonly app: express.Express;

    constructor(
        private readonly logger: ILoggingService
    ) {
        this.app = express();
        this.registerMiddleware();
    }

    registerMiddleware() {
        this.app.use(cors({
            origin: process.env.FRONTEND_URL,
            methods: ['GET', 'POST'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }))
    }

    getExpressApp(): express.Express {
        return this.app;
    }
}

export const CreateApp = (
    logger: ILoggingService
) => new ExpressApp(logger)