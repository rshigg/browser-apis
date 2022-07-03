import { createMachine, sendParent } from 'xstate';
import { escalate } from 'xstate/lib/actions';
import type { PermissionServices } from '@rshig/browser-apis-types';

type Context = {
	permissionState?: PermissionState;
};

export const permissionsMachine =
	/** @xstate-layout N4IgpgJg5mDOIC5QAUwCcC2BLWssHsA7WAOi0KwBcsBDAGywC9yoBiCIsMwgN3wGsuqTDjxFS5KrQbNCUBOT4BjGtSIBtAAwBdRKAAO+PGsJ6QAD0QBmAKwkA7ADZHAJhcBGRwA5HATns2Vu4ALAA0IACeiAC0miQujvaa7r4uwVZWXgm+7i5WAL754cLYuATE3FL0TCys6Gj4aCT6dKoAZo0YJCWi5RIU1NWy8or4KiZaukgghsblZpYILqkkVtm+vpqZyVaa9uFRCNEhwSS+gV629j4u1zY2hUUghPgQcGY9ZeKVgzIsZrMpEQFjF3O5Vul7FZEpsvBtkjYDqCbPYSMELrtNKkkpoHk9PmIKm8KJAAUYgaZpotjpkSLkbMF7NdcZpnOikQhEiRHDZXF53F4vMEtt5goViuhSoTSFA0DRCJRSdNASYQQhdo4HJ5gh4sYKbO5oRz3Cizh4eVjNHs-DYvOKQAS+s0Ghh9JQyXNgVTQbTfMF-JplkEvFCQxy0r5ubyXDYclj7GkfPbHeIPRS1cdXGd-UkgwLQ-tIjE8nF0Zk1llee57OdHvkgA */
	createMachine(
		{
			id: 'Permissions',
			tsTypes: {} as import('./permissions.typegen').Typegen0,
			schema: { context: {} as Context, services: {} as PermissionServices },
			initial: 'initializing',
			states: {
				initializing: {
					invoke: {
						src: 'checkPermission',
						onDone: [
							{
								actions: 'sendStateToParent',
							},
						],
						onError: [
							{
								actions: 'sendErrorToParent',
							},
						],
					},
				},
			},
		},
		{
			actions: {
				sendStateToParent: (_, event) => sendParent(event.data),
				sendErrorToParent: escalate((_, event) => event.data),
			},
		}
	);
