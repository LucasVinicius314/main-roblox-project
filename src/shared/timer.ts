export type TimerParams = {
	interval: number;
	callback: () => void;
};

export class Timer {
	constructor(params: TimerParams) {
		this.params = params;
	}

	params: TimerParams;

	shouldRun = true;
	isRunning = false;

	cancel() {
		this.shouldRun = false;
	}

	async run() {
		if (this.isRunning) {
			return;
		}

		this.isRunning = true;

		while (this.shouldRun) {
			this.params.callback();

			wait(this.params.interval);
		}

		this.isRunning = false;
	}
}
