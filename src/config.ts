import { ActivityType, ClientOptions, GatewayIntentBits, Options } from "discord.js";

const clientSettings: ClientOptions = { 
    presence: {
        activities: [
            {
            name: "you vent in electrical.",
            type: ActivityType.Watching, // WATCHING
            },
        ],
        status: "online"
    },
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages
    ],
    makeCache: Options.cacheWithLimits({
        MessageManager: 0,
        ApplicationCommandManager: 0,
        ApplicationEmojiManager: 0,
        AutoModerationRuleManager: 0,
        BaseGuildEmojiManager: 0,
        DMMessageManager: 0,
        EntitlementManager: 0,
        GuildBanManager: 0,
        GuildEmojiManager: 0,
        GuildForumThreadManager: 0,
        GuildInviteManager: 0,
        // GuildMemberManager: 0,
        GuildMessageManager: 0,
        GuildScheduledEventManager: 0,
        GuildStickerManager: 0,
        GuildTextThreadManager: 0,
        PresenceManager: 0,
        ReactionManager: 0,
        ReactionUserManager: 0,
        StageInstanceManager: 0,
        ThreadManager: 0,
        ThreadMemberManager: 0,
        // UserManager: 0,
        // VoiceStateManager: 0,
    })
}

export default clientSettings;