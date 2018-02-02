<div align="center">
  <a href="https://github.com/singularityjs/Singularity">
    <img width="200" heigth="200" src="https://github.com/singularityjs/Assets/blob/master/logo.png?raw=true">
  </a>

  <h1>Singularity</h1>

  <p>A NodeJS framework oriented towards organizing code into modules for service based applications.</p>
</div>

### `Chat project`
This is a example project that shows how to use the framework. This is meant as a demo.

The full project can be found [here](https://github.com/anzerr/peer_chat)
```shell
    git clone --recursive https://github.com/anzerr/peer_chat
```
You can run the test that will create a cluster of 5 servers on ports [500, 510, 520, 530, 540]


#### `Create project`
Use the one line command to create a base app
```shell
    a="project"&&b="Singularity/engine/core/skeleton"&&mkdir $a&&cd $a&&git init&&git submodule add https://github.com/Product-Live/Singularity.git Singularity&&cp $b/submodule.js main.js&&cp $b/ignore .gitignore&&node main.js --skeleton app
```

#### `Create modules`
We need to create the two modules used in the project
```shell
    node main.js --skeleton module --name node --module plain
    node main.js --skeleton module --name client --module client
```

#### `Update config`
Add the submodule that need to be fetched for use in the project
```javascript
    {
    	name: 'generic',
    	repo: 'https://github.com/anzerr/Module_Generic.git',
    	commit: '24a5e76a8b211001c2edaad72cffed6195300d6f'
    },
    {
    	name: 'libary',
    	repo: 'https://github.com/anzerr/Module_Libary.git',
    	commit: 'cebd1c14db29c7def61b7f33b2f739e14c489ba6'
    },
    {
    	name: 'react',
    	repo: 'https://github.com/anzerr/Module_react.git',
    	commit: '0bc1f1007961fa5227340e63fb830add179e3ed3'
    },
    {
    	name: 'gossip',
    	repo: 'https://github.com/anzerr/Module_gossip.git',
    	commit: '347b6f27d443aa68b12d25f89bc28b97bcdf54a4'
    }
```

Change the modules that need to be loaded
```javascript
    var load = {
        worker: ['generic', 'libary', 'react', 'client', 'node']
    };
```

Add the node module config
```javascript
    "use strict";

    module.exports = function(config) {
        const node = config.node || {};
        return ({
            peer: node.peer || [],
            port: config.port + 2
        });
    };
```

Add to the node sub config into config.js
```javascript
    var loadConfig  = {
		server: config.path.app + '/config/server.js',
		module: config.path.app + '/config/module.js',
		node: config.path.app + '/config/node.js'
    };
```

Change ports used in server.js
```javascript
	ws: {
        port: config.port + 1
	}
```

We want the ports to be
```shell
    port + 0 = http
    port + 1 = websocket
    port + 2 = gossip
```

#### `Create websocket server`

Init the websocket server
```javascript
	_s.webSocket = s.webSocket('native', {port: $.config.get('server.ws.port')});
```

Send messages into module route
```javascript
    _s.webSocket.on('message', function(data) {
        m.query().api('websocket').route(data.url()).run({
            authorization: data.auth(),
            body: data.get(),
            socket: data.client()
        });
    });
```

#### `Add Client`

Change title in controller/client.js
```javascript
    header: ['<title>Chat</title>'],
    main: '/client/main.js'
```

Add route to public/client/main.js
```javascript
    $.route.add({
        path: '/',
        action: {
            controller: 'chat',
            method: 'index'
        }
    });
```

Add the client file found in ressource/chat.js into public/client/module/

#### `Create "node" module`

Create the websocket routes config/websocket.js
```javascript
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
```

Add websocket config
```javascript
    route: [
    	'config/webSocket.js'
    ]
```

Import needed modules in config.js
```javascript
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
```

Create entity to handle websockets
```javascript
    "use strict";

    module.exports = function($) {
        return $.require([
            'import!socket',
        ], function(
            base
        ) {

            var obj = function() {
                this._socket = {};
            };
            obj.prototype = $.extends(base, {
                send: function(event, data) {
                    return this._send(data, event);
                }
            });

            return ({'static private': obj});
        });
    };
```

Create entity to manage the link between gossip network and websocket handler
```javascript
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
```

Create controller for the routes
```javascript
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
```
