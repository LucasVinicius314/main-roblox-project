import { EnemyData } from "shared/enemy-data";
import { PlayerData } from "shared/player-data";
import { Remotes } from "shared/remotes";

const playersService = game.GetService("Players");
const httpService = game.GetService("HttpService");

const SpawnEnemies = Remotes.Server.Get("SpawnEnemies");

const random = new Random();

const players: {
	[key: number]: {
		player: Player;
		data: PlayerData;
	};
} = {};

const enemies: {
	[key: string]: {
		part: Part;
		data: EnemyData;
	};
} = {};

playersService.PlayerAdded.Connect((player) => {
	players[player.UserId] = {
		player,
		data: {
			xp: 0,
		},
	};
});

SpawnEnemies.SetCallback((_) => {
	for (let index = 0; index < 5; index++) {
		spawnEnemy();
	}
});

const spawnEnemy = () => {
	const multiplier = 15;

	const x = random.NextNumber() * multiplier;
	const z = random.NextNumber() * multiplier;

	const uuid = httpService.GenerateGUID(false);

	const enemy = new Instance("Part");

	enemy.Position = new Vector3(x, 2, z);
	enemy.Parent = game.Workspace;
	enemy.Size = new Vector3(3, 3, 3);
	enemy.SetAttribute("uuid", uuid);

	enemies[uuid] = {
		part: enemy,
		data: {
			uuid,
		},
	};
};
