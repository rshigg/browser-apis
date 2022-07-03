export async function queryPermissionByName(name: PermissionName) {
	const { state } = await navigator.permissions.query({ name });
	return state;
}

// Notification
const notificationStateMap: Record<NotificationPermission, PermissionState> = {
	default: 'prompt',
	denied: 'denied',
	granted: 'granted',
};

export async function checkNotificationPermissions(): Promise<PermissionState> {
	try {
		return await queryPermissionByName('notifications');
	} catch {
		if (!('Notification' in window)) {
			throw new Error('The notification API is not supported in this browser.');
		}
		return notificationStateMap[Notification.permission];
	}
}

export async function requestNotificationPromisified(): Promise<NotificationPermission> {
	return new Promise((resolve, reject) => {
		try {
			Notification.requestPermission(resolve);
		} catch (error) {
			reject(error);
		}
	});
}

export async function requestNotificationPermission(): Promise<PermissionState> {
	let state: NotificationPermission;
	try {
		state = await Notification.requestPermission();
	} catch (e) {
		console.log('e', e);
		state = await requestNotificationPromisified();
		console.log('state', state);
	}
	return notificationStateMap[state];
}
