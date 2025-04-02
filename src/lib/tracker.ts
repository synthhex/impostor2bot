import { GuildMember } from "discord.js";
import { VoiceUpdateReason } from "../utils/voice";

export default class Tracker {
    private static mutes: Set<GuildMember['id']> = new Set();

    constructor() { throw new Error("This class cannot be instantiated."); }

    /**
     * Stash a mute for a session leaver.
     * This happens when a user leaves an active Among Us session while the lobby is muted.
     * Since they are not in a voice channel anymore, we cannot unmute them.
     * We need to stash them in a list and unmute them when they rejoin any voice channel.
     * This is a workaround for the Discord API not allowing us to unmute users who are not in a voice channel.
     * @param member A guild member.
     * @returns 
     */
    public static stashMute(member: GuildMember): boolean {
        if (this.mutes.has(member.id)) return false;
        this.mutes.add(member.id);
        return true;
    }

    /**
     * Unmute a previously muted session leaver and remove them from the mute list.
     * @param member A guild member.
     * @returns 
     */
    public static popMute(member: GuildMember): boolean {
        if (!this.mutes.has(member.id)) return false;
        try {
            member.voice.setMute(false, VoiceUpdateReason.SESSION_LEAVER);
        } catch (error) {

        }
        return this.mutes.delete(member.id);
    }
}