import path from 'path';
import fs from 'fs';
import { tryReadEnv } from './env';

export default class Logger {
	private static path = path.join(__dirname, '..', '..', 'log.txt');
	private static store: boolean = process.env.STORE_LOGS !== undefined ? process.env.STORE_LOGS === 'true' : true;

	public static log(message: string): void {
		const timestamp = new Date().toISOString();
		const formattedMessage = `[${timestamp}] ${message}`;
		console.log(formattedMessage);
		if (!Logger.store) return;
		this.appendToFile(formattedMessage + '\n');
	}

	public static error(message: string): void {
		const timestamp = new Date().toISOString();
		const formattedMessage = `[${timestamp}] ERROR: ${message}`;
		console.error(formattedMessage);
		if (!Logger.store) return;
		this.appendToFile(formattedMessage + '\n');
	}

	public static warn(message: string): void {
		const timestamp = new Date().toISOString();
		const formattedMessage = `[${timestamp}] WARNING: ${message}`;
		console.warn(formattedMessage);
		if (!Logger.store) return;
		this.appendToFile(formattedMessage + '\n');
	}

	private static appendToFile(message: string): void {
		fs.appendFile(this.path, message, (err: any) => {
			if (err) {
				console.error('Error writing to log file:', err);
			}
		});
	}
}