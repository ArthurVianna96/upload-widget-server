export type Err<T> = {
	err: T
	success?: never
}

export type Success<U> = {
	err?: never
	success: U
}

export type Either<T, U> = NonNullable<Err<T> | Success<U>>

export const isErr = <T, U>(e: Either<T, U>): e is Err<T> => {
	return e.err !== undefined
}

export const isSuccess = <T, U>(e: Either<T, U>): e is Success<U> => {
	return e.success !== undefined
}

export type UnwrapEither = <T, U>(e: Either<T, U>) => NonNullable<T | U>

export const unwrapEither: UnwrapEither = <T, U>({
	err,
	success,
}: Either<T, U>) => {
	if (success !== undefined && err !== undefined) {
		throw new Error(
			`Received both err and success values at runtime when opening an Either\nErr: ${JSON.stringify(
				err
			)}\nSuccess: ${JSON.stringify(success)}`
		)
	}
	if (err !== undefined) {
		return err as NonNullable<T>
	}
	if (success !== undefined) {
		return success as NonNullable<U>
	}
	throw new Error(
		'Received no err or success values at runtime when opening Either'
	)
}

export const makeErr = <T>(value: T): Err<T> => ({ err: value })

export const makeSuccess = <U>(value: U): Success<U> => ({ success: value })
