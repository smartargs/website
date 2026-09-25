# Party

Players group up to share kills, loot and party-only effects. The library runs invites, membership and sharing; you draw the party frame.

Every field, its default and every member you can call: [Party reference](../reference/party.md).

## Setup

Check **Use Party** on the player's unit definition. A `VtUnitParty` component attaches on spawn.

The numbers live on the tuning asset:

| Field | Meaning |
|---|---|
| Party Max Size | Most members a party may have. |
| Party Share Range | Members within this distance of a kill share it. 0 means any distance. |
| Party Xp Bonus Per Member | Extra XP per additional sharer, as a fraction of the award. |
| Loot Reserve Seconds | How long a party kill's drops belong to that party under the Party Reserved rule. |

## Forming a party

```csharp
var party = player.GetComponent<VtUnitParty>();

party.Invite(otherPlayer, out var reason);
other.OnInvited += inviter => ShowInvite(inviter);
other.AcceptInvite(out reason);
other.DeclineInvite();

party.Leave();
party.Kick(member, out reason);
party.Promote(member, out reason);
party.SetLootRule(VtPartyLootRule.FreeForAll, out reason);

party.InParty; party.IsLeader; party.Party.Members; party.Party.Leader;
party.OnPartyChanged += current => RedrawPartyFrame(current);
VtUnitParty.AreInSameParty(a, b);
```

The leader, or a unit not yet in a party, invites. Accepting forms the party around the inviter if it had none. When the leader leaves, the next member leads. A party that drops to one member disbands. Hostile factions cannot group.

Reasons: `InvalidTarget`, `TargetInParty`, `AlreadyInParty`, `NotInParty`, `NotLeader`, `PartyFull`, `NoInvite`, and `AuthorityNotLocal` on a networked client.

## What a party shares

| What | How |
|---|---|
| XP | The kill's XP plus the per-member bonus, split evenly among members in share range. |
| Currency drops | Split evenly among members in share range with a wallet; the killer takes the remainder. |
| Kill objectives | A member in share range gets credit for a party member's kill. |
| Item drops | Under **Party Reserved**, only the party may pick them up for **Loot Reserve Seconds**. **Free For All** leaves them open. Solo kills are always open. |
| Healing and buffs | **Party Only** on an area heal or area buff effect, and the **Party Members** aura filter, limit the effect to the caster and its party. |

`VtPartyRules.GetCreditRecipients` returns the same list the package uses, for your own reward systems.

## Multiplayer and saving

Every call is checked on the server and forwarded from clients, like other requests. Clients receive their party through `ApplyPartyFromNet` and pending invites through `ApplyInviteFromNet`; the co-op sample's party sync does both. Parties are session state and are not saved.
