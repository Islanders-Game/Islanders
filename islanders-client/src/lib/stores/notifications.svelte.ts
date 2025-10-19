export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
	id: string;
	message: string;
	type: NotificationType;
	timeout?: number; // ms
	createdAt: number;
}

class Notifications {
	items = $state<Notification[]>([]);

	private push(message: string, type: NotificationType, timeout = 4000) {
		const id = crypto.randomUUID();
		const note: Notification = { id, message, type, timeout, createdAt: Date.now() };
		this.items = [note, ...this.items];
		if (timeout > 0) {
			setTimeout(() => this.dismiss(id), timeout);
		}
		return id;
	}

	info(message: string, timeout?: number) {
		return this.push(message, 'info', timeout);
	}

	success(message: string, timeout?: number) {
		return this.push(message, 'success', timeout);
	}

	warning(message: string, timeout?: number) {
		return this.push(message, 'warning', timeout);
	}

	error(message: string, timeout?: number) {
		return this.push(message, 'error', timeout ?? 6000);
	}

	dismiss(id: string) {
		this.items = this.items.filter((n) => n.id !== id);
	}

	clear() {
		this.items = [];
	}
}

export const notifications = new Notifications();
