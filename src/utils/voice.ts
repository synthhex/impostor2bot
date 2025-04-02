import { ChannelType, GuildMember, VoiceChannel, VoiceState } from "discord.js";

export enum VoiceUpdateReason {
    NOT_IN_DISCUSSION = 'Lobby is not in discussion phase.',
    IN_DISCUSSION = 'Lobby is in discussion phase.',
    SESSION_LEAVER = 'Left session before bot could unmute.',
    STOLEN_SESSION = 'A session was stolen by this user.'
}

export enum VoiceUpdateType {
    JOINED_CHANNEL,
    LEFT_CHANNEL,
    SWITCHED_FROM_STAGE_TO_VOICE,
    SWITCHED_FROM_VOICE_TO_STAGE,
    SWITCHED_VOICE_CHANNELS,
    SWITCHED_STAGE_CHANNELS,
    CHANGED_VOICE_STATE
}

export function statVoiceState(oldState: VoiceState, newState: VoiceState) {
    if (oldState.channel === null && newState.channel !== null) return VoiceUpdateType.JOINED_CHANNEL;
    if (oldState.channel !== null && newState.channel === null) return VoiceUpdateType.LEFT_CHANNEL;
    if (oldState.channel !== null && newState.channel !== null) {
        if (oldState.channelId === newState.channelId) return VoiceUpdateType.CHANGED_VOICE_STATE;
        if (oldState.channel.type === ChannelType.GuildStageVoice && newState.channel.type === ChannelType.GuildVoice) return VoiceUpdateType.SWITCHED_FROM_STAGE_TO_VOICE;
        if (oldState.channel.type === ChannelType.GuildVoice && newState.channel.type === ChannelType.GuildStageVoice) return VoiceUpdateType.SWITCHED_FROM_VOICE_TO_STAGE;
        if (oldState.channel.type === ChannelType.GuildVoice && newState.channel.type === ChannelType.GuildVoice) return VoiceUpdateType.SWITCHED_VOICE_CHANNELS;
        if (oldState.channel.type === ChannelType.GuildStageVoice && newState.channel.type === ChannelType.GuildStageVoice) return VoiceUpdateType.SWITCHED_STAGE_CHANNELS;
    }
    throw new Error('Invalid voice state update.');
}

export function isMuted(member: GuildMember): boolean { return member.voice.selfMute ?? false; }
export function isServerMuted(member: GuildMember): boolean { return member.voice.serverMute ?? false; }

export async function muteMember(member: GuildMember, reason: VoiceUpdateReason): Promise<void> { await member.voice.setMute(true, reason); }
export async function unmuteMember(member: GuildMember, reason: VoiceUpdateReason): Promise<void> { await member.voice.setMute(false, reason); }

export function isGuildVoice(channel: VoiceState['channel']): channel is VoiceChannel { return channel?.type === ChannelType.GuildVoice; }