"use strict";

module.exports = function() {
	return ([
		{
			api: ['websocket'],
			path: 'subscribe',
			action: {
				controller: 'client',
				method: 'subscribe'
			}
		},
		{
			api: ['websocket'],
			path: 'unsubscribe',
			action: {
				controller: 'client',
				method: 'unsubscribe'
			}
		},
		{
			api: ['websocket'],
			path: 'message',
			action: {
				controller: 'client',
				method: 'message'
			}
		}
	]);
};
