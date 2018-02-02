"use strict";

module.exports = function($) {
    return $.require([
        'import!gossip',
        'module!/entity/handle.js'
    ], function(
        gossip,
        handle
    ) {

        var obj = function() {
            const config = $.config.get('node');
            const node = new gossip({
                ip: '127.0.0.1',
                port: config.port,
                node: true,
                seed: config.peer
            });
            console.log(config);
            node.on('message', function(data) {
                var all = data.packet(), p = all.payload;
                console.log('packet', p);
                handle.send(p.event, p.data);
                data.relay();
            });
            node.on('connection', function(data) {
                console.log('peer', data);
            });
            node.on('error', function(err) {
                console.log('error', err);
            });
            this.node = node;
        };
        obj.prototype = {
            send: function(data) {
                this.node.send({
                    event: 'message',
                    data: data
                });
                handle.send('message', data);
            }
        };

        return ({'static private': obj});
    });
};
