import { assign, createMachine } from 'xstate';
import { queryPermissionByName } from './utils';
import type { GeolocationOptions, PermissionServices } from '@rshig/browser-apis-types';

type Context = GeolocationOptions & {
	permissionState?: PermissionState;
	data?: GeolocationPosition;
	error?: GeolocationPositionError;
};

type Services = PermissionServices & {
	getPosition: { data: GeolocationPosition };
};

function getPosition(options?: PositionOptions): Promise<GeolocationPosition> {
	return new Promise((resolve, reject) =>
		navigator.geolocation.getCurrentPosition(resolve, reject, options)
	);
}

export const geolocationMachine =
	/** @xstate-layout N4IgpgJg5mDOIC5QHEwHsA2aDGBDALgJZoB2AdISYUbhoQF6VQDEEpYFJAbmgNYepMOAsXKVqhWgyYJKPPEVIBtAAwBdRKAAOaWBNKaQAD0QBWAGwB2MioDM5lQE5bj8+YAcAFkeOANCABPRHd3MlN3W08Vc09TFVNLc1sAJgBfVP9BLAVRTgkpRhIWMAAnErQSsi0MAgAzCoBbMizhRTEqGjpCqFluVtFVDSQQHT02wxMEOIBGMhd3ZOnHU2cLT2nPfyCEAFpzRznPSxVk9xXp5OSfafTM9GyRUjIAIwBXWADWdk4efmb7-pPN4fXryR4kQaGUb6EgTRCWUKuczTFYJWwLOKmLaIfY2CLrRyeTy2aZLaaWW4gFo5IHvT6lcqVap1Rr-IQ08jAgKgwEQ9RQ3QwuEIEm2MjucyLRKknzODbYkUIsjTBwLFwbCInSnU8EUCAYMDMZAAUQAKgB9AAKAHkAMoASVN9utADkBWNRMLyck5o4VKTwu5oskHJYFcl-eL-ccvK5bKZksT0hkQCQ0BA4IYdW08p1pEV3ULhpNLiobHEvNMzonluEFTt3LMvMdbJZLNMSSo7NqARyyGwSGBC+Ni-DzKYyO2uy4Tp2YvWLIdjl23LYUpZYj32bqucPPaORZEyEd7Cog7YnHEw4FENMnDYPMt1iG2yrPFuHjnCPqh8NoSPQEmdxrGOTxknRTwFjPElzAVFJPDCZwUgTFU2wWD9eT3AwD1MBCkRRZZLHRZJMXrFEEObFQoiJBxySI5NUiAA */
	createMachine(
		{
			tsTypes: {} as import('./geolocation.typegen').Typegen0,
			schema: { context: {} as Context, services: {} as Services },
			id: 'Geolocation',
			initial: 'initializing',
			states: {
				initializing: {
					invoke: {
						src: 'checkPermission',
						onDone: [
							{
								actions: 'setPermissionState',
								cond: 'denied',
								target: 'done',
							},
							{
								actions: 'setPermissionState',
								cond: 'granted',
								target: 'busy',
							},
							{
								actions: 'setPermissionState',
								cond: 'prompt',
								target: 'idle',
							},
						],
						onError: [
							{
								actions: 'setError',
								target: 'done',
							},
						],
					},
				},
				done: {
					type: 'final',
				},
				busy: {
					invoke: {
						src: 'getPosition',
						onDone: [
							{
								actions: ['setPosition', () => assign({ permissionState: 'granted' })],
								target: 'idle',
							},
						],
						onError: [
							{
								actions: 'setError',
								cond: 'hideOnError',
								target: 'done',
							},
							{
								actions: 'setError',
								target: 'idle',
							},
						],
					},
				},
				idle: {
					on: {
						GET_POSITION: {
							target: 'busy',
						},
					},
				},
			},
		},
		{
			actions: {
				setPermissionState: assign((_, event) => ({ permissionState: event.data })),
				setPosition: assign((_, event) => ({ data: event.data })),
				setError: assign((_, event) => ({ error: event.data as GeolocationPositionError })),
			},
			services: {
				checkPermission: async () => await queryPermissionByName('geolocation'),
				getPosition: async (ctx) => await getPosition(ctx.positionOptions),
			},
			guards: {
				denied: (_, event) => event.data === 'denied',
				granted: (_, event) => event.data === 'granted',
				prompt: (_, event) => event.data === 'prompt',
				hideOnError: (ctx) => ctx.hideOnError === true,
			},
		}
	);
