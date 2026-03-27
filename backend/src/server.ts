import { CreateApp } from "./app.js";
import type { IApp, IServer } from "./contract.js";
import { CreateLoggingService } from "./services/LoggingService.js";


export class HTTPServer implements IServer {
    constructor(private readonly app: IApp) {};

    start(port: number) {
        const expressApp = this.app.getExpressApp();

        expressApp.listen(port, () => {
            console.log(`Server starting on port ${port}`);
        });
    }
}

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const logger = CreateLoggingService();
const app = CreateApp(logger);
const server = new HTTPServer(app);

server.start(PORT);