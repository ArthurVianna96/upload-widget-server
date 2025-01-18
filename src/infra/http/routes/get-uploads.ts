import { getUploads } from '@/app/functions/get-uploads'
import { uploadImage } from '@/app/functions/upload-image'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { isErr, isSuccess, unwrapEither } from '@/shared/either'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

const MAX_FILE_SIZE = 1024 * 1024 * 2 // 1kb * 1kb * 2 = 2mb

export const getUploadsRoute: FastifyPluginAsyncZod = async server => {
	server.get(
		'/uploads',
		{
			schema: {
				summary: 'Upload an image',
				tags: ['uploads'],
				querystring: z.object({
					searchQuery: z.string().optional(),
					sortBy: z.enum(['createdAt']).optional(),
					sortDirection: z.enum(['asc', 'desc']).optional(),
					page: z.coerce.number().optional().default(1),
					pageSize: z.coerce.number().optional().default(20),
				}),
				response: {
					200: z.object({
						uploads: z.array(
							z.object({
								id: z.string(),
								name: z.string(),
								remoteKey: z.string(),
								remoteUrl: z.string(),
								createdAt: z.date(),
							})
						),
						total: z.number(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { page, pageSize, sortBy, sortDirection, searchQuery } =
				request.query

			const result = await getUploads({
				page,
				pageSize,
				sortBy,
				sortDirection,
				searchQuery,
			})

			const { total, uploads } = unwrapEither(result)

			return reply.status(200).send({
				uploads,
				total,
			})
		}
	)
}
