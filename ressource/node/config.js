"use strict";

module.exports = function() {
	return ({
		dependencies: {},
		route: [
			'config/webSocket.js'
		],
		cdn: [],
		import: [
			{
				module: 'generic',
				as: 'socket',
				path: '/entity/util/socket.js'
			},
			{
				module: 'generic',
				as: 'respond',
				path: '/entity/respond.js'
			},
			{
				module: 'gossip',
				as: 'gossip',
				path: '/entity/gossip.js'
			}
		]
	});
};
