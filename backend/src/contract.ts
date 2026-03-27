import type express from "express";

/**
 * Interface for app
 */
export interface IApp {
    /**
     * Returns the express app instance
     */
    getExpressApp(): express.Express;
}

/**
 * Interface for a server process that can listen on a port
 */

export interface IServer {
    start(port: number): void;
}