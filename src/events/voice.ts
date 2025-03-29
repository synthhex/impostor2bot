import { ChannelType, Events, VoiceState } from 'discord.js';
import ImpostorClient from '../lib/client';

export const name = Events.VoiceStateUpdate;
export const once = false;
export async function execute(oldState: VoiceState, newState: VoiceState) {
	const client = newState.client as ImpostorClient;

	if (oldState?.member?.user.bot || newState?.member?.user.bot) return; // ignore bot users

	if (oldState.channel === null && newState.channel !== null) {
		// User joined a voice channel.
		if (newState.channel.type !== ChannelType.GuildVoice) return; // ignore non-voice channels

		const session = client.sessionManager.getSession(newState.channel);
		if (!session || !session.muted) {
			if (client.shouldBeFreed(newState.member!) && newState.member!.voice.serverMute)
				return newState.member!.voice.setMute(false, 'Left while previously muted.');
			return;
		}

		session.userJoined(newState.member!); // let the session handle the user joining
	} else if (oldState.channel !== null && newState.channel === null) {
		// User left a voice channel.
		if (oldState.channel.type !== ChannelType.GuildVoice) return; // ignore non-voice channels

		const session = client.sessionManager.getSession(oldState.channel);
		if (!session) return; // ignore if the session doesn't exist, whatever

		session.userLeft(oldState.member!); // let the session handle the user leaving
	} else if (oldState.channel !== null && newState.channel !== null) {
		// User switched voice channels. The most complicated one.
		if (oldState.channelId === newState.channelId && oldState.channel.type === ChannelType.GuildVoice) {
			// User didn't actually switch channels, just updated their voice state.
			const session = client.sessionManager.getSession(oldState.channel);
			if (oldState.member!.id === session?.user.id) {
				// If the user is the one who created the session, toggle the session.
				if (oldState.selfMute && !newState.selfMute) session.unmute();
				else if (!oldState.selfMute && newState.selfMute) session.mute();
				return;
			}
			return;
		}

		if (oldState.channel.type === ChannelType.GuildVoice) {
			// if the old channel is a voice channel
			const session = client.sessionManager.getSession(oldState.channel);
			if (session)
				session.userLeft(
					oldState.member!,
					newState.channel.type === ChannelType.GuildVoice &&
						client.sessionManager.getSession(newState.channel)?.muted === false,
				); // let the session handle the user leaving
		}

		if (newState.channel.type === ChannelType.GuildVoice) {
			// if the new channel is a voice channel
			const session = client.sessionManager.getSession(newState.channel);
			if (session) session.userJoined(newState.member!); // let the session handle the user joining
		}
	}
}
