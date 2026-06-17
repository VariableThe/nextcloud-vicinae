/// <reference types="@vicinae/api">

/*
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 */

type ExtensionPreferences = {
  /** Hostname - Hostname of Nextcloud instance */
	"hostname"?: string;

	/** Username - Your username */
	"username"?: string;

	/** App Password - Go to Nextcloud > Settings > Security > Devices & sessions, and create a new app password */
	"password"?: string;

	/** Search Scope - Specify search scope (e.g. Documents) or leave empty to search all files */
	"scope": string;
}

declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Command: Search Files */
	export type Search = ExtensionPreferences & {
		/** Files Owner - This is the username owning files (usually same as username) */
		"files_owner": string;
	}

	/** Command: List Favorites */
	export type Favorites = ExtensionPreferences & {
		
	}

	/** Command: Show Activity */
	export type Activity = ExtensionPreferences & {
		
	}

	/** Command: Show Deck */
	export type Deck = ExtensionPreferences & {
		
	}

	/** Command: Show Notes */
	export type Notes = ExtensionPreferences & {
		
	}
}

declare namespace Arguments {
  /** Command: Search Files */
	export type Search = {
		
	}

	/** Command: List Favorites */
	export type Favorites = {
		
	}

	/** Command: Show Activity */
	export type Activity = {
		
	}

	/** Command: Show Deck */
	export type Deck = {
		
	}

	/** Command: Show Notes */
	export type Notes = {
		
	}
}