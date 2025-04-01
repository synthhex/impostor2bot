# impostor2bot

Impostor2Bot is an Among Us Discord bot that allows a user to create a session in a voice channel, muting and unmuting everyone based on the user's self-mute state. By starting a session, you can tie the voice state of everyone in your channel to yours, functionally making you the moderator of the Among Us lobby.

# Add to your server
Click [this link](https://discord.com/oauth2/authorize?client_id=539071732129202176&permissions=39722046243904&integration_type=0&scope=bot) to add Impostor2Bot to your server. It needs the following permissions:

- `View Channels` - [REQUIRED] Self-explanatory.
- `Embed Links` - Reserved for future use.
- `Attach Files` - For image responses to interactions. Can be disabled, but not recommended.
- `Use External Stickers` - See above.
- `Add Reactions` - Reserved for future use.
- `Use Slash Commands` - [REQUIRED] Slash commands, as Impostor2Bot does not have text commands by design.
- `Connect` - To join voice channels, used for sound bites.
- `Mute Members` - [REQUIRED] Among Us sessions can't function otherwise, rendering the bot's primary functionality useless.
- `Use Voice Activity` - Sound bites.
- `Use Sound Board` - More sound bites.
- `Use External Sounds` - Even more sound bites.

# Commands
These are the current commands as of April 1st, 2025:

- `/crew start` - Starts a session in your current voice channel. You need to be in a voice channel that has at least two people total in it.
- `/crew stop` - Stops the session in your current voice channel, if it exists. The owner can run this to stop their own session, OR a moderator with the `MODERATE_USERS` permission can run this to force-stop a session.
- `/crew steal` - Transfers an existing session from its owner to yourself. You must have the `MODERATE_USERS` permission to do so.

# Set up locally
First, you need to create a file named "secrets.env" in the root folder. It needs to contain the following values:

> DISCORD_TOKEN=<YOUR_DISCORD_BOT_TOKEN>
> CLIENT_ID=<THE_ID_OF_YOUR_BOT>
> TEST_GUILD_ID=<YOUR_TEST_GUILD_ID>

The aforementioned test guild is a guild in which you can deploy your slash commands to test them out before deploying them.

# Run locally
You need [node.js](https://nodejs.org) to run this bot. First, run `npm install` to install all dependencies.

Then, you can use the following scripts:

- `npm run start` - To start your built bot.
- `npm run build` - To build your bot.
- `npm run dev` - To directly run your source code with ts-node without building.
- `npm run deploy` - To register ALL slash commands in ALL guilds. WARNING: Do not use this often. There is a harsh rate limit.
- `npm run devloy` - To register ALL slash commands in your TEST guild.

Note: Ordinarily, the bot will attempt to register its commands on its own once it is added to a server.

# Hosting notes
The bot has nearly ALL caches disabled, drastically saving on memory. The following caches are ENABLED:

- Essential caches that discord.js needs to operate the bot. They cannot be disabled, ever.
- `GuildMemberManager` - For storing the owner of a session.
- `UserManager` - For storing the owner of a session.
- `VoiceStateManager` - To track voice states and mute/unmute users.

The baseline for this bot is around `75 MB` in a few servers. Theoretically, it should not get much higher since the application barely stores any data.

Still, there *could* be memory leaks, so please open an issue if you notice any. Thanks!