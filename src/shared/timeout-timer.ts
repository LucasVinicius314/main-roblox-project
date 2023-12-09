export type TimeoutTimerParams = {
	timeout: number;
	callback: () => void;
};

export class TimeoutTimer {
	constructor(params: TimeoutTimerParams) {
		this.params = params;
	}

	params: TimeoutTimerParams;

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

		wait(this.params.timeout);

		if (this.shouldRun) {
			this.params.callback();
		}

		this.isRunning = false;
	}
}
