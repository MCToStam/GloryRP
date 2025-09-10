const ComponentType = {
	/**
	 * Container to display a row of interactive components
	 */
	ActionRow: 1,
	/**
	 * Button component
	 */
	Button: 2,
	/**
	 * Select menu for picking from defined text options
	 */
	StringSelect: 3,
	/**
	 * Text Input component
	 */
	TextInput: 4,
	/**
	 * Select menu for users
	 */
	UserSelect: 5,
	/**
	 * Select menu for roles
	 */
	RoleSelect: 6,
	/**
	 * Select menu for users and roles
	 */
	MentionableSelect: 7,
	/**
	 * Select menu for channels
	 */
	ChannelSelect: 8,
	/**
	 * Container to display text alongside an accessory component
	 */
	Section: 9,
	/**
	 * Markdown text
	 */
	TextDisplay: 10,
	/**
	 * Small image that can be used as an accessory
	 */
	Thumbnail: 11,
	/**
	 * Display images and other media
	 */
	MediaGallery: 12,
	/**
	 * Displays an attached file
	 */
	File: 13,
	/**
	 * Component to add vertical padding between other components
	 */
	Separator: 14,
	/**
	 * @unstable This component type is currently not documented by Discord but has a known value which we will try to keep up to date.
	 */
	ContentInventoryEntry: 16,
	/**
	 * Container that visually groups a set of components
	 */
	Container: 17,
	/**
	 * Select menu for picking from defined text options
	 *
	 * @deprecated This is the old name for {@link ComponentType.StringSelect}
	 */
	SelectMenu: 3,
};

const EmojiComponent = {
	/**
	 * Emoji id
	 * - NOT REQUIRED
	 */
	id: Snowflake,
	/**
	 * Emoji name
	 * - NOT REQUIRED
	 */
	name: string,
	/**
	 * Whether this emoji is animated
	 * - NOT REQUIRED
	 */
	animated: boolean,
};

const UnfurledMediaItem = {
	/**
	 * Supports arbitrary urls and attachment://<filename> references
	 */
	url: string,
	/**
	 * The proxied url of the media item. This field is ignored and provided by the API as part of the response
	 * - NOT REQUIRED
	 */
	proxy_url: string,
	/**
	 * The width of the media item. This field is ignored and provided by the API as part of the response
	 * - NOT REQUIRED
	 */
	width: number | null,
	/**
	 * The height of the media item. This field is ignored and provided by the API as part of the response
	 * - NOT REQUIRED
	 */
	height: number | null,
	/**
	 * - NOT REQUIRED
	 */
	placeholder: string | null,
	/**
	 * - NOT REQUIRED
	 */
	placeholder_version: number | null,
	/**
	 * The media type of the content. This field is ignored and provided by the API as part of the response
	 * - NOT REQUIRED
	 *
	 * @see {@link https://en.wikipedia.org/wiki/Media_type}
	 */
	content_type: string | null,
	/**
	 * - NOT REQUIRED
	 */
	loading_state: UnfurledMediaItemItemLoadingState,
	/**
	 * - NOT REQUIRED
	 */
	flags: number,
	/**
	 * The id of the uploaded attachment. This field is ignored and provided by the API as part of the response
	 * - NOT REQUIRED
	 */
	attachment_id: Snowflake,
};

const UnfurledMediaItemItemLoadingState = {
	Unknown: 0,
	Loading: 1,
	LoadedSuccess: 2,
	LoadedNotFound: 3,
};

const SelectMenuDefaultValue = {
	type: Type, //"user", "role", or "channel"
	id: Snowflake,
};

//! 1 - ActionRow
/**
 * An Action Row is a top-level layout component used in messages and modals.
 *
 * @see {@link https://discord.com/developers/docs/components/reference#action-row}
 */
const ActionRowComponent = {
	type: 1,
	/**
	 * The components in the ActionRow
	 */
	components: ButtonComponent || StringSelectComponent,
};

//! 2 - Button
const ButtonComponent = {
	type: 2,
	/**
	 * The custom_id to be sent in the interaction when clicked
	 */
	custom_id: string,
	/**
	 * The label to be displayed on the button
	 */
	label: string,
	/**
	 * The emoji to display to the left of the text
	 * - NOT REQUIRED
	 */
	emoji: EmojiComponent,
	/**
	 * The style of the button
	 */
	style: ButtonStyle,
	/**
	 * The status of the button
	 * - NOT REQUIRED
	 */
	disabled: boolean,
};

const ButtonLink = {
	type: 2,
	/**
	 * The URL to direct users to when clicked for Link buttons
	 */
	url: string,
	label: string,
	emoji: EmojiComponent,
	style: ButtonStyle.Link,
};

const ButtonPremium = {
	type: 2,
	/**
	 * The id for a purchasable SKU
	 */
	sku_id: Snowflake,
	label: string,
	emoji: EmojiComponent,
	style: ButtonStyle.Premium,
	disabled: boolean,
};

const ButtonStyle = {
	/**
	 * The most important or recommended action in a group of options
	 */
	Primary: 1,
	/**
	 * Alternative or supporting actions
	 */
	Secondary: 2,
	/**
	 * Positive confirmation or completion actions
	 */
	Success: 3,
	/**
	 * An action with irreversible consequences
	 */
	Danger: 4,
	/**
	 * Navigates to a URL
	 */
	Link: 5,
	/**
	 * Purchase
	 */
	Premium: 6,
};

//! 3 - StringSelect (SelectMenu)
/**
 * A String Select is an interactive component that allows users to select one or more provided options in a message.
 *
 * String Selects can be configured for both single-select and multi-select behavior. When a user finishes making their choice(s) your app receives an interaction.
 *
 * String Selects must be placed inside an Action Row and are only available in messages. An Action Row can contain only one select menu and cannot contain buttons if it has a select menu.
 *
 * @see {@link https://discord.com/developers/docs/components/reference#string-select}
 */
const StringSelectComponent = {
	type: 3,
	/**
	 * A developer-defined identifier for the select menu, max 100 characters
	 */
	custom_id: string,
	/**
	 * Custom placeholder text if nothing is selected, max 150 characters
	 * - NOT REQUIRED
	 */
	placeholder: string,
	/**
	 * The minimum number of items that must be chosen; min 0, max 25
	 * - NOT REQUIRED
	 *
	 * @defaultValue `1`
	 */
	min_values: number,
	/**
	 * The maximum number of items that can be chosen; max 25
	 * - NOT REQUIRED
	 *
	 * @defaultValue `1`
	 */
	max_values: number,
	/**
	 * Disable the select
	 * - NOT REQUIRED
	 *
	 * @defaultValue `false`
	 */
	disabled: boolean,
	/**
	 * Specified choices in a select menu; max 25
	 */
	options: {
		/**
		 * The user-facing name of the option (max 100 chars)
		 */
		label: string,
		/**
		 * The dev-defined value of the option (max 100 chars)
		 */
		value: string,
		/**
		 * An additional description of the option (max 100 chars)
		 * - NOT REQUIRED
		 */
		description: string,
		/**
		 * The emoji to display to the left of the option
		 * - NOT REQUIRED
		 */
		emoji: EmojiComponent,
		/**
		 * Whether this option should be already-selected by default
		 * - NOT REQUIRED
		 */
		default: boolean,
	},
};

//! 4 - TextInput (zone de saisie de texte des formulaires)
/**
 * Text Input is an interactive component that allows users to enter free-form text responses in modals. It supports both short, single-line inputs and longer, multi-line paragraph inputs.
 *
 * Text Inputs can only be used within modals and must be placed inside an Action Row.
 *
 * When defining a text input component, you can set attributes to customize the behavior and appearance of it. However, not all attributes will be returned in the text input interaction payload.
 *
 * @see {@link https://discord.com/developers/docs/components/reference#text-input}
 */
const Modal = {
	title: String,
	custom_id: String,
	components: [TextInputComponent],
};

const TextInputComponent = {
	type: 1,
	components: [
		{
			type: 4,
			/**
			 * One of text input styles
			 */
			style: TextInputStyle,
			/**
			 * The custom id for the text input
			 */
			custom_id: string,
			/**
			 * Text that appears on top of the text input field, max 45 characters
			 */
			label: string,
			/**
			 * Placeholder for the text input
			 * - NOT REQUIRED
			 */
			placeholder: string,
			/**
			 * The pre-filled text in the text input
			 * - NOT REQUIRED
			 */
			value: string,
			/**
			 * Minimal length of text input
			 * - NOT REQUIRED
			 */
			min_length: number,
			/**
			 * Maximal length of text input
			 * - NOT REQUIRED
			 */
			max_length: number,
			/**
			 * Whether or not this text input is required or not
			 * - NOT REQUIRED
			 */
			required: boolean,
		},
	],
};

const TextInputStyle = {
	/**
	 * Single-line input
	 */
	Short: 1,
	/**
	 * Multi-line input
	 */
	Paragraph: 2,
};

