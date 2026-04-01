
import { PrismaClient, Prisma, type ApiResponse } from '@prisma/client';
import { Err, Ok, type Result } from '../lib/result.js';
import type { RecordError, RecordNotFoundError } from '../types/errors.js';
import { RecordError as RecordErrorImpl, RecordNotFoundError as RecordNotFoundErrorImpl } from '../types/errors.js';

export interface IResponseRepository {
	create(data: Prisma.ApiResponseCreateInput): Promise<Result<ApiResponse, RecordNotFoundError>>;
	findById(id: string): Promise<Result<ApiResponse, RecordError>>;
	findByRequestId(requestId: string): Promise<Result<ApiResponse[], RecordError>>;
	findLatestByRequestId(requestId: string): Promise<Result<ApiResponse, RecordError>>;
	delete(id: string): Promise<Result<ApiResponse, RecordError>>;
	deleteByRequestId(requestId: string): Promise<Result<Prisma.BatchPayload, RecordError>>;
}

export class ResponseRepository implements IResponseRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async create(data: Prisma.ApiResponseCreateInput): Promise<Result<ApiResponse, RecordNotFoundError>> {
		try {
			const createdResponse = await this.prisma.apiResponse.create({ data });
			return Ok(createdResponse);
		} catch (error: unknown) {
			if (this.isRelationNotFoundError(error)) {
				return Err(new RecordNotFoundErrorImpl('HTTPRequest', this.getRequestIdFromCreateInput(data)));
			}

			return Err(new RecordNotFoundErrorImpl('HTTPRequest', this.getRequestIdFromCreateInput(data)));
		}
	}

	async findById(id: string): Promise<Result<ApiResponse, RecordError>> {
		try {
			const foundResponse = await this.prisma.apiResponse.findUnique({ where: { id } });

			if (foundResponse === null) {
				return Err(new RecordErrorImpl(`ApiResponse with ID ${id} was not found.`));
			}

			return Ok(foundResponse);
		} catch (error: unknown) {
			return Err(this.toRecordError(error, `Failed to find response with ID ${id}.`));
		}
	}

	async findByRequestId(requestId: string): Promise<Result<ApiResponse[], RecordError>> {
		try {
			const responses = await this.prisma.apiResponse.findMany({
				where: { requestId },
				orderBy: { createdAt: 'desc' }
			});

			return Ok(responses);
		} catch (error: unknown) {
			return Err(this.toRecordError(error, `Failed to list responses for request ID ${requestId}.`));
		}
	}

	async findLatestByRequestId(requestId: string): Promise<Result<ApiResponse, RecordError>> {
		try {
			const latestResponse = await this.prisma.apiResponse.findFirst({
				where: { requestId },
				orderBy: { createdAt: 'desc' }
			});

			if (latestResponse === null) {
				return Err(new RecordErrorImpl(`No responses found for request ID ${requestId}.`));
			}

			return Ok(latestResponse);
		} catch (error: unknown) {
			return Err(this.toRecordError(error, `Failed to fetch latest response for request ID ${requestId}.`));
		}
	}

	async delete(id: string): Promise<Result<ApiResponse, RecordError>> {
		try {
			const deletedResponse = await this.prisma.apiResponse.delete({ where: { id } });
			return Ok(deletedResponse);
		} catch (error: unknown) {
			if (this.isNotFoundError(error)) {
				return Err(new RecordErrorImpl(`ApiResponse with ID ${id} was not found.`));
			}

			return Err(this.toRecordError(error, `Failed to delete response with ID ${id}.`));
		}
	}

	async deleteByRequestId(requestId: string): Promise<Result<Prisma.BatchPayload, RecordError>> {
		try {
			const deleteResult = await this.prisma.apiResponse.deleteMany({ where: { requestId } });
			return Ok(deleteResult);
		} catch (error: unknown) {
			return Err(this.toRecordError(error, `Failed to delete responses for request ID ${requestId}.`));
		}
	}

	private toRecordError(error: unknown, fallbackMessage: string): RecordError {
		if (error instanceof Error) {
			return new RecordErrorImpl(error.message);
		}

		return new RecordErrorImpl(fallbackMessage);
	}

	private isNotFoundError(error: unknown): boolean {
		return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025';
	}

	private isRelationNotFoundError(error: unknown): boolean {
		return error instanceof Prisma.PrismaClientKnownRequestError && (error.code === 'P2025' || error.code === 'P2003');
	}

	private getRequestIdFromCreateInput(data: Prisma.ApiResponseCreateInput): string {
		const requestInput = data.request;

		if ('connect' in requestInput && requestInput.connect?.id !== undefined) {
			return requestInput.connect.id;
		}

		return 'unknown';
	}
}

let responseRepositoryInstance: IResponseRepository | null = null;

export function CreateResponseRepository(prismaClient: PrismaClient = new PrismaClient()): IResponseRepository {
	if (responseRepositoryInstance === null) {
		responseRepositoryInstance = new ResponseRepository(prismaClient);
	}

	return responseRepositoryInstance;
}