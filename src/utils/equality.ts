import { GuildMember } from "discord.js";
import Session from "../lib/session";

export function isOwner(session: Session, member: GuildMember): boolean {
    return session.getOwner().id === member.id;
}

export function isBot(member: GuildMember): boolean {
    return member.user.bot;
}