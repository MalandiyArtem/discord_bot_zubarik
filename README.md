<h1 style="text-align: center;">Discord Bot Зубарик</h1>

<p style="text-align: center;">
    <img alt="Static Badge" src="https://img.shields.io/badge/version-v2.0.2-green">
</p>

<p style="text-align: center;">
  A discord bot designed to facilitate server administration. Key features include scheduled messaging, automated channel renaming, shadow banning, reaction management, logging of message deletions and edits, self-assigned roles, and more...
</p>

## Table of Contents
1. [Features of the bot](#features-of-the-bot)
   - [Scheduling messages](#scheduling-messages)
   - [Scheduling channel renaming](#scheduling-channel-renaming)
   - [Adding reactions under user's message](#adding-reactions-under-users-message)
   - [Apply shadow ban to user](#apply-shadow-ban-to-user)
   - [Roles management](#roles-management)
   - [Happy Birthday](#happy-birthday)
   - [Say](#say)
   - [Displaying lists](#displaying-lists)
   - [Sending random gif](#sending-random-gif)
   - [Logs](#logs)

## Features of the bot

### Scheduling messages

<p style="text-align: left;">
  This command allows sending messages on a specific date
</p>

```
/schedule message [day, month, timezone, channel, message?, prompt?, attachment?, year?, hours?, minutes?, seconds?]
```

> [!WARNING]
> This command can be used only by users who have admin privileges

| Parameter Name | Description                                                               | Default value | Required | Note                                                                                                                                 |
|----------------|---------------------------------------------------------------------------|---------------|----------|--------------------------------------------------------------------------------------------------------------------------------------|
| `day`          | The day when the message will be sent                                     | -             | true     | The date must not be earlier than the current time                                                                                   |
| `month`        | The month when the message will be sent                                   | -             | true     | The date must not be earlier than the current time                                                                                   |
| `timezone`     | The timezone specifies the time zone to which the date will be associated | -             | true     | -                                                                                                                                    |
| `channel`      | The channel to which the message will be sent                             | -             | true     | You can only specify text channels. Additionally, you cannot specify text channels that are accessible while you are in a voice chat |
| `message`      | The message that will be sent                                             | -             | false    | Although this parameter is not required, you must specify at least one of the three parameters: `message`, `prompt` or `attachment`  |
| `prompt`       | Prompt refers to a specific text based on which a random GIF will be sent | -             | false    | Although this parameter is not required, you must specify at least one of the three parameters: `message`, `prompt` or `attachment`  |
| `attachment`   | Any attachment that will be sent (photo/video/GIF)                        | -             | false    | Although this parameter is not required, you must specify at least one of the three parameters: `message`, `prompt` or `attachment`  |
| `year`         | The year when the message will be sent                                    | Current year  | false    | -                                                                                                                                    |
| `hours`        | The hours at which the message will be sent                               | 00            | false    | The date must not be earlier than the current time                                                                                   |
| `minutes`      | The minutes at which the message will be sent                             | 00            | false    | The date must not be earlier than the current time                                                                                   |
| `seconds`      | The seconds at which the message will be sent                             | 00            | false    | The date must not be earlier than the current time                                                                                   |

### Scheduling channel renaming

<p style="text-align: left;">
  This command allows rename specific channel on a specific date
</p>

```
/schedule rename-channel [day, month, timezone, channel, new_channel_name, year?, hours?, minutes?, seconds?]
```

> [!WARNING]
> This command can be used only by users who have admin privileges

| Parameter Name     | Description                                                               | Default value | Required | Note                                                                                                                                 |
|--------------------|---------------------------------------------------------------------------|---------------|----------|--------------------------------------------------------------------------------------------------------------------------------------|
| `day`              | The day on which the renaming will be performed                           | -             | true     | The date must not be earlier than the current time                                                                                   |
| `month`            | The month on which the renaming will be performed                         | -             | true     | The date must not be earlier than the current time                                                                                   |
| `timezone`         | The timezone specifies the time zone to which the date will be associated | -             | true     | -                                                                                                                                    |
| `channel`          | The channel that will be renamed                                          | -             | true     | You can only specify text channels. Additionally, you cannot specify text channels that are accessible while you are in a voice chat |
| `new_channel_name` | The new channel name that will be applied                                 | -             | true     | Any string                                                                                                                           |
| `year`             | The year when the renaming will be performed                              | Current year  | false    | -                                                                                                                                    |
| `hours`            | The hours at which the renaming will be performed                         | 00            | false    | The date must not be earlier than the current time                                                                                   |
| `minutes`          | The minutes at which the renaming will be performed                       | 00            | false    | The date must not be earlier than the current time                                                                                   |
| `seconds`          | The seconds at which the renaming will be performed                       | 00            | false    | The date must not be earlier than the current time                                                                                   |

> [!NOTE]
> If the bot was offline at the time the message was supposed to be sent, the message will be sent as soon as the bot comes online

### Adding reactions under user's message

This command allows you to define how the bot will add reactions to messages. You must first specify a unique `name` for the configuration, as well as the `emojis` that will be used as reactions under messages. You can also specify the `channels` to which the configuration will apply, as well as specific `users`. If these are not specified, the bot will react to all messages in all channels.

You may **only specify text channels**, excluding those accessible while you are in a voice channel.

You can specify as many emojis as you like; however, Discord has a limitation of **20 reactions per message.**

If multiple configurations overlap in any way, **the most old one will take priority.**

You can add any emoji, including default emojis and custom emojis available on the server. However, you cannot add custom emojis from other servers or those granted, for example, through Twitch subscriptions.

To specify multiple channels, you should use the following format: `#channel_name #channel_name_2`

To specify multiple users, use this format: `@user @user_2`

```
/reactions-add [name, emoji, channels?, users?]
```

> [!WARNING]
> This command can be used only by users who have admin privileges

| Parameter Name | Description                                      | Default value | Required | Note                                                                                                                                                                                |
|----------------|--------------------------------------------------|---------------|----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `name`         | A unique name used to identify the configuration | -             | true     | -                                                                                                                                                                                   |
| `emoji`        | The emojis that will be used as reactions        | -             | true     | Allowed only default emojis and custom emojis available on the server. You cannot add custom emojis from other servers or those granted, for example, through Twitch subscriptions. |
| `channels`     | The channels in which the reactions will be used | -             | false    | Available only text channels                                                                                                                                                        |
| `users`        | The users to whom the reactions will apply.      | -             | false    | -                                                                                                                                                                                   |

### Apply shadow ban to user
This command allows you to add user(s) to a shadow ban. The bot will instantly delete messages from users who are in the shadow ban.

You can specify multiple `users` and multiple `channels` in one configuration where messages should be deleted. Additionally, you must provide a unique `name` for the configuration.

You may **only specify text channels**, excluding those accessible while you are in a voice channel.

To specify multiple channels, you should use the following format: `#channel_name #channel_name_2`

To specify multiple users, use this format: `@user @user_2`

```
/shadow-ban [name, users, channels?]
```

> [!WARNING]
> This command can be used only by users who have admin privileges

| Parameter Name | Description                                        | Default value | Required | Note                         |
|----------------|----------------------------------------------------|---------------|----------|------------------------------|
| `name`         | A unique name used to identify the configuration   | -             | true     | -                            |
| `users`        | The users whose messages will be deleted           | -             | true     | -                            |
| `channels`     | The channels in which the messages will be deleted | -             | false    | Available only text channels |

### Roles management

Sometimes we need users to be able to assign a specific role to themselves. To do this, an admin must add the role to the list that defines available roles for users to self-assign.

The admin can add any roles to the list; however, to avoid issues with role assignment, you must move the bot's role, "Zubarik (Зубарик)" as high as possible in the server's role hierarchy. Additionally, if the role added to the list has administrative privileges, the bot will not be able to assign this role to a user.

To add a role to the list, use the following command

```
/add-role [role]
```

| Parameter Name | Description                                                 | Default value | Required | Note |
|----------------|-------------------------------------------------------------|---------------|----------|------|
| `role`         | The role that will be added to the list for self-assignment | -             | true     | -    |


You can also remove a role from this list using this command
```
/remove-role [role]
```

| Parameter Name | Description                                                     | Default value | Required | Note |
|----------------|-----------------------------------------------------------------|---------------|----------|------|
| `role`         | The role that will be removed from the list for self-assignment | -             | true     | -    |

If you want to remove all roles from the list, it is better to use this command

```
/remove-all-roles 
```

> [!WARNING]
> These commands can be used only by users who have admin privileges

To self-assign a role to yourself, use the following command. If you want to remove the role, simply use the same command again, and the bot will remove the role. That is, if you don't have the role, the bot will assign it to you, and if you already have the role, the bot will remove it.

```
/role [role] 
```

> [!NOTE]
> This command can be used by any user

| Parameter Name | Description                                      | Default value | Required | Note |
|----------------|--------------------------------------------------|---------------|----------|------|
| `role`         | The role you want to assign/remove from yourself | -             | true     | -    |

### Happy Birthday

This function is designed for automatically sending birthday greetings to users. First, the channel and the time at which the bot will send the message need to be configured. Then, users and their birthdays must be added to the list

> [!NOTE]
> If a user is already added to the list, you will not be able to add them again.
> If a user leaves the server, the bot will not send them birthday greetings.

> [!WARNING]
> These commands can be used only by users who have admin privileges

To configure the settings, use the following command

```
/happy-birthday config [channel, timezone, hours?, minutes?, seconds?]
```

| Parameter Name | Description                                                               | Default value | Required | Note                                                                                                                                 |
|----------------|---------------------------------------------------------------------------|---------------|----------|--------------------------------------------------------------------------------------------------------------------------------------|
| `channel`      | The channel where the birthday greeting will be sent                      | -             | true     | You can only specify text channels. Additionally, you cannot specify text channels that are accessible while you are in a voice chat |
| `timezone`     | The timezone specifies the time zone to which the date will be associated | -             | true     | -                                                                                                                                    |
| `hours`        | The hours at which the greeting will be sent                              | 00            | false    | -                                                                                                                                    |
| `minutes`      | The minutes at which the greeting will be sent                            | 00            | false    | -                                                                                                                                    |
| `seconds`      | The seconds at which the greeting will be sent                            | 00            | false    | -                                                                                                                                    |


To delete the configuration, after which the bot will no longer send birthday greetings, use the following command

```
/happy-birthday config-remove
```

To view the current configuration, use the following command
```
/happy-birthday config-info 
```

To add a new birthday to the list, use the following command
```
/happy-birthday add [user, username, day, month]
```

| Parameter Name | Description                                                                   | Default value | Required | Note                                                                                          |
|----------------|-------------------------------------------------------------------------------|---------------|----------|-----------------------------------------------------------------------------------------------|
| `user`         | The user who has a birthday                                                   | -             | true     | You must tag user using @ (the user will not receive notification while running this command) |
| `username`     | The username of the user, which allows for assigning a nickname for the entry | -             | true     | -                                                                                             |
| `day`          | The day of the birthday                                                       | -             | true     | -                                                                                             |
| `month`        | The month of the birthday                                                     | -             | true     | -                                                                                             |

To delete a single birthday, use the following command

```
/happy-birthday remove [id]
```

| Parameter Name | Description            | Default value | Required | Note                                                                       |
|----------------|------------------------|---------------|----------|----------------------------------------------------------------------------|
| `id`           | The id of the birthday | -             | true     | The record ID can be found by invoking the command `/happy-birthday list ` |

To delete all birthdays, use the following command
```
/happy-birthday remove-all 
```

### Say

This command is designed to allow sending messages on behalf of the bot in the same channel where the command was invoked

```
/say [message?, attachment?]
```

> [!WARNING]
> This command can be used only by users who have admin privileges


| Parameter Name | Description                                        | Default value | Required | Note |
|----------------|----------------------------------------------------|---------------|----------|------|
| `message`      | The message that will be sent                      | -             | false    | -    |
| `attachment`   | Any attachment that will be sent (photo/video/GIF) | -             | false    | -    |

### Displaying lists


These commands will allow you to view all the saved information in list form, such as scheduled messages, scheduled channel renaming, available roles, reactions, shadow bans, etc.


To see all scheduled messages use following command:

```
/schedule message-list
```

To see all scheduled channel renaming use following command:

```
/schedule rename-list
```

To see all reactions configuration use following command:

```
/reactions-list 
```

To see all shadow bans configuration use following command:

```
/shadow-ban-list
```

To see all saved happy birthday use following command:

```
/happy-birthday list 
```

> [!WARNING]
> These commands can be used only by users who have admin privileges

To see all available roles for self-assigning use following command:

```
/role-list 
```

> [!NOTE]
> This command can be used by any user

To switch between records, you can use the `right`/`left` arrows. To delete a record, you can press the `Delete` button

### Sending random gif

The bot can send a random GIF based on the text entered by the user
```
/gif [prompt]
```

> [!NOTE]
> This command can be used by any user


| Parameter Name | Description                                               | Default value | Required | Note |
|----------------|-----------------------------------------------------------|---------------|----------|------|
| `prompt`       | The text on the basis of which a random GIF will be sent. | -             | true     | -    |

### Logs

The bot can log certain events, such as:
- a user deleted a message
- a user edited a message
- a user assigned themselves a role via the /role command
- a user removed a role via the /role command
- an administrator added a role to the list of available roles
- an administrator removed a role from the list of available roles
- an administrator removed all roles from the list of available roles
- an administrator added a new reaction configuration
- an administrator removed a reaction configuration
- an administrator added a new shadow ban configuration
- an administrator removed a shadow ban configuration
- an administrator added a scheduled message
- an administrator deleted a scheduled message
- an administrator added a scheduled channel renaming
- an administrator deleted a scheduled channel renaming
- an administrator designated a channel for logs
- an administrator add/update/remove happy birthday configuration
- an administrator add/remove/remove-all happy birthday records

For the bot to log all these events, the administrator needs to specify the channel where the logs will be sent by using the command:
```
/logs [channel?]
```

> [!WARNING]
> This command can be used only by users who have admin privileges


| Parameter Name | Description                              | Default value | Required | Note                                                  |
|----------------|------------------------------------------|---------------|----------|-------------------------------------------------------|
| `channel`      | The channel where the bot will send logs | -             | false    | If the parameter is empty, the bot will not send logs |
