export type IntervalTimerParams = {
	interval: number;
	callback: () => void;
};

export class IntervalTimer {
	constructor(params: IntervalTimerParams) {
		this.params = params;
	}

	params: IntervalTimerParams;

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
