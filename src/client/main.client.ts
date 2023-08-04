import { PlayerData } from "shared/player-data";
import { Remotes } from "shared/remotes";

const userInputService = game.GetService("UserInputService");

const SpawnEnemies = Remotes.Client.Get("SpawnEnemies");
const UpdatePlayerScore = Remotes.Client.Get("UpdatePlayerScore");

const playerData: PlayerData = {
	xp: 0,
};

userInputService.InputBegan.Connect(async (input, _) => {
	if (input.KeyCode.Name === "F") {
		await SpawnEnemies.CallServerAsync();
	}
});

UpdatePlayerScore.Connect((xp) => {
	playerData.xp = xp;
});
