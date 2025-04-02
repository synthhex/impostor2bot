import { ChannelType, ClientEvents, Events, VoiceChannel, VoiceState } from 'discord.js';
import ImpostorClient from '../lib/client';
import { isGuildVoice, isServerMuted, statVoiceState, VoiceUpdateType } from '../utils/voice';
import Tracker from '../lib/tracker';

export const name = Events.VoiceStateUpdate;
export const once = false;
export async function execute(client: ImpostorClient, ...args: ClientEvents[typeof name]) {
	const [oldState, newState] = args;

	if (oldState === null || newState === null) return; // ignore if the state is null

	const member = oldState.member || newState.member;
	if (!member) return; // ignore if the member is null
	if (member.user.bot) return; // ignore if the user is a bot


	const stateUpdate = statVoiceState(oldState, newState);

	switch (stateUpdate) {
		case VoiceUpdateType.JOINED_CHANNEL: {
			if (!isGuildVoice(newState.channel)) return;
			const joinSession = client.sessionManager.getSession(newState.channel);
			if (joinSession)
				return await joinSession.handleMemberJoin(newState.member!);
			return Tracker.popMute(newState.member!);
		}
		case VoiceUpdateType.LEFT_CHANNEL: {
			if (!isGuildVoice(oldState.channel)) return;
			const leaveSession = client.sessionManager.getSession(oldState.channel);
			if (leaveSession) {
				if (isServerMuted(oldState.member!))
					Tracker.stashMute(oldState.member!);
				return await leaveSession.handleMemberLeave(oldState.member!);
			}
			return;
		}
		case VoiceUpdateType.SWITCHED_FROM_STAGE_TO_VOICE: {
			if (!isGuildVoice(newState.channel)) return;
			const joinSession = client.sessionManager.getSession(newState.channel);
			if (joinSession) return await joinSession.handleMemberJoin(newState.member!);
			return;
		}
		case VoiceUpdateType.SWITCHED_FROM_VOICE_TO_STAGE: {
			const leaveSession = client.sessionManager.getSession(oldState.channel as VoiceChannel);
			if (leaveSession) {
				if (isServerMuted(oldState.member!))
					Tracker.stashMute(oldState.member!);
				return await leaveSession.handleMemberLeave(oldState.member!);
			}
			return;
		}
		case VoiceUpdateType.SWITCHED_VOICE_CHANNELS: {
			if (!isGuildVoice(oldState.channel) || !isGuildVoice(newState.channel)) return;
			const leaveSession = client.sessionManager.getSession(oldState.channel);
			const joinSession = client.sessionManager.getSession(newState.channel);
			if (leaveSession && joinSession) {
				await joinSession.handleMemberJoin(newState.member!);
			} else if (leaveSession && !joinSession) {
				await leaveSession.handleMemberLeave(oldState.member!);
			} else if (!leaveSession && joinSession) {
				await joinSession.handleMemberJoin(newState.member!);
			} else {
				// No sessions involved. Pass.
				return;
			}
		}
	}
}
