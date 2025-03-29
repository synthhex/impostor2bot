export function log(...args: any[]) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}]`, ...args);
}