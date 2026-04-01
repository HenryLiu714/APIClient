import { PrismaClient, Prisma, type Collection } from "@prisma/client";
import { Err, Ok, type Result } from "../lib/result.js";
import type { RecordError } from "../types/errors.js";
import { RecordError as RecordErrorImpl } from "../types/errors.js";

export type CollectionWithRequests = Prisma.CollectionGetPayload<{
  include: { requests: true }
}>;

export interface ICollectionRepository {
    create(data: Prisma.CollectionCreateInput): Promise<Result<Collection, RecordError>>;
    findByIdWithRequests(id: string): Promise<Result<CollectionWithRequests, RecordError>>;
    findAll(): Promise<Result<Collection[], RecordError>>;
    update(id: string, data: Prisma.CollectionUpdateInput): Promise<Result<Collection, RecordError>>;
    delete(id: string): Promise<Result<Collection, RecordError>>;
}

  export class CollectionRepository implements ICollectionRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async create(data: Prisma.CollectionCreateInput): Promise<Result<Collection, RecordError>> {
      try {
        const createdCollection = await this.prisma.collection.create({ data });
        return Ok(createdCollection);
      } catch (error: unknown) {
        return Err(this.toRecordError(error, "Failed to create collection."));
      }
    }

    async findByIdWithRequests(id: string): Promise<Result<CollectionWithRequests, RecordError>> {
      try {
        const collection = await this.prisma.collection.findUnique({
          where: { id },
          include: { requests: true }
        });

        if (collection === null) {
          return Err(new RecordErrorImpl(`Collection with ID ${id} was not found.`));
        }

        return Ok(collection);
      } catch (error: unknown) {
        return Err(this.toRecordError(error, `Failed to find collection with ID ${id}.`));
      }
    }

    async findAll(): Promise<Result<Collection[], RecordError>> {
      try {
        const collections = await this.prisma.collection.findMany({
          orderBy: { createdAt: "desc" }
        });

        return Ok(collections);
      } catch (error: unknown) {
        return Err(this.toRecordError(error, "Failed to list collections."));
      }
    }

    async update(id: string, data: Prisma.CollectionUpdateInput): Promise<Result<Collection, RecordError>> {
      try {
        const updatedCollection = await this.prisma.collection.update({
          where: { id },
          data
        });

        return Ok(updatedCollection);
      } catch (error: unknown) {
        if (this.isNotFoundError(error)) {
          return Err(new RecordErrorImpl(`Collection with ID ${id} was not found.`));
        }

        return Err(this.toRecordError(error, `Failed to update collection with ID ${id}.`));
      }
    }

    async delete(id: string): Promise<Result<Collection, RecordError>> {
      try {
        const deletedCollection = await this.prisma.collection.delete({ where: { id } });
        return Ok(deletedCollection);
      } catch (error: unknown) {
        if (this.isNotFoundError(error)) {
          return Err(new RecordErrorImpl(`Collection with ID ${id} was not found.`));
        }

        return Err(this.toRecordError(error, `Failed to delete collection with ID ${id}.`));
      }
    }

    private toRecordError(error: unknown, fallbackMessage: string): RecordError {
      if (error instanceof Error) {
        return new RecordErrorImpl(error.message);
      }

      return new RecordErrorImpl(fallbackMessage);
    }

    private isNotFoundError(error: unknown): boolean {
      return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
    }
}

  let collectionRepositoryInstance: ICollectionRepository | null = null;

  export function CreateCollectionRepository(prismaClient: PrismaClient = new PrismaClient()): ICollectionRepository {
    if (collectionRepositoryInstance === null) {
      collectionRepositoryInstance = new CollectionRepository(prismaClient);
    }

    return collectionRepositoryInstance;
  }

