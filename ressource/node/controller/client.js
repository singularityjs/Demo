"use strict";

module.exports = function($) {
	return $.require([
		'module!entity/handle.js',
		'module!entity/node.js',
	], function(
		handle,
		node
	) {

		var obj = function() {
			this._name = {};
		};
		obj.prototype = $.extends('!controller', {
			subscribe: function(data) {
				if ($.is.string(data.body.user)) {
					this._name[data.socket.id()] = data.body.user;
					handle.subscribe(data.socket);
				}
			},

			unsubscribe: function(data) {
				handle.unsubscribe(data.socket);
			},

			message: function(data) {
				if (this._name[data.socket.id()] && $.is.string(data.body.message)) {
					node.send({
						user: this._name[data.socket.id()],
						time: $.time.now().get,
						message: data.body.message
					});
				}
			}
		});

		return ({'static private': obj});
	});
};
