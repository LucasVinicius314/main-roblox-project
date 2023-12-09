import { EnemyData } from "shared/enemy-data";
import { PlayerData } from "shared/player-data";
import { Remotes } from "shared/remotes";
import { httpService, playersService, serverStorage } from "shared/services";
import { Timer } from "shared/timer";
import { TurretData } from "shared/turret-data";

const RequestPlayerDataUpdate = Remotes.Server.Get("RequestPlayerDataUpdate");
const SpawnTurret = Remotes.Server.Get("SpawnTurret");
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

const turrets: {
	[key: string]: {
		part: Part;
		data: TurretData;
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

SpawnTurret.SetCallback((_) => {
	print("inbound player event [SpawnTurret]");

	spawnTurret();
});

const spawnEnemy = () => {
	const multiplier = 15;

	const x = random.NextNumber() * multiplier;
	const z = random.NextNumber() * multiplier;

	const uuid = httpService.GenerateGUID(false);

	const enemy = new Instance("Part");
	enemy.Parent = game.Workspace;
	enemy.Position = new Vector3(x, 2, z);
	enemy.Size = new Vector3(3, 3, 3);
	enemy.SetAttribute("uuid", uuid);
	enemy.AddTag("enemy");
	enemy.Touched.Connect((part) => {
		if (part.HasTag("player_part")) {
			const userId = part.GetAttribute("player_userid") as number;

			const playerPack = players[userId];

			playerPack.data.xp++;

			enemy.Destroy();

			updatePlayerData({ player: playerPack.player, data: playerPack.data });
		}
	});

	const billboardGui = (serverStorage.FindFirstChild("HPBarBillboardGui") as BillboardGui | undefined)?.Clone();

	if (billboardGui !== undefined) {
		billboardGui.Parent = enemy;
		billboardGui.StudsOffsetWorldSpace = new Vector3(0, 2, 0);

		const hpLabel = billboardGui.FindFirstChild("HPLabel") as TextLabel | undefined;
		if (hpLabel !== undefined) {
			hpLabel.Text = "Enemy";
		}
	}

	enemies[uuid] = {
		part: enemy,
		data: {
			uuid,
		},
	};
};

const spawnTurret = () => {
	const multiplier = 15;

	const x = random.NextNumber() * multiplier;
	const z = random.NextNumber() * multiplier;

	const uuid = httpService.GenerateGUID(false);

	const turret = new Instance("Part");
	turret.Parent = game.Workspace;
	turret.Position = new Vector3(x, 2, z);
	turret.Size = new Vector3(3, 3, 3);
	turret.SetAttribute("uuid", uuid);
	turret.AddTag("turret");

	const billboardGui = (serverStorage.FindFirstChild("HPBarBillboardGui") as BillboardGui | undefined)?.Clone();

	if (billboardGui !== undefined) {
		billboardGui.Parent = turret;
		billboardGui.StudsOffsetWorldSpace = new Vector3(0, 2, 0);

		const hpLabel = billboardGui.FindFirstChild("HPLabel") as TextLabel | undefined;
		if (hpLabel !== undefined) {
			hpLabel.Text = "Turret";
		}
	}

	turrets[uuid] = {
		part: turret,
		data: {
			uuid,
		},
	};

	const timer = new Timer({
		interval: 2,
		callback: () => {
			for (const part of game.Workspace.GetPartBoundsInRadius(turret.Position, 6)) {
				if (!part.HasTag("enemy")) {
					continue;
				}

				part.Destroy();
			}
		},
	});

	timer.run();
};

const updatePlayerData = ({ player, data }: { player: Player; data: PlayerData }) => {
	print("outbound player event [UpdatePlayerData]");

	UpdatePlayerData.SendToPlayer(player, data);
};

const timer = new Timer({
	interval: 10,
	callback: () => {
		spawnEnemy();
	},
});

timer.run();