//! 5 - UserSelect
/**
 * A User Select is an interactive component that allows users to select one or more users in a message. Options are automatically populated based on the server's available users.
 *
 * User Selects can be configured for both single-select and multi-select behavior. When a user finishes making their choice(s) your app receives an interaction.
 *
 * User Selects must be placed inside an Action Row and are only available in messages. An Action Row can contain only one select menu and cannot contain buttons if it has a select menu.
 *
 * @see {@link https://discord.com/developers/docs/components/reference#user-select}
 */
const UserSelectComponents = {
	type: 5,
	/**
	 * A developer-defined identifier for the select menu, max 100 characters
	 */
	custom_id: string,
	/**
	 * Custom placeholder text if nothing is selected, max 150 characters
	 * - NOT REQUIRED
	 */
	placeholder: string,
	/**
	 * The minimum number of items that must be chosen; min 0, max 25
	 * - NOT REQUIRED
	 *
	 * @defaultValue `1`
	 */
	min_values: number,
	/**
	 * The maximum number of items that can be chosen; max 25
	 * - NOT REQUIRED
	 *
	 * @defaultValue `1`
	 */
	max_values: number,
	/**
	 * Disable the select
	 * - NOT REQUIRED
	 *
	 * @defaultValue `false`
	 */
	disabled: boolean,
	/**
	 * List of default values for auto-populated select menu components
	 */
	default_values: [SelectMenuDefaultValue],
};

//! 6 - RoleSelect
/**
 * A Role Select is an interactive component that allows users to select one or more roles in a message. Options are automatically populated based on the server's available roles.
 *
 * Role Selects can be configured for both single-select and multi-select behavior. When a user finishes making their choice(s) your app receives an interaction.
 *
 * Role Selects must be placed inside an Action Row and are only available in messages. An Action Row can contain only one select menu and cannot contain buttons if it has a select menu.
 *
 * @see {@link https://discord.com/developers/docs/components/reference#role-select}
 */
const RoleSelectComponents = {
	type: 6,
	/**
	 * A developer-defined identifier for the select menu, max 100 characters
	 */
	custom_id: string,
	/**
	 * Custom placeholder text if nothing is selected, max 150 characters
	 * - NOT REQUIRED
	 */
	placeholder: string,
	/**
	 * The minimum number of items that must be chosen; min 0, max 25
	 * - NOT REQUIRED
	 *
	 * @defaultValue `1`
	 */
	min_values: number,
	/**
	 * The maximum number of items that can be chosen; max 25
	 * - NOT REQUIRED
	 *
	 * @defaultValue `1`
	 */
	max_values: number,
	/**
	 * Disable the select
	 * - NOT REQUIRED
	 *
	 * @defaultValue `false`
	 */
	disabled: boolean,
	/**
	 * List of default values for auto-populated select menu components
	 */
	default_values: [SelectMenuDefaultValue],
};

//! 7 - MentionableSelect
/**
 * A Mentionable Select is an interactive component that allows users to select one or more mentionables in a message. Options are automatically populated based on available mentionables in the server.
 *
 * Mentionable Selects can be configured for both single-select and multi-select behavior. When a user finishes making their choice(s), your app receives an interaction.
 *
 * Mentionable Selects must be placed inside an Action Row and are only available in messages. An Action Row can contain only one select menu and cannot contain buttons if it has a select menu.
 *
 * @see {@link https://discord.com/developers/docs/components/reference#mentionable-select}
 */
const MentionableSelectComponents = {
	type: 7,
	/**
	 * A developer-defined identifier for the select menu, max 100 characters
	 */
	custom_id: string,
	/**
	 * Custom placeholder text if nothing is selected, max 150 characters
	 * - NOT REQUIRED
	 */
	placeholder: string,
	/**
	 * The minimum number of items that must be chosen; min 0, max 25
	 * - NOT REQUIRED
	 *
	 * @defaultValue `1`
	 */
	min_values: number,
	/**
	 * The maximum number of items that can be chosen; max 25
	 * - NOT REQUIRED
	 *
	 * @defaultValue `1`
	 */
	max_values: number,
	/**
	 * Disable the select
	 * - NOT REQUIRED
	 *
	 * @defaultValue `false`
	 */
	disabled: boolean,
	/**
	 * List of default values for auto-populated select menu components
	 */
	default_values: [SelectMenuDefaultValue],
};

