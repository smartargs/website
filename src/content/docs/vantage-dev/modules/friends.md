# Friends

In-game friends with requests and presence, merged with the player's platform friends such as Steam into one list.

Every field, its default and every member you can call: [Friends reference](../reference/friends.md).

## Setup

1. Give player prefabs a **VtPlayerIdentity** and check **Use Friends** on their unit definition. A `VtUnitFriends` component attaches on spawn.
2. Choose where friends and known players persist before players connect:

```csharp
VtFriends.Store = new VtJsonFriendsStore();
VtPlayerDirectory.Store = new VtJsonPlayerDirectoryStore();
```

The defaults keep everything in memory. An online game implements `IVtFriendsStore` and `IVtPlayerDirectoryStore` against its database.

The player directory records every player the server sees, so requests and mail can find someone by name after they log off.

## Runtime

```csharp
var friends = player.GetComponent<VtUnitFriends>();

friends.SendRequest("Bob", out var reason);
friends.Incoming;
friends.Accept(requesterPlayerId, out reason);
friends.Decline(requesterPlayerId, out reason);
friends.Cancel(recipientPlayerId, out reason);
friends.Remove(friendPlayerId, out reason);

var rows = new List<VtFriendView>();
friends.GetView(rows);
friends.OnFriendsChanged += record => Redraw();
friends.OnFriendPresenceChanged += (friendId, online) => Redraw();
```

A request reaches an offline player and waits in their inbox. If both players request each other, they become friends at once. Unanswered requests drop after **Friend Request Expiry Days**. Lists cap at **Friends Max Count**, and inboxes at **Friend Requests Max Pending**. Renaming a player updates what friends and requesters see.

Reasons: `NoIdentity`, `PlayerNotFound`, `CannotBefriendSelf`, `AlreadyFriends`, `RequestPending`, `FriendListFull`, `TargetFull`, `NoRequest`, `NotFriends`, and `AuthorityNotLocal` on a networked client.

## Steam and other platforms

Platform friends are known only on the player's own machine; a game server cannot read them. Vantage therefore keeps two kinds of friends:

| | In-game friends | Platform friends |
|---|---|---|
| Stored | By the server, in the friends store | By the platform |
| Checked by | The server | Nobody; display only |
| Available | Everywhere, including offline players | On the local client |

Implement `IVtPlatformFriendsProvider` on the client and set `VtFriends.PlatformProvider`. `GetView` then merges both into one list. A friend on both appears once, marked as both. When player ids are SteamIDs the rows merge on their own; otherwise map ids with `VtFriends.PlatformIdToPlayerId`.

A provider for Steamworks.NET looks like this. It is an example, not part of the package:

```csharp
public sealed class SteamFriendsProvider : IVtPlatformFriendsProvider
{
    public string PlatformName => "Steam";
    public event Action OnChanged;

    public void GetFriends(List<VtPlatformFriend> results)
    {
        int count = SteamFriends.GetFriendCount(EFriendFlags.k_EFriendFlagImmediate);
        for (int i = 0; i < count; i++)
        {
            CSteamID id = SteamFriends.GetFriendByIndex(i, EFriendFlags.k_EFriendFlagImmediate);
            bool playing = SteamFriends.GetFriendGamePlayed(id, out FriendGameInfo_t game)
                           && game.m_gameID.AppID() == SteamUtils.GetAppID();
            results.Add(new VtPlatformFriend
            {
                platformId = id.m_SteamID.ToString(),
                displayName = SteamFriends.GetFriendPersonaName(id),
                online = SteamFriends.GetFriendPersonaState(id) != EPersonaState.k_EPersonaStateOffline,
                playingThisGame = playing,
            });
        }
    }
}
```

Joining a Steam friend's session and Steam invites are handled by your transport and lobby code, not by the friends module.

## Multiplayer

The co-op sample's friends sync sends each player its record and friend presence. Every call from a client travels as a command and is checked on the server.
