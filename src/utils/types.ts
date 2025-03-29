import { ChannelType } from 'discord.js';

type Brand<T, U> = T & { __brand: U };

export type UserId = string; // User ID
export type ChannelId<T extends ChannelType> = Brand<string, T>; // Channel ID but branded to a specific channel type