//! 8 - ChannelSelect
/**
 * A Channel Select is an interactive component that allows users to select one or more channels in a message. Options are automatically populated based on available channels in the server and can be filtered by channel types.
 *
 * Channel Selects can be configured for both single-select and multi-select behavior. When a user finishes making their choice(s) your app receives an interaction.
 *
 * Channel Selects must be placed inside an Action Row and are only available in messages. An Action Row can contain only one select menu and cannot contain buttons if it has a select menu.
 *
 * @see {@link https://discord.com/developers/docs/components/reference#channel-select}
 */
const ChannelSelectComponents = {
	type: 8,
	/**
	 * A developer-defined identifier for the select menu, max 100 characters
	 */
	custom_id: string,
	/**
	 * Custom placeholder text if nothing is selected, max 150 characters
	 * - NOT REQUIRED
	 */
	placeholder: string,
	/**
	 * The minimum number of items that must be chosen; min 0, max 25
	 * - NOT REQUIRED
	 *
	 * @defaultValue `1`
	 */
	min_values: number,
	/**
	 * The maximum number of items that can be chosen; max 25
	 * - NOT REQUIRED
	 *
	 * @defaultValue `1`
	 */
	max_values: number,
	/**
	 * Disable the select
	 * - NOT REQUIRED
	 *
	 * @defaultValue `false`
	 */
	disabled: boolean,
	/**
	 * Specified choices in a select menu; max 25
	 */
	channel_types: ChannelType,
	/**
	 * List of default values for auto-populated select menu components
	 */
	default_values: [SelectMenuDefaultValue],
};

const ChannelType = {
	/**
	 * A text channel within a guild
	 */
	GuildText: 0,
	/**
	 * A direct message between users
	 */
	DM: 1,
	/**
	 * A voice channel within a guild
	 */
	GuildVoice: 2,
	/**
	 * A direct message between multiple users
	 */
	GroupDM: 3,
	/**
	 * An organizational category that contains up to 50 channels
	 *
	 * @see {@link https://support.discord.com/hc/articles/115001580171}
	 */
	GuildCategory: 4,
	/**
	 * A channel that users can follow and crosspost into their own guild
	 *
	 * @see {@link https://support.discord.com/hc/articles/360032008192}
	 */
	GuildAnnouncement: 5,
	/**
	 * A temporary sub-channel within a Guild Announcement channel
	 */
	AnnouncementThread: 10,
	/**
	 * A temporary sub-channel within a Guild Text or Guild Forum channel
	 */
	PublicThread: 11,
	/**
	 * A temporary sub-channel within a Guild Text channel that is only viewable by those invited and those with the Manage Threads permission
	 */
	PrivateThread: 12,
	/**
	 * A voice channel for hosting events with an audience
	 *
	 * @see {@link https://support.discord.com/hc/articles/1500005513722}
	 */
	GuildStageVoice: 13,
	/**
	 * The channel in a Student Hub containing the listed servers
	 *
	 * @see {@link https://support.discord.com/hc/articles/4406046651927}
	 */
	GuildDirectory: 14,
	/**
	 * A channel that can only contain threads
	 */
	GuildForum: 15,
	/**
	 * A channel like forum channels but contains media for server subscriptions
	 *
	 * @see {@link https://creator-support.discord.com/hc/articles/14346342766743}
	 */
	GuildMedia: 16,
	/**
	 * A channel that users can follow and crosspost into their own guild
	 *
	 * @deprecated This is the old name for {@link ChannelType.GuildAnnouncement}
	 * @see {@link https://support.discord.com/hc/articles/360032008192}
	 */
	GuildNews: 5,
	/**
	 * A temporary sub-channel within a Guild Announcement channel
	 *
	 * @deprecated This is the old name for {@link ChannelType.AnnouncementThread}
	 */
	GuildNewsThread: 10,
	/**
	 * A temporary sub-channel within a Guild Text channel
	 *
	 * @deprecated This is the old name for {@link ChannelType.PublicThread}
	 */
	GuildPublicThread: 11,
	/**
	 * A temporary sub-channel within a Guild Text channel that is only viewable by those invited and those with the Manage Threads permission
	 *
	 * @deprecated This is the old name for {@link ChannelType.PrivateThread}
	 */
	GuildPrivateThread: 12,
};

//! 9 - Section
/**
 * A Section is a top-level layout component that allows you to join text contextually with an accessory.
 *
 * Sections are only available in messages.
 *
 * @see {@link https://discord.com/developers/docs/components/reference#section}
 */
const SectionComponent = {
	type: 9,
	/**
	 * One to three text components
	 */
	components: TextDisplayComponent,
	/**
	 * A thumbnail or a button component, with a future possibility of adding more compatible components
	 */
	accessory: ButtonComponent | ThumbnailComponent,
};

