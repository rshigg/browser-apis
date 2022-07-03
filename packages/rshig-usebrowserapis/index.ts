import * as React from 'react';
import { useMachine } from '@xstate/react';
import {
	geolocationMachine,
	notificationMachine,
	screenWakeLockMachine,
} from '@rshig/browser-apis';
import type {
	PermissionMachineState,
	GeolocationOptions,
	NotificationParameters,
	ScreenWakeLockOptions,
	ScreenWakeLockStates,
} from '@rshig/browser-apis-types';

export function useGeolocation(options?: GeolocationOptions) {
	const [state, send] = useMachine(geolocationMachine, {
		context: options,
	});

	const currentState = state.value as PermissionMachineState;

	const { data, error } = state.context;

	const getPosition = () => {
		send('GET_POSITION');
	};

	return { currentState, data, error, getPosition };
}

export function useNotification() {
	const [state, send] = useMachine(notificationMachine);

	const currentState = state.value as PermissionMachineState;

	const requestPermission = () => {
		send('REQUEST_PERMISSION');
	};

	const sendNotification = (...args: NotificationParameters) => {
		send({ type: 'SEND_NOTIFICATION', args });
	};

	return { currentState, requestPermission, sendNotification };
}

export function useScreenWakeLock(options?: ScreenWakeLockOptions) {
	const [state, send] = useMachine(screenWakeLockMachine, {
		context: options,
	});

	const currentState = state.value as ScreenWakeLockStates;

	const releaseLock = React.useCallback(() => {
		send('RELEASE');
	}, [send]);

	const reaquireLock = React.useCallback(() => {
		send('RESTART');
	}, [send]);

	return { currentState, releaseLock, reaquireLock };
}
