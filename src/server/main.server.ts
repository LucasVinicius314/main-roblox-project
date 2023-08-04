import { EnemyData } from "shared/enemy-data";
import { PlayerData } from "shared/player-data";
import { Remotes } from "shared/remotes";

const playersService = game.GetService("Players");
const httpService = game.GetService("HttpService");

const RequestPlayerDataUpdate = Remotes.Server.Get("RequestPlayerDataUpdate");
const SpawnEnemies = Remotes.Server.Get("SpawnEnemies");
const UpdatePlayerData = Remotes.Server.Get("UpdatePlayerData");

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
			userId: player.UserId,
		},
	};

	player.AddTag("player");

	player.CharacterAdded.Connect((character) => {
		for (const child of character.GetChildren()) {
			child.AddTag("player_part");
			child.SetAttribute("player_userid", player.UserId);
		}
	});
});

RequestPlayerDataUpdate.Connect((player) => {
	print("inbound player event [RequestPlayerDataUpdate]");

	const playerData = players[player.UserId].data;

	updatePlayerData({ player, data: playerData });
});

SpawnEnemies.SetCallback((_) => {
	print("inbound player event [SpawnEnemies]");

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
	enemy.Touched.Connect((part) => {
		if (part.HasTag("player_part")) {
			const userId = part.GetAttribute("player_userid") as number;

			const playerPack = players[userId];

			playerPack.data.xp++;

			enemy.Destroy();

			updatePlayerData({ player: playerPack.player, data: playerPack.data });
		}
	});

	enemies[uuid] = {
		part: enemy,
		data: {
			uuid,
		},
	};
};

const updatePlayerData = ({ player, data }: { player: Player; data: PlayerData }) => {
	print("outbound player event [UpdatePlayerData]");

	UpdatePlayerData.SendToPlayer(player, data);
};
