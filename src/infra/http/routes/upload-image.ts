import { uploadImage } from '@/app/functions/upload-image'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { isErr, isSuccess, unwrapEither } from '@/shared/either'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

const MAX_FILE_SIZE = 1024 * 1024 * 2 // 1kb * 1kb * 2 = 2mb

export const uploadImageRoute: FastifyPluginAsyncZod = async server => {
	server.post(
		'/uploads',
		{
			schema: {
				summary: 'Upload an image',
				tags: ['uploads'],
				consumes: ['multipart/form-data'],
				response: {
					201: z.object({ url: z.string() }),
					400: z.object({ message: z.string() }),
				},
			},
		},
		async (request, reply) => {
			const uploadedFile = await request.file({
				limits: {
					fileSize: MAX_FILE_SIZE,
				},
			})

			if (!uploadedFile) {
				return reply.status(400).send({ message: 'File is required' })
			}

			const result = await uploadImage({
				fileName: uploadedFile.filename,
				contentType: uploadedFile.mimetype,
				contentStream: uploadedFile.file,
			})

			if (uploadedFile.file.truncated) {
				return reply.status(400).send({
					message: 'File size limit reached',
				})
			}

			if (isSuccess(result)) {
				return reply.status(201).send({ url: unwrapEither(result).url })
			}

			const error = unwrapEither(result)

			switch (error.constructor.name) {
				case 'InvalidFileFormat':
					return reply.status(400).send({ message: error.message })
			}
		}
	)
}
