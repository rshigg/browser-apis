import * as React from 'react';
import ReactDOM from 'react-dom';
import './tailwind.css';

import { useGeolocation, useNotification, useScreenWakeLock } from '@rshig/use-browser-apis';

type FormElements<U extends string> = HTMLFormControlsCollection & Record<U, HTMLInputElement>;

const buttonStyles =
	'text-sm p-2 bg-white rounded border border-black transition-colors enabled:hover:bg-neutral-100 disabled:opacity-50';

const inputStyles =
	'shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md';

const Card = ({ title, description, children }) => (
	<div className="bg-neutral-50 max-w-lg border shadow sm:rounded-lg">
		<div className="px-4 py-5 sm:p-6">
			<h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
			{description && (
				<div className="mt-2 max-w-xl text-sm text-gray-500">
					<p>{description}</p>
				</div>
			)}
			<div className="mt-4">{children}</div>
		</div>
	</div>
);

const Root = () => {
	const { getPosition, currentState: geolocationState, data: position } = useGeolocation();
	const {
		requestPermission,
		sendNotification,
		currentState: notificationState,
	} = useNotification();

	const showNotificationForm = notificationState === 'ready';
	const disableNotificationButton = ['initializing', 'done', 'busy'].includes(notificationState);

	const handleNotificationButtonClick = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (notificationState === 'idle') {
			requestPermission();
		} else if (notificationState === 'ready') {
			const { title, body } = e.currentTarget.elements as FormElements<'title' | 'body'>;
			sendNotification(title.value, { body: body.value, silent: true });
		}
	};

	const { currentState } = useScreenWakeLock({
		reaquireLockWhenVisible: false,
		releaseOnLoad: true,
	});
	console.log('currentState', currentState);

	return (
		<div className="space-y-4 p-8">
			<h1 className="text-3xl">Permissions</h1>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					getPosition();
				}}
			>
				<Card
					title="Geolocation API"
					description={`Your position: ${
						position
							? `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`
							: 'No position data yet.'
					}`}
				>
					<button type="submit" className={buttonStyles}>
						{geolocationState === 'done' && 'Not available'}
						{geolocationState === 'idle' && 'Get position'}
						{geolocationState === 'busy' && 'Loading...'}
					</button>
				</Card>
			</form>

			<Card title="Notification API" description={`State: ${notificationState}`}>
				{showNotificationForm && (
					<form onSubmit={handleNotificationButtonClick} className="flex flex-col gap-2">
						<label htmlFor="title">
							<span>Notification title</span>
							<input type="text" id="title" name="title" className={inputStyles} />
						</label>
						<label htmlFor="body">
							<span>Notification body</span>
							<input type="text" id="body" name="body" className={inputStyles} />
						</label>
						<button type="submit" className={buttonStyles}>
							Send notification
						</button>
					</form>
				)}
				{!showNotificationForm && (
					<button
						onClick={requestPermission}
						className={buttonStyles}
						disabled={disableNotificationButton}
					>
						{notificationState === 'done' && 'Not available'}
						{notificationState === 'idle' && 'Request notification permissions'}
						{notificationState === 'busy' && 'Loading...'}
					</button>
				)}
			</Card>
		</div>
	);
};

const App = document.getElementById('root');

ReactDOM.render(<Root />, App);
