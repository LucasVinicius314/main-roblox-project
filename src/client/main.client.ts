import { PlayerData } from "shared/player-data";
import { PlayerUI } from "shared/player-ui";
import { Remotes } from "shared/remotes";

const playersService = game.GetService("Players");
const userInputService = game.GetService("UserInputService");

const player = playersService.LocalPlayer;

let playerUI: PlayerUI | undefined = undefined;

const RequestPlayerDataUpdate = Remotes.Client.Get("RequestPlayerDataUpdate");
const SpawnEnemies = Remotes.Client.Get("SpawnEnemies");
const UpdatePlayerData = Remotes.Client.Get("UpdatePlayerData");

let playerData: PlayerData = {
	userId: 0,
	xp: 0,
};

player.CharacterAdded.Connect((character) => {
	const playerGui = player.FindFirstChild("PlayerGui") as PlayerGui;

	const screenGui = playerGui.WaitForChild("ScreenGui") as ScreenGui;

	const xpLabel = screenGui.FindFirstChild("XPLabel", true) as TextLabel;

	playerUI = {
		playerGui,
		screenGui,
		xpLabel,
	};

	print("outbound player event [RequestPlayerDataUpdate]");

	RequestPlayerDataUpdate.SendToServer();
});

userInputService.InputBegan.Connect(async (input, _) => {
	if (input.KeyCode.Name === "F") {
		print("outbound player event [SpawnEnemies]");

		await SpawnEnemies.CallServerAsync();
	}
});

UpdatePlayerData.Connect((data) => {
	print("inbound player event [UpdatePlayerData]");

	playerData = data;

	if (playerUI !== undefined) {
		playerUI.xpLabel.Text = tostring(playerData.xp);
	}
});
