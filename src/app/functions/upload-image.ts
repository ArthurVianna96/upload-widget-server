import { Readable } from 'node:stream'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import type { Either } from '@/shared/either'
import { makeErr, makeSuccess } from '@/shared/either'
import { z } from 'zod'
import { InvalidFileFormat } from './errors/invalid-file-format'

const uploadImageInput = z.object({
	fileName: z.string(),
	contentType: z.string(),
	contentStream: z.instanceof(Readable),
})

type UploadImageInput = z.input<typeof uploadImageInput>

const allowedMimeTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp']

export async function uploadImage(
	input: UploadImageInput
): Promise<Either<InvalidFileFormat, { url: string }>> {
	const { contentStream, contentType, fileName } = uploadImageInput.parse(input)

	if (!allowedMimeTypes.includes(contentType)) {
		return makeErr(new InvalidFileFormat())
	}

	// TODO: carregar para o Cloudflare R2

	await db.insert(schema.uploads).values({
		name: fileName,
		remoteKey: fileName,
		remoteUrl: fileName,
	})

	return makeSuccess({ url: '' })
}
