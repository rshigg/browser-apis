import { createMachine } from 'xstate';
import { checkNotificationPermissions, requestNotificationPermission } from './utils';
import type { NotificationParameters, PermissionServices } from '@rshig/browser-apis-types';

type Services = PermissionServices;

type Events =
	| { type: 'REQUEST_PERMISSION' }
	| { type: 'SEND_NOTIFICATION'; args: NotificationParameters };

export const notificationMachine =
	/** @xstate-layout N4IgpgJg5mDOIC5QDkD2AXAlgM0wYwEMtUA7AOkxMywIBtMAvSqAYglLApIDdUBrTmiy5CxcpWqY6jZgkq9RmUgG0ADAF1EoAA6pYk0lpAAPRABYAnAGYyAJjP2A7KqsBWVQEZVZqwBoQAJ6IHq4WZBYetgBsVlbejo4AHB4eiQC+af5COPhESuJUNPRMJKxgAE7lqOVk2rRE2NUAtmTZInmkXJLSJVByPKiKKhpGuvpiRqYIjmZkjlGqFqGutvaJUR5+gcGhZOuOm1H2i1EzrhlZGDlD5ABGAK6wAWwcXLwCrVftYmQPT-0KDokNSaJAgMYGEiTRAAWlSYSs1ncrii6xcyUc-iCCCsCz2sQ881UiSStmJFxAbVyPz+zwqVRqdQazU+wmp+V+jwCAMGQJBoz0kOhOMctjIRzMHjMPlcDhSUSxiA2UTmiVcUtUCws60SFgpVJuFAgtDALAASgBRACKAFULQBlAAqAH0AAoWs0AWQAkvb7d6APLIAXjfLC9xiixRdVRDbS0WJRUIKIRcUeKKSsyJaUWMnpTKUr7szrlMAECDPe0W5AAEWdyADju9ADFvQBhACCTaDIaFYKmZI84VcySWR3cXkSW2xuNU+KsISsJNsI4X+qLhtL5eelttDpd7q9vv9PbBEIm-cQiLIKxcqlWC4X6KTrlcjjIHlzlhWDlsutsGQFiQqAQHARgGkCXRFDIpS9heoBTK4NgRLE96OKuSRIa4Sa2DYjhfiiupIRYZj4VY65soa7AkGAcFhpeCAwiuZCLF4KxnG4JFWGYOGqK4ZC4gchKEhipzkQWEE0lydGGAxcKxHMFj3rGnFWKKCrbMmuzKkuqK4ikPgUdckGYMatFnoK8EmIgsphG+2a2J+0pLhYFhJj4YpYZqnihGcZhGd8HJbhWMlQgxKTvp4JykZEEQpjxmkru+krRIiKYWPhb5RAFxZhToln0QhsKOTYiJuHxqILEuhJJjClh2Ko6G4ZqViOZq6aAWkQA */
	createMachine(
		{
			tsTypes: {} as import('./notification.typegen').Typegen0,
			schema: { services: {} as Services, events: {} as Events },
			id: 'Notification',
			initial: 'initializing',
			states: {
				initializing: {
					invoke: {
						src: 'checkPermission',
						onDone: [
							{
								cond: 'denied',
								target: 'done',
							},
							{
								cond: 'granted',
								target: 'ready',
							},
							{
								cond: 'prompt',
								target: 'idle',
							},
						],
						onError: [
							{
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
						src: 'requestPermission',
						onDone: [
							{
								cond: 'denied',
								target: 'done',
							},
							{
								cond: 'granted',
								target: 'ready',
							},
							{
								cond: 'prompt',
								target: 'idle',
							},
						],
						onError: [
							{
								target: 'idle',
							},
						],
					},
				},
				idle: {
					on: {
						REQUEST_PERMISSION: {
							target: 'busy',
						},
					},
				},
				ready: {
					on: {
						SEND_NOTIFICATION: [
							{
								actions: 'sendNotification',
								cond: 'canSendNotification',
							},
							{
								target: 'busy',
							},
						],
						REQUEST_PERMISSION: {
							target: 'busy',
						},
					},
				},
			},
		},
		{
			actions: {
				sendNotification: (_, event) => new Notification(...event.args),
			},
			services: {
				checkPermission: checkNotificationPermissions,
				requestPermission: requestNotificationPermission,
			},
			guards: {
				denied: (_, event) => event.data === 'denied',
				granted: (_, event) => event.data === 'granted',
				prompt: (_, event) => event.data === 'prompt',
				canSendNotification: () => Notification.permission === 'granted',
			},
		}
	);
