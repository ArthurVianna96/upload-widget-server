import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

const MAX_FILE_SIZE = 1024 * 1024 * 2 // 1kb * 1kb * 2 = 2mb

export const uploadImageRoute: FastifyPluginAsyncZod = async server => {
	server.post(
		'/uploads',
		{
			schema: {
				summary: 'Upload an image',
				consumes: ['multipart/form-data'],
				response: {
					201: z.object({ uploadId: z.string() }),
					409: z
						.object({ message: z.string() })
						.describe('Upload already exists'),
				},
			},
		},
		async (request, reply) => {
			const uploadedFile = await request.file({
				limits: {
					fileSize: MAX_FILE_SIZE,
				},
			})

			console.log(uploadedFile)

			return reply.status(201).send({ uploadId: 'test' })
		}
	)
}
