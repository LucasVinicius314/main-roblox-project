// TODO: fix, rename
export type TakeDamageParams = { damage: number };

export type TakeDamage = (key: string, params: TakeDamageParams) => void;

// TODO: fix, rename
export class Enemy {
	constructor(newBindableFunction: BindableFunction<Callback>) {
		this.bindableFunction = newBindableFunction;
	}

	static from: (instance: Instance) => Enemy | undefined = (instance) => {
		const foundBindableFunction = instance.FindFirstChild("enemy")?.FindFirstChild("BindableFunction") as
			| BindableFunction
			| undefined;

		if (foundBindableFunction === undefined) {
			return undefined;
		}

		return new Enemy(foundBindableFunction);
	};

	static bind: (
		newScript: LuaSourceContainer,
		functionMap: Map<string, Callback>,
	) => BindableFunction<Callback> | undefined = (newScript, functionMap) => {
		const bindableFunction = new Instance("BindableFunction");

		bindableFunction.Parent = newScript;
		bindableFunction.Name = "BindableFunction";

		for (const entry of functionMap) {
			const key = entry[0];
			const callback = entry[1];

			bindableFunction.OnInvoke = (...params) => {
				print(`invoking [${key}] inside [Enemy]`);

				callback(params);
			};
		}

		return bindableFunction;
	};

	bindableFunction: BindableFunction<Callback>;

	takeDamage = (params: TakeDamageParams) => {
		this.bindableFunction.Invoke("take-damage", params);
	};
}
