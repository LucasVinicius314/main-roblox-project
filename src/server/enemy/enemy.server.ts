import { Enemy, TakeDamageParams } from "shared/enemy";
import { IntervalTimer } from "shared/interval-timer";
import { serverScriptService } from "shared/services";

const main = () => {
	if (script.IsDescendantOf(serverScriptService)) {
		return;
	}

	createBindableFunction();

	const timer = new IntervalTimer({
		interval: 1,
		callback: () => {
			const model = script.Parent as Model;

			for (const child of model.GetChildren()) {
				if (child.IsA("BasePart")) {
					child.CFrame = child.CFrame.mul(CFrame.Angles(0, math.rad(15), 0));
				}
			}
		},
	});

	timer.run();
};

const createBindableFunction = () => {
	const functionMap = new Map<string, Callback>();

	functionMap.set("take-damage", (params: TakeDamageParams) => {
		print(`damage: [${params.damage}]`);
	});

	Enemy.bind(script, functionMap);
};

main();
