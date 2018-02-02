var _App;
(function($) {
    "use strict";

    var info = {
        page: 'chat'
    };
    var deus = new $._deus(info.page), r = deus.pub();
    $.util.style('base', r);

    var user = (function() {
        var text = "";
          var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

          for (var i = 0; i < 6; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

          return 'nano_' + text;
    })();

    r.create('app.chat', {
        getInitialState: function() {
            return ({load: false, message: [], input: ''});
        },

        componentDidMount: function() {
            var self = this;
            this.setState({fadeT: setTimeout(function() {
                var socket = $.socket('ws://' + window.location.hostname + ':' + (Number(window.location.port) + 1));
                socket.on('packet', function(msg) {
                    if (msg.action === 'message') {
                        var m = self.state.message;
                        m.push(msg.data);
                        self.setState({messag: m});
                    }
                });
                socket.once('open', function() {
                    socket.emit('subscribe', {
                        data: {user: user}
                    });
                });
                self.setState({socket: socket});
            }, 200)});
        },

        componentWillUnmount: function() {
            if (this.state.socket) {
                this.state.socket.emit('unsubscribe', {});
            }
        },

        send: function(data) {
            if (data && this.state.socket) {
                this.state.socket.emit('message', {
                    data: {message: data}
                });
            }
        },

        render: function() {
            var block = [], self = this;

            var color = ['#0087ff', '#9300ff'];
            var s = {color: 'gray', padding: '5px', display: 'inline-block'};
            for (var i in this.state.message) {
                (function(m) {
                    block.push(r('div').set({key: i, id: i}).style({margin: '3px', overflow: 'auto'}).c(
                        r('div').style({display: 'inline-block', width: '200px'}).c(
                            r('div').style(s).c(new Date(m.time).toLocaleTimeString('fr')),
                            r('div').style(s, {color: color[(m.user === user)? 0 : 1]}).c(m.user + ':')
                        ),
                        r('div').style({width: 'calc(100% - 200px)', float: 'right', background: '#f3f3f3', borderRadius: '2px'}).c(
                            r('div').style(s).c(m.message)
                        )
                    ));
                })(this.state.message[i]);
            }
            return r('div').style('full', {padding: '1px 10px'}).c(
                r('div').style({height: 'calc(100% - 50px)', overflow: 'auto'}).c(block),
                r('div').style({height: '50px'}).c(
                    r('div').style({display: 'inline-block', width: '100px', height: '36px'}).c(user + ':'),
                    r('part.input').set({value: this.state.input}).style({width: 'calc(100% - 205px)', height: '36px'}).on('change', function(v) {
                        self.setState({input: v});
                    }).c(),
                    r('div').class('ui button').style('click', {margin: '0px 10px', float: 'right'}).on('click', function() {
                        if (self.state.input) {
                            self.send(self.state.input);
                            self.setState({input: ''});
                        }
                    }).c('send')
                )
            )
        }
    });

    $.page.add('chat', {
        index: function() {
            ReactDOM.render(r('app.chat').c(), document.getElementById('container'));
            return (true);
        }
    });
})(_App || (_App = {}));
