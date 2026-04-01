import { PrismaClient, Prisma, type HttpRequest } from '@prisma/client';
import { Err, Ok, type Result } from '../lib/result.js';
import type { RecordError, RecordNotFoundError } from '../types/errors.js';
import { RecordError as RecordErrorImpl, RecordNotFoundError as RecordNotFoundErrorImpl } from '../types/errors.js';

export interface IRequestRepository {
    create(data: Prisma.HttpRequestCreateInput): Promise<Result<HttpRequest, RecordNotFoundError>>;
    findById(id: string): Promise<Result<HttpRequest, RecordError>>;
    findByCollectionId(collectionId: string): Promise<Result<HttpRequest[], RecordError>>;
    update(id: string, data: Prisma.HttpRequestUpdateInput): Promise<Result<HttpRequest, RecordError>>;
    delete(id: string): Promise<Result<HttpRequest, RecordError>>;
    duplicate(id: string): Promise<Result<HttpRequest, RecordError>>;
}

export class RequestRepository implements IRequestRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async create(data: Prisma.HttpRequestCreateInput): Promise<Result<HttpRequest, RecordNotFoundError>> {
        try {
            const createdRequest = await this.prisma.httpRequest.create({ data });
            return Ok(createdRequest);
        } catch (error: unknown) {
            if (this.isRelationNotFoundError(error)) {
                return Err(new RecordNotFoundErrorImpl('Collection', this.getCollectionIdFromCreateInput(data)));
            }

            return Err(new RecordNotFoundErrorImpl('Collection', this.getCollectionIdFromCreateInput(data)));
        }
    }

    async findById(id: string): Promise<Result<HttpRequest, RecordError>> {
        try {
            const foundRequest = await this.prisma.httpRequest.findUnique({ where: { id } });

            if (foundRequest === null) {
                return Err(new RecordErrorImpl(`HTTPRequest with ID ${id} was not found.`));
            }

            return Ok(foundRequest);
        } catch (error: unknown) {
            return Err(this.toRecordError(error, `Failed to find request with ID ${id}.`));
        }
    }

    async findByCollectionId(collectionId: string): Promise<Result<HttpRequest[], RecordError>> {
        try {
            const requests = await this.prisma.httpRequest.findMany({
                where: { collectionId },
                orderBy: { createdAt: 'desc' }
            });

            return Ok(requests);
        } catch (error: unknown) {
            return Err(this.toRecordError(error, `Failed to list requests for collection ID ${collectionId}.`));
        }
    }

    async update(id: string, data: Prisma.HttpRequestUpdateInput): Promise<Result<HttpRequest, RecordError>> {
        try {
            const updatedRequest = await this.prisma.httpRequest.update({
                where: { id },
                data
            });

            return Ok(updatedRequest);
        } catch (error: unknown) {
            if (this.isRequestNotFoundError(error)) {
                return Err(new RecordErrorImpl(`HTTPRequest with ID ${id} was not found.`));
            }

            return Err(this.toRecordError(error, `Failed to update request with ID ${id}.`));
        }
    }

    async delete(id: string): Promise<Result<HttpRequest, RecordError>> {
        try {
            const deletedRequest = await this.prisma.httpRequest.delete({ where: { id } });
            return Ok(deletedRequest);
        } catch (error: unknown) {
            if (this.isRequestNotFoundError(error)) {
                return Err(new RecordErrorImpl(`HTTPRequest with ID ${id} was not found.`));
            }

            return Err(this.toRecordError(error, `Failed to delete request with ID ${id}.`));
        }
    }

    async duplicate(id: string): Promise<Result<HttpRequest, RecordError>> {
        try {
            const existingRequest = await this.prisma.httpRequest.findUnique({ where: { id } });

            if (existingRequest === null) {
                return Err(new RecordErrorImpl(`HTTPRequest with ID ${id} was not found.`));
            }

            const duplicateData: Prisma.HttpRequestCreateInput = {
                method: existingRequest.method,
                url: existingRequest.url,
                body: existingRequest.body,
                collection: {
                    connect: {
                        id: existingRequest.collectionId
                    }
                }
            };

            if (existingRequest.headers !== null) {
                duplicateData.headers = existingRequest.headers;
            }

            const duplicatedRequest = await this.prisma.httpRequest.create({ data: duplicateData });

            return Ok(duplicatedRequest);
        } catch (error: unknown) {
            return Err(this.toRecordError(error, `Failed to duplicate request with ID ${id}.`));
        }
    }

    private toRecordError(error: unknown, fallbackMessage: string): RecordError {
        if (error instanceof Error) {
            return new RecordErrorImpl(error.message);
        }

        return new RecordErrorImpl(fallbackMessage);
    }

    private isRequestNotFoundError(error: unknown): boolean {
        return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025';
    }

    private isRelationNotFoundError(error: unknown): boolean {
        return error instanceof Prisma.PrismaClientKnownRequestError && (error.code === 'P2025' || error.code === 'P2003');
    }

    private getCollectionIdFromCreateInput(data: Prisma.HttpRequestCreateInput): string {
        const collectionInput = data.collection;

        if ('connect' in collectionInput && collectionInput.connect?.id !== undefined) {
            return collectionInput.connect.id;
        }

        return 'unknown';
    }
}

let requestRepositoryInstance: IRequestRepository | null = null;

export function CreateRequestRepository(prismaClient: PrismaClient = new PrismaClient()): IRequestRepository {
    if (requestRepositoryInstance === null) {
        requestRepositoryInstance = new RequestRepository(prismaClient);
    }

    return requestRepositoryInstance;
}