import { ChannelType, Guild, GuildMember, Snowflake, TextChannel, VoiceChannel } from 'discord.js';
import { ChannelId } from '../utils/types';
import Session from './session';
import ImpostorClient from './client';

export enum SessionError {
	EXISTS,
	NOT_IN_VC,
}

export default class SessionManager {
	private sessions: Map<VoiceChannel['id'], Session> = new Map();
	private guilds: Map<Guild['id'], Set<Session>> = new Map();
	private client: ImpostorClient;

	constructor(client: ImpostorClient) { this.client = client; }

	/**
	 * Handle a member joining a voice channel, possibly a session.
	 * @param member The member who joined the voice channel.
	 * @param voiceChannel The voice channel that the member joined.
	 */
	public async handleMemberJoin(member: GuildMember, voiceChannel: VoiceChannel): Promise<void> {
		const session = this.getSession(voiceChannel);
		if (!session) return;
		await session.handleMemberJoin(member);
	}

	/**
	 * Handle a member leaving a voice channel, possibly a session.
	 * @param member The member who left the voice channel.
	 * @param voiceChannel The voice channel that the member left.
	 */
	public async handleMemberLeave(member: GuildMember, voiceChannel: VoiceChannel): Promise<void> {
		const session = this.getSession(voiceChannel);
		if (!session) return;
		await session.handleMemberLeave(member);
	}

	public getSession(voiceChannel: VoiceChannel): Session | undefined { return this.sessions.get(voiceChannel.id); }
	public destroySession(session: Session): void { this.sessions.delete(session.getVCId()); }

	/**
	 * Create a new session for the given voice channel.
	 * @param voiceChannel The voice channel to create a session for.
	 * @param member The member who created the session.
	 * @param textChannel The text channel that the user used to create the session.
	 * @throws SessionError.EXISTS if a session already exists for the voice channel.
	 * @returns Either the created session or an error.
	 */
	public createSession(
		voiceChannel: VoiceChannel,
		member: GuildMember,
		textChannel: TextChannel,
	): Session | SessionError {
		if (this.getSession(voiceChannel)) return SessionError.EXISTS;

		const session = new Session(this.client, voiceChannel, member, textChannel);
		this.sessions.set(voiceChannel.id, session);
		if (!this.guilds.has(voiceChannel.guild.id)) this.guilds.set(voiceChannel.guild.id, new Set());
		this.guilds.get(voiceChannel.guild.id)!.add(session);

		return session;
	}

	/**
	 * Delete all sessions once the client leaves a guild or is kicked.
	 * @param guild The guild to delete sessions from.
	 */
	public leaveGuild(guild: Guild): void {
		const sessions = this.guilds.get(guild.id);
		if (!sessions) return;

		for (const session of sessions)
			session.destroySession(false);

		this.guilds.delete(guild.id);
	}
}
