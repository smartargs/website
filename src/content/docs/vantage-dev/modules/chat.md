# Chat

Say, yell, party, guild and whisper chat for players, plus system announcements and NPC lines. The server routes every line; you draw the chat window.

Every field, its default and every member you can call: [Chat reference](../reference/chat.md).

## Setup

1. Check **Use Chat** on the player's unit definition. A `VtUnitChat` component attaches on spawn.
2. Add a **VtPlayerIdentity** to the player prefab. The server assigns its player id and display name when the player is known: a Steam ID and persona name, an account id, or a local profile. Whispers find players by it, and ignores and mutes key on it.

Without an identity a unit can still chat under its unit name, but nobody can whisper it.

## Channels

| Channel | Reaches |
|---|---|
| Say | Players within **Chat Say Range**. |
| Yell | Players within **Chat Yell Range**. |
| Party | The sender's party, at any distance. |
| Guild | The sender's guild. Needs the guild module. |
| Whisper | One online player by name or id; the sender gets a copy. |
| System | Server announcements. Players cannot send on it. |
| Npc | Lines spoken by monsters and NPCs. Players cannot send on it. |

## Sending and receiving

```csharp
var chat = player.GetComponent<VtUnitChat>();

chat.OnMessageReceived += line => AddLine(line.channel, line.DisplaySender, line.DisplayText);
chat.Send(VtChatChannel.Say, input.text, out var reason);
chat.Whisper("Bob", "meet at the gate", out reason);

chat.Ignore(otherPlayerId);
chat.Unignore(otherPlayerId);
chat.History;
```

Show `DisplaySender` and `DisplayText`, not the raw fields: system and NPC lines are usually localization keys, and each client resolves them in its own language.

## What the server checks

Every line is trimmed and made single-line. Markup tags are stripped unless **Chat Allow Rich Text** is on, so players cannot inject colors or links. Lines longer than **Chat Max Length** are refused. So are lines from muted players, and lines past **Chat Messages Per Second** with **Chat Burst**. An ignored sender's lines never reach the player who ignored them. The ignore list saves with the unit.

Reasons: `EmptyText`, `TooLong`, `RateLimited`, `Muted`, `Filtered`, `NoRecipient`, `NotInParty`, `NotInGuild`, `ChannelNotAllowed`, and `AuthorityNotLocal` on a networked client, where the line travels to the server.

## Server side

```csharp
VtChat.SendSystem("sys.restart_in_5");
VtChat.SendNpc(boss, "boss.intro", arena.position, 40f);

VtChat.Mute(playerId, 600f);
VtChat.Unmute(playerId);

VtChat.FilterFn = (sender, text) => MyProfanityFilter.Clean(text);
VtChat.OnMessageRouted += (line, recipients) => MyChatLog.Write(line);
```

A **Message** encounter action posts its line on the Npc channel to everyone around the encounter, so boss yells reach networked clients through chat.

## Multiplayer

The co-op sample's command relay carries chat to the server. Its chat sync delivers routed lines to each player's client, and its identity sync replicates player ids and names. Replace the placeholder id the identity sync assigns with your own login, such as a verified Steam ID. Chat is not stored: history lives in memory on each client.
