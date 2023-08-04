import Net from "@rbxts/net";
import { PlayerData } from "./player-data";

export const Remotes = Net.Definitions.Create({
	RequestPlayerDataUpdate: Net.Definitions.ClientToServerEvent(),
	SpawnEnemies: Net.Definitions.ServerAsyncFunction<() => void>(),
	UpdatePlayerData: Net.Definitions.ServerToClientEvent<[PlayerData]>(),
});
