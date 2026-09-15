# Mail

Player-to-player mail with item and currency attachments, delivered to online or offline players, plus system mail for rewards and notices.

## Setup

1. Give player prefabs a **VtPlayerIdentity**, an inventory and a wallet, and check **Use Mail** on their unit definition. A `VtUnitMail` component attaches on spawn.
2. Set **Mail Postage** on the definition if sending costs currency.
3. Add every mailable item and currency to the **Definition Catalog**; attachments travel by id.
4. Choose where mailboxes persist before players connect:

```csharp
VtMail.Store = new VtJsonMailStore();
VtPlayerDirectory.Store = new VtJsonPlayerDirectoryStore();
```

The defaults keep mail in memory. An online game implements `IVtMailStore` against its database.

## Sending

```csharp
var mail = player.GetComponent<VtUnitMail>();

var draft = VtMailDraft.Create("Bob", "Supplies", "Stay safe out there.")
    .WithItem(healthPotion, 3)
    .WithCurrency(gold, 50);
mail.Send(draft, out var reason);
```

The recipient is found by name or id through the player directory, so offline players receive mail. Sending checks everything before anything moves: the recipient exists and is not the sender, the subject is not empty, lengths are within **Mail Subject Max Length** and **Mail Body Max Length**, there are at most **Mail Max Attachments** lines, and the recipient's mailbox is under **Mailbox Max Count**. The sender must also hold the items, the items must be tradeable, and the sender must be able to pay the currency plus postage. Only then are the attachments and postage taken and the mail delivered. Subjects and bodies are cleaned of markup; bodies keep line breaks.

## Receiving

```csharp
mail.Mailbox;
mail.UnreadCount;
mail.OnMailArrived += message => FlashMailIcon();
mail.OnMailboxChanged += box => Redraw(box);

mail.MarkRead(mailId, out reason);
mail.TakeAttachments(mailId, out reason);
mail.Delete(mailId, out reason);
mail.ReturnToSender(mailId, out reason);
```

Taking attachments moves all currency, then items one line at a time until one does not fit, and reports `InventoryFull` with the rest still attached. A mail can only be deleted once its attachments are taken. Returning sends a player's mail and its attachments back to the sender, once; system mail cannot be returned.

After **Mail Expiry Days**, player mail that still carries attachments returns to its sender, and any other expired mail is deleted, returned mail included.

Reasons: `NoIdentity`, `RecipientNotFound`, `CannotMailSelf`, `RecipientMailboxFull`, `SubjectEmpty`, `TooLong`, `TooManyAttachments`, `UnknownDefinition`, `NoInventory`, `MissingItems`, `ItemNotTradeable`, `NoWallet`, `CannotAfford`, `MailNotFound`, `AttachmentsRemaining`, `InventoryFull`, `NotReturnable`, and `AuthorityNotLocal` on a networked client.

## System mail

```csharp
VtMail.SendSystem(playerId, "Quest reward", "Your bag was full, so here it is.",
    new VtMailDraft().WithItem(epicSword, 1));
```

System mail ignores the mailbox cap and needs no sender. Its attachments are created rather than taken from anyone. Use it when a reward does not fit, for event gifts and for customer support.

## Multiplayer

The co-op sample's mail sync sends each player its mailbox and new-mail notices. Sends and every other call from a client travel as commands; the server checks and escrows with its own copy of the player's inventory and wallet.
