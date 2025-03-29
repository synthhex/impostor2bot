import { ChannelType, GuildMember, Snowflake, TextChannel, VoiceChannel } from "discord.js";
import { ChannelId } from "../utils/types";
import ImpostorClient from "./client";
import { log } from "../utils/logger";

export default class Session {
    public voiceChannel: VoiceChannel
    public user: GuildMember;
    public textChannel: TextChannel;
    public createdAt: Date;

    public muted: boolean = false;

    private client: ImpostorClient;

    constructor(client: ImpostorClient, voiceChannel: VoiceChannel, user: GuildMember, textChannel: TextChannel) {
        this.voiceChannel = voiceChannel;
        this.user = user;
        this.textChannel = textChannel;
        this.createdAt = new Date();

        this.client = client;
    }

    public userJoined(user: GuildMember) {
        if (this.muted && !user.voice.serverMute)
            user.voice.setMute(true, 'In discussion phase.');
        if (!this.muted && user.voice.serverMute)
            user.voice.setMute(false, 'Not in discussion phase.');
    }

    public userLeft(user: GuildMember, switched: boolean = false) {
        if (this.muted && user.voice.serverMute)
            if (switched) // if the user switched channels, let the other sessions handle it
                user.voice.setMute(false, 'Left session.');
            else
                this.client.free(user); // (remember to) unmute the user if they left the session

        if (user.id === this.user.id)
            this.client.sessionManager.deleteSession(this.voiceChannel);
    }

    public changeOwner(user: GuildMember) {
        if (this.user.id === user.id) return;
        this.user = user;
    }

    public async mute() {
        this.muted = true;

        console.log(this.user.displayName, this.voiceChannel.members.map((member) => member.displayName));
        const voiceChannel = await this.voiceChannel.fetch();

        if (voiceChannel) {
            voiceChannel.members.forEach((member) => {
                console.log(member.voice);
                console.log(member.displayName, '1');
                if (member.id === this.user.id) return;
                console.log(member.displayName, '2');
                if (member.id === this.client.user?.id) return;
                console.log(member.displayName, '3');
                if (member.voice.serverMute) return;
                console.log(member.displayName, '4');
                try {
                    member.voice.setMute(true, 'Not in discussion phase.');
                } catch (error) {
                    log(`Error muting member ${member.id}: ${error}`);
                }
            });
        }
    }

    public async unmute() {
        this.muted = false;

        const voiceChannel = await this.voiceChannel.fetch();

        if (voiceChannel) {
            voiceChannel.members.forEach((member) => {
                if (member.id === this.user.id) return;
                if (member.id === this.client.user?.id) return;
                if (!member.voice.serverMute) return;

                try {
                    member.voice.setMute(false, 'In discussion phase.');
                } catch (error) {
                    log(`Error unmuting member ${member.id}: ${error}`);
                }
            });
        }
    }
}