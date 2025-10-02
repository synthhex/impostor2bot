import { ChannelType, GuildMember, Snowflake, TextChannel, VoiceChannel } from 'discord.js';
import { ChannelId } from '../utils/types';
import ImpostorClient from './client';	
import Logger from '../utils/logger';
import { isServerMuted, muteMember, unmuteMember, VoiceUpdateReason } from '../utils/voice';
import Tracker from './tracker';
import { isBot } from '../utils/equality';

export enum SessionState {
	MUTED,
	UNMUTED,
	PAUSED
}

export default class Session {
	private client: ImpostorClient;
	private voiceChannel: VoiceChannel;
	private owner: GuildMember;
	private textChannel: TextChannel;
	private destroy: (unmute: boolean) => Promise<void> | void;

	private createdAt: Date = new Date();
	private state: SessionState = SessionState.UNMUTED;

	private optedOut: Set<Snowflake> = new Set();

	constructor(client: ImpostorClient, voiceChannel: VoiceChannel, member: GuildMember, textChannel: TextChannel, destroy?: (...args: any) => void) {
		this.client = client;
		this.voiceChannel = voiceChannel;
		this.owner = member;
		this.textChannel = textChannel;
		this.destroy = destroy ?? (async (unmute: boolean = true) => {
			if (unmute) 
				this.unmute();
			this.client.sessionManager.destroySession(this);
		});
	}

	public isOptedOut(member: GuildMember): boolean { return this.optedOut.has(member.id); }
	public optOut(member: GuildMember): void { this.optedOut.add(member.id); }
	public optIn(member: GuildMember): void { this.optedOut.delete(member.id); }

	public getOwner(): GuildMember { return this.owner; }
	public async changeOwner(member: GuildMember) { 
		await unmuteMember(this.owner, VoiceUpdateReason.SESSION_LEAVER);
		this.owner = member; 
	}
	public isOwner(member: GuildMember): boolean { return this.owner.id === member.id; }
	public isClient(member: GuildMember): boolean { return this.client.user!.id === member.id; }
	public isMuted(): boolean { return this.state === SessionState.MUTED; }
	public async destroySession(unmute: boolean = true): Promise<void> { await this.destroy(unmute); }
	public getVCId(): VoiceChannel['id'] { return this.voiceChannel.id; }

	/**
	 * Process a member who has joined the current session.
	 * @param member The member who joined the session.
	 */
	public async handleMemberJoin(member: GuildMember) {
		if (isBot(member)) return;
		if (this.isOptedOut(member)) return;
		if (this.isMuted() && !isServerMuted(member)) await muteMember(member, VoiceUpdateReason.IN_DISCUSSION);
		if (!this.isMuted() && isServerMuted(member)) await unmuteMember(member, VoiceUpdateReason.NOT_IN_DISCUSSION);
	}

	/**
	 * Process a member who has left the current session.
	 * @param member The member who left the session.
	 */
	public async handleMemberLeave(member: GuildMember) {
		if (isBot(member)) return;
		if (this.isOwner(member)) this.destroy(true);
	}

	/** Process the session's channel being deleted. */
	public async handleChannelDelete() {
		if (this.isMuted()) {
			this.voiceChannel.members.forEach(async (member) => {
				if (this.isOwner(member) || isBot(member)) return;
				if (isServerMuted(member)) Tracker.stashMute(member);
			});
		}
		await this.destroy(false);
	}

	/** Mute the lobby and all members in it. */
	public async mute(): Promise<void> {
		this.state = SessionState.MUTED;

		let voiceChannel: VoiceChannel;
		try {
			voiceChannel = await this.voiceChannel.fetch();
		} catch (error) {
			this.destroySession(false);
			return; // Channel was deleted. This catch should never be hit, but just in case.
		}

		voiceChannel.members.forEach(async (member) => {
			if (this.isOwner(member) || isBot(member)) return;
			if (isServerMuted(member)) return;
			if (this.isOptedOut(member)) return;

			muteMember(member, VoiceUpdateReason.IN_DISCUSSION)
				.catch(() => Logger.warn(`Failed to mute ${member.user.tag} in ${this.voiceChannel.name}.`));
		});
	}

	/** Unmute the lobby and all members in it. */
	public async unmute(): Promise<void> {
		this.state = SessionState.UNMUTED;

		let voiceChannel: VoiceChannel;
		try {
			voiceChannel = await this.voiceChannel.fetch();
		} catch (error) {
			this.destroySession(false);
			return; // Channel was deleted, no need to unmute. Can't anymore anyway.
		}

		voiceChannel.members.forEach(async (member) => {
			if (this.isOwner(member) || isBot(member)) return;
			if (!isServerMuted(member)) return;
			if (this.isOptedOut(member)) return;

			unmuteMember(member, VoiceUpdateReason.NOT_IN_DISCUSSION)
				.catch(() => Logger.warn(`Failed to unmute ${member.user.tag} in ${this.voiceChannel.name}.`));
		});
	}
}
