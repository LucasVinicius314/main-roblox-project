import { IntervalTimer } from "shared/interval-timer";
import { serverScriptService } from "shared/services";

const main = () => {
	if (script.IsDescendantOf(serverScriptService)) {
		return;
	}

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

	// TODO: fix, figure out script to script calling

	timer.run();
};

main();
