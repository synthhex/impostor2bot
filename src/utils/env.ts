import { config } from 'dotenv';

config({ path: 'secrets.env' });

/**
 * Try to read an environment variable and parse it as JSON.
 * @param env The target name of the environment variable.
 * @param expected The expected type of the environment variable.
 * @returns The parsed value of the environment variable.
 */
export function tryReadEnv<T>(env: string, expected: StringConstructor | NumberConstructor): T {
	const value = process.env[env];
	if (value === undefined) {
		throw new Error(`Environment variable ${env} is not set`);
	}
	try {
		const parsed = expected === String ? value : parseInt(value, 10);
		return parsed as T;
	} catch (error) {
		throw new Error(`Failed to parse environment variable ${env}: ${error}`);
	}
}
