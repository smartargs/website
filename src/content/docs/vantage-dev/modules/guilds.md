# Guilds

Player organizations that outlive sessions: founding, invites, ranks with permissions, a message of the day and guild chat. Guilds belong to player ids, not to units, so members stay members while offline or on another character.

Every field, its default and every member you can call: [Guilds reference](../reference/guilds.md).

## Setup

1. Give player prefabs a **VtPlayerIdentity** and check **Use Guild** on their unit definition. A `VtUnitGuild` component attaches on spawn.
2. Set **Guild Creation Cost** on the definition if founding costs currency.
3. Choose where guilds persist before players connect:

```csharp
VtGuilds.Store = new VtJsonGuildStore();
```

The default store keeps guilds in memory only. `VtJsonGuildStore` writes one file per guild under the persistent data path, which suits single-player and small servers. An online game implements `IVtGuildStore` against its database: `LoadAll` once at start, `Save` after every change, `Delete` on disband.

## Ranks

A new guild has three ranks: **Leader**, **Officer** and **Member**. New members join at the lowest rank.

| Rule | Detail |
|---|---|
| Permissions | Invite, Kick, Promote (also demotes) and Edit Motd. The leader has all of them. |
| Rank order | A member can only kick, promote or demote members ranked below them. |
| Promotion | A promotion never reaches Leader. Leadership only changes hands through a transfer. |
| Leaving | The leader leaves only by transferring first, or by leaving as the last member, which disbands the guild. |

## Runtime

```csharp
var guild = player.GetComponent<VtUnitGuild>();

guild.CreateGuild("Knights of Dawn", "KOD", out var reason);
guild.Invite("Bob", out reason);
other.OnInviteReceived += invite => ShowInvite(invite.guildName, invite.inviterName);
other.AcceptInvite(out reason);

guild.Kick(memberPlayerId, out reason);
guild.Promote(memberPlayerId, out reason);
guild.Demote(memberPlayerId, out reason);
guild.TransferLeadership(memberPlayerId, out reason);
guild.SetMotd("Raid at nine", out reason);
guild.Leave(out reason);
guild.Disband(out reason);

guild.Guild.name; guild.Guild.tag; guild.Guild.motd; guild.Guild.members;
guild.Member.rank; guild.HasPermission(VtGuildPermissions.Invite);
member.IsOnline; member.lastSeenAt;
guild.OnGuildChanged += record => RedrawRoster(record);
```

Names are 3 to 24 letters, digits and single spaces, unique ignoring case. `VtGuilds.NameFilterFn` adds a word list. Tags are 2 to 5 letters or digits, stored uppercase. Invites last **Guild Invite Seconds**, and guilds cap at **Guild Max Members**. The message of the day is cleaned like chat and cut at **Guild Motd Max Length**.

Reasons: `NoIdentity`, `AlreadyInGuild`, `NotInGuild`, `NameInvalid`, `NameTaken`, `TagInvalid`, `CannotAfford`, `NoPermission`, `TargetNotFound`, `TargetInGuild`, `TargetNotMember`, `GuildFull`, `NoInvite`, `RankTooLow`, `LeaderCannotLeave`, and `AuthorityNotLocal` on a networked client.

## Guild chat and server tools

Once any `VtUnitGuild` initializes, the **Guild** chat channel reaches every online member. Server code can manage guilds by player id without a unit, for GM tools or offline members: `VtGuilds.Kick`, `VtGuilds.Disband`, `VtGuilds.FindByName`, `VtGuilds.GuildOf`, plus the `OnGuildChanged`, `OnMembershipChanged` and `OnInviteChanged` events.

## Multiplayer

Guilds live on the server. The co-op sample's guild sync sends each player its guild record and invites. Every call from a client travels as a command and is checked on the server. With several game servers sharing guilds, the store must be a shared database, and servers need to tell each other about changes; that part is your backend.
