import { EnemyData } from "shared/enemy-data";
import { PlayerData } from "shared/player-data";
import { Remotes } from "shared/remotes";
import { httpService, playersService, serverScriptService, serverStorage } from "shared/services";
import { IntervalTimer } from "shared/interval-timer";
import { TurretData } from "shared/turret-data";
import { TimeoutTimer } from "shared/timeout-timer";

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

game.Workspace.DescendantAdded.Connect((descendant) => {
	importScriptForInstance(descendant);
	importReplacementForInstance(descendant);
});

const importReplacementForInstance = (instance: Instance) => {
	if (instance.Name.sub(0, 1) !== "<") {
		return;
	}

	const foundReplacement = serverStorage.FindFirstChild(instance.Name.sub(2, instance.Name.size() - 1));

	if (foundReplacement === undefined) {
		return;
	}

	const replacement = foundReplacement.Clone();

	replacement.Parent = instance.Parent;

	print(`replaced [${instance.Name}]`);

	instance.Destroy();
};

const importScriptForInstance = (instance: Instance) => {
	const importScript = instance.GetAttribute("import_script") as string | undefined;

	if (importScript === undefined) {
		return;
	}

	print(`importing [${importScript}] for [${instance.Name}]`);

	const baseScript = serverScriptService
		.FindFirstChild("TS")
		?.FindFirstChild(importScript)
		?.FindFirstChild(importScript) as Script | undefined;

	if (baseScript === undefined) {
		return;
	}

	const newScript = baseScript.Clone();

	newScript.Parent = instance;
};

const spawnEnemy = () => {
	const multiplier = 15;

	const x = random.NextNumber() * multiplier;
	const z = random.NextNumber() * multiplier;

	const uuid = httpService.GenerateGUID(false);

	const enemy = new Instance("Part");
	enemy.Name = "Enemy";
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

const spawnLaser = (startPosition: Vector3, endPosition: Vector3) => {
	const laser = new Instance("LineHandleAdornment");

	laser.Transparency = 0.5;
	laser.Adornee = game.Workspace.Terrain;
	laser.Color3 = new Color3(1, 0, 0);
	laser.Parent = game.Workspace;
	laser.Thickness = 5;

	laser.AlwaysOnTop = true;
	laser.ZIndex = 10;

	laser.Length = endPosition.sub(startPosition).Magnitude;
	laser.CFrame = new CFrame(startPosition, endPosition).mul(new CFrame(0, 0, -laser.Length / 2));

	const timer = new TimeoutTimer({
		timeout: 1,
		callback: () => {
			laser.Destroy();
		},
	});

	timer.run();
};

const spawnTurret = () => {
	const multiplier = 15;

	const x = random.NextNumber() * multiplier;
	const z = random.NextNumber() * multiplier;

	const uuid = httpService.GenerateGUID(false);

	const turret = new Instance("Part");
	turret.Parent = game.Workspace;
	turret.Color = new Color3(0, 0.5, 0);
	turret.Position = new Vector3(x, 2, z);
	turret.Size = new Vector3(3, 3, 3);
	turret.SetAttribute("uuid", uuid);
	turret.AddTag("turret");

	const billboardGui = (serverStorage.FindFirstChild("HPBarBillboardGui") as BillboardGui | undefined)?.Clone();

	if (billboardGui !== undefined) {
		billboardGui.Parent = turret;
		billboardGui.StudsOffsetWorldSpace = new Vector3(0, 3, 0);

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

	const timer = new IntervalTimer({
		interval: 2,
		callback: () => {
			for (const part of game.Workspace.GetPartBoundsInRadius(turret.Position, 20)) {
				if (part.HasTag("enemy")) {
					spawnLaser(turret.Position, part.Position);

					part.Destroy();

					break;
				}
			}
		},
	});

	timer.run();
};

const updatePlayerData = ({ player, data }: { player: Player; data: PlayerData }) => {
	print("outbound player event [UpdatePlayerData]");

	UpdatePlayerData.SendToPlayer(player, data);
};

const timer = new IntervalTimer({
	interval: 30,
	callback: () => {
		spawnEnemy();
	},
});

timer.run();

for (const descendant of game.Workspace.GetDescendants()) {
	importScriptForInstance(descendant);
	importReplacementForInstance(descendant);
}