//! 10 - TextDisplay
/**
 * A Text Display is a top-level content component that allows you to add text to your message formatted with markdown and mention users and roles. This is similar to the content field of a message, but allows you to add multiple text components, controlling the layout of your message.
 *
 * Text Displays are only available in messages.
 *
 * @see {@link https://discord.com/developers/docs/components/reference#text-display}
 */
const TextDisplayComponent = {
	type: 10,
	/**
	 * Text that will be displayed similar to a message
	 */
	content: string,
};

//! 11 - Thumbnail
/**
 * A Thumbnail is a content component that is a small image only usable as an accessory in a section. The preview comes from an url or attachment through the unfurled media item structure.
 *
 * Thumbnails are only available in messages as an accessory in a section.
 *
 * @see {@link https://discord.com/developers/docs/components/reference#thumbnail}
 */
const ThumbnailComponent = {
	type: 11,
	/**
	 * A url or attachment
	 */
	media: UnfurledMediaItem,
	/**
	 * Alt text for the media
	 * - NOT REQUIRED
	 */
	description: string | null,
	/**
	 * Whether the thumbnail should be a spoiler (or blurred out)
	 * - NOT REQUIRED
	 *
	 * @defaultValue `false`
	 */
	spoiler: boolean,
};

//! 12 - MediaGallery
/**
 * A Media Gallery is a top-level content component that allows you to display 1-10 media attachments in an organized gallery format. Each item can have optional descriptions and can be marked as spoilers.
 *
 * Media Galleries are only available in messages.
 *
 * @see {@link https://discord.com/developers/docs/components/reference#media-gallery}
 */
const MediaGalleryComponent = {
	type: 12,
	/**
	 * 1 to 10 media gallery items
	 */
	items: {
		/**
		 * A url or attachment
		 */
		media: APIUnfurledMediaItemItem,
		/**
		 * Alt text for the media
		 * - NOT REQUIRED
		 */
		description: string | null,
		/**
		 * Whether the media should be a spoiler (or blurred out)
		 *- NOT REQUIRED
		 *
		 * @defaultValue `false`
		 */
		spoiler: boolean,
	},
};

//! 13 - File
/**
 * A File is a top-level component that allows you to display an uploaded file as an attachment to the message and reference it in the component.
 *
 * Each file component can only display 1 attached file, but you can upload multiple files and add them to different file components within your payload.
 *
 * Files are only available in messages.
 *
 * @see {@link https://discord.com/developers/docs/components/reference#file}
 */
const FileComponent = {
	type: 13,
	/**
	 * This unfurled media item is unique in that it **only** support attachment references using the `attachment://<filename>` syntax
	 */
	file: UnfurledMediaItem,
	/**
	 * Whether the media should be a spoiler (or blurred out)
	 * - NOT REQUIRED
	 *
	 * @defaultValue `false`
	 */
	spoiler: boolean,
};

//! 14 - Separator
/**
 * A Separator is a top-level layout component that adds vertical padding and visual division between other components.
 *
 * Separators are only available in messages.
 *
 * @see {@link https://discord.com/developers/docs/components/reference#separator}
 */
const SeparatorComponent = {
	type: 14,
	/**
	 * Whether a visual divider should be displayed in the component
	 * - NOT REQUIRED
	 *
	 * @defaultValue `true`
	 */
	divider: boolean,
	/**
	 * Size of separator padding
	 * - NOT REQUIRED
	 *
	 * @defaultValue `SeparatorSpacingSize.Small`
	 */
	spacing: SeparatorSpacingSize,
};

const SeparatorSpacingSize = {
	Small: 1,
	Large: 2,
};

//! 17 - Container (Embed)
/**
 * A Container is a top-level layout component that holds up to 10 components. Containers are visually distinct from surrounding components and has an optional customizable color bar.
 *
 * Containers are only available in messages.
 *
 * @see {@link https://discord.com/developers/docs/components/reference#container}
 */
const ContainerComponent = {
	type: 17,
	/**
	 * Color for the accent on the container as RGB from `0x000000` to `0xFFFFFF`
	 */
	accent_color: number | null,
	/**
	 * Whether the container should be a spoiler (or blurred out)
	 *
	 * @defaultValue `false`
	 */
	spoiler: boolean,
	/**
	 * Up to 10 components of the type action row, text display, section, media gallery, separator, or file
	 */
	components: [
		ActionRowComponent,
		FileComponent,
		MediaGalleryComponent,
		SectionComponent,
		SeparatorComponent,
		TextDisplayComponent,
	],
};
