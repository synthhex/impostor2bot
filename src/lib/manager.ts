import { ChannelType, GuildMember, Snowflake, TextChannel, VoiceChannel } from "discord.js";
import { ChannelId } from "../utils/types";
import Session from "./session";
import ImpostorClient from "./client";

export enum SessionError {
    EXISTS,
    NOT_IN_VC
}

export default class SessionManager {
    private sessions: Map<ChannelId<ChannelType.GuildVoice>, Session>;
    private client: ImpostorClient;

    constructor(client: ImpostorClient) {
        this.sessions = new Map();
        this.client = client;
    }

    public getSession(voiceChannel: VoiceChannel): Session | undefined {
        return this.sessions.get(voiceChannel.id as ChannelId<ChannelType.GuildVoice>);
    }
    
    public createSession(voiceChannel: VoiceChannel, user: GuildMember, textChannel: TextChannel): Session | SessionError {
        if (this.getSession(voiceChannel))
            return SessionError.EXISTS;
        if (user.voice.channelId !== voiceChannel.id)
            return SessionError.NOT_IN_VC;

        const session = new Session(this.client, voiceChannel, user, textChannel);
        this.sessions.set(voiceChannel.id as ChannelId<ChannelType.GuildVoice>, session);
        return session;
    }

    public deleteSession(voiceChannel: VoiceChannel): boolean {
        this.sessions.get(voiceChannel.id as ChannelId<ChannelType.GuildVoice>)?.unmute();
        return this.sessions.delete(voiceChannel.id as ChannelId<ChannelType.GuildVoice>);
    }
}