import { z } from 'zod';

export const RequestSchema = z.object({
    id: z.uuid(),
    url: z.url(),
    parameters: z.record(z.string(), z.any()).optional(),
    method: z.enum(['GET', 'POST', 'DELETE', 'PUT']),
    headers: z.record(z.string(), z.string()).optional(),
    body: z.string().optional()
})

export type APIRequest = z.infer<typeof RequestSchema>

export const ResponseSchema = z.object({

})