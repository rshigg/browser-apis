import { createMachine, assign } from 'xstate';
import type { WakeLockSentinel, ScreenWakeLockOptions } from '@rshig/browser-apis-types';

type Context = ScreenWakeLockOptions & {
	sentinel: WakeLockSentinel | null;
};

type Services = {
	requestWakeLock: { data: WakeLockSentinel };
};

export const screenWakeLockMachine =
	/** @xstate-layout N4IgpgJg5mDOIC5QGUDGAnMYB2ACA6gIYDWYuAMgParEB0AltvQC72EA29AXo1AMQRK2MA2wA3SqVppMOAiTJUaolm049sUBIwmpCrIQG0ADAF1EoAA6VYqoRZAAPRAFYAbAE5aAFjcAONwAmAEZvQO8AZgB2CMCAGhAAT0QPYNpjDONol2NgwPCXCIBfIoSZLDwiUgpqOkZVDm5ePjB0dEp0Wkt2fQAzDoBbaQwK+WqlOqZWRo0tHWp9eiMzB2tbA2wHZwQQ2kDUiI8XfI9AiOCPNzcE5J2PCNoov1Dglzzcvyi3ErKRuSrFLVaIRUKwxGA+AAlACi5GhAEFkNDVjY7JskE5EN4XH50lF7lFghFvMFCTEbohDmlMsYjoE-NEzi4fiByv8FDVlJh2GBCLBIFDocgACrwyHClHrJbo0DbWJRWh+PwkwI44zPPyXFwUhBvB7nDxfQJuWkuI7eFlsyociZ8DgAd0IiXgGLWaIctwiLkeET8WWN3k1+xN3gS22CxlVtDcwU8fvpV1ywRKpRA2EoEDgDitY0Bynq03UvEl7ox4dptAjgWMOMi2JjpJ1ROMtByGXO7g8HnVxMtf2t4yBILBYBLGy2lMNj3uqqyqWVRx1gS+6UyUXVSvxkT7sgHebo3N5-IgY+lE4Q+Lciux6pcOWXpx1OSvz0NEWiwQZ2I8O9GAM5dAAK7YLAgGWNY6DMJAp72GWrjeHsUQuE8baXJqwSxjqESeLQpzeIaCbdu8Fqpjm-4TDBMqYggAC0gSPOqIZROuXx+u+1xJIgn6rhkZypG4ZpRPSKZFEAA */
	createMachine(
		{
			id: 'Screen Wake Lock',
			tsTypes: {} as import('./screen-wake-lock.typegen').Typegen0,
			schema: {
				context: {} as Context,
				services: {} as Services,
			},
			context: { reaquireLockWhenVisible: true, releaseOnLoad: false, sentinel: null },
			initial: 'initializing',
			states: {
				initializing: {
					invoke: {
						src: 'requestWakeLock',
						onDone: [
							{
								cond: 'releaseOnLoad',
								actions: ['storeSentinel', 'release'],
								target: 'released',
							},
							{
								actions: 'storeSentinel',
								target: 'active',
							},
						],
						onError: [
							{
								target: 'unsupported',
							},
						],
					},
				},
				active: {
					invoke: {
						src: (ctx) => (callback) => {
							const releaseCallback = () => callback('RELEASE');
							ctx.sentinel?.addEventListener('release', releaseCallback);

							return () => ctx.sentinel?.removeEventListener('release', releaseCallback);
						},
					},
					on: {
						RELEASE: {
							actions: 'release',
							target: 'released',
						},
					},
				},
				released: {
					invoke: {
						src: (ctx) => (callback) => {
							if (ctx.reaquireLockWhenVisible) {
								const handleVisibilityChange = () => {
									if (document.visibilityState === 'visible') {
										callback('RESTART');
									}
								};
								document.onvisibilitychange = handleVisibilityChange;
							}
						},
					},
					on: {
						RESTART: {
							target: 'initializing',
						},
					},
				},
				unsupported: {
					type: 'final',
				},
			},
		},
		{
			actions: {
				storeSentinel: assign((_, event) => ({ sentinel: event.data })),
				release: (ctx) => ctx.sentinel?.release(),
			},
			services: {
				requestWakeLock: async () => await navigator.wakeLock.request('screen'),
			},
			guards: {
				releaseOnLoad: (ctx, event) => ctx.releaseOnLoad === true || event.data.released,
			},
		}
	);
