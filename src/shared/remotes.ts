import Net from "@rbxts/net";

export const Remotes = Net.Definitions.Create({
	SpawnEnemies: Net.Definitions.ServerAsyncFunction<() => void>(),
	UpdatePlayerScore: Net.Definitions.ServerToClientEvent<[number]>(),
});
