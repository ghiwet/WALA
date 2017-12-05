function _mod_config1() {
    return {
        'name': 'SiroForce',
        'fqhn': 'sirona.server-pacemaker.com',
        'environment': 'test',
        'logonURL': 'https://sirona.service-pacemaker.com/api/api/login',
        'api': 'https://sirona.service-pacemaker.com/api/public/',
        'dbs': {
            'applicationDB': {
                'URL': 'https://sirona.service-pacemaker.com/db/appdb',
                'user': 'appdb',
                'password': 'appdb'
            }
        },
        'version': '0.0.1'
    };
}
function _mod_appversion2(module) {
    var exports = module.exports;
    'use strict';
    var platform = {
        build: '2.1.1',
        type: 'ifc'
    };
    function cmp(a, b) {
        /*var pa = a.split('.');
        var pb = b.split('.');
        for (var i = 0; i < 3; i++) {
            var na = Number(pa[i]);
            var nb = Number(pb[i]);
            if (na > nb) {
                return 1;
            }
            if (nb > na) {
                return -1;
            }
            if (!isNaN(na) && isNaN(nb)) {
                return 1;
            }
            if (isNaN(na) && !isNaN(nb)) {
                return -1;
            }
        }*/
        return 0;
    }
    module.exports = {
        lt: function (a) {
            try {
                return cmp(a, platform.build) === 1;
            } catch (_ignored) {
                return true;
            }
        }
    };
    return module.exports;
}
function _mod_Dbw4(module) {
    var exports = module.exports;
    'use strict';
    var Dbw = _mod_Janus23({ exports: {} }).Dbw;
    var DBG = 'Db';
    //console.appDebug(DBG, 'head');
    function DatabaseRW(name) {
        //console.appDebug(DBG, 'constructor config:', arguments);
        name = name || 'userdb';
        Dbw.apply(this, arguments);
    }
    DatabaseRW.prototype = new Dbw();
    module.exports = DatabaseRW;
    return module.exports;
}
function _mod_dialog5(module) {
    var exports = module.exports;
    'use strict';
    var NativeDialog = _mod_Janus23({ exports: {} }).Dialog;
    var DBG = 'common/Dialog';
    //console.appDebug(DBG, 'head');
    function Dialog() {
        //console.appDebug(DBG, 'constructor config:', arguments);
        NativeDialog.apply(this, arguments);
    }
    Dialog.prototype = new NativeDialog();
    Dialog.prototype.show = function (options) {
        //console.appDebug(DBG, 'show arguments:', arguments);
        return NativeDialog.prototype.show.call(this, options);
    };
    Dialog.prototype.alert = function (options) {
        //console.appDebug(DBG, 'alert arguments:', arguments);
        return Dialog.prototype.show.call(this, options);
    };
    module.exports = new Dialog();
    return module.exports;
}
function _mod_sessionData6(module) {
    var exports = module.exports;
    'use strict';
    var activeController;
    module.exports = {
        setActiveController: function (ctrl) {
            activeController = ctrl;
        },
        getActiveController: function () {
            return activeController;
        }
    };
    return module.exports;
}
function _mod_LRUCache7(module) {
    var exports = module.exports;
    function LRUCache(limit) {
        this.size = 0;
        this.limit = limit;
        this._keymap = {};
    }
    LRUCache.prototype.put = function (key, value) {
        var entry = {
            key: key,
            value: value
        };
        this._keymap[key] = entry;
        if (this.tail) {
            this.tail.newer = entry;
            entry.older = this.tail;
        } else {
            this.head = entry;
        }
        this.tail = entry;
        if (this.size === this.limit) {
            return this.shift();
        } else {
            this.size++;
        }
    };
    LRUCache.prototype.shift = function () {
        var entry = this.head;
        if (entry) {
            if (this.head.newer) {
                this.head = this.head.newer;
                this.head.older = undefined;
            } else {
                this.head = undefined;
            }
            entry.newer = entry.older = undefined;
            delete this._keymap[entry.key];
        }
        return entry;
    };
    LRUCache.prototype.get = function (key, returnEntry) {
        var entry = this._keymap[key];
        if (entry === undefined)
            return;
        if (entry === this.tail) {
            return returnEntry ? entry : entry.value;
        }
        if (entry.newer) {
            if (entry === this.head)
                this.head = entry.newer;
            entry.newer.older = entry.older;
        }
        if (entry.older)
            entry.older.newer = entry.newer;
        entry.newer = undefined;
        entry.older = this.tail;
        if (this.tail)
            this.tail.newer = entry;
        this.tail = entry;
        return returnEntry ? entry : entry.value;
    };
    LRUCache.prototype.remove = function (key) {
        var entry = this._keymap[key];
        if (!entry)
            return;
        delete this._keymap[entry.key];
        if (entry.newer && entry.older) {
            entry.older.newer = entry.newer;
            entry.newer.older = entry.older;
        } else if (entry.newer) {
            entry.newer.older = undefined;
            this.head = entry.newer;
        } else if (entry.older) {
            entry.older.newer = undefined;
            this.tail = entry.older;
        } else {
            this.head = this.tail = undefined;
        }
        this.size--;
        return entry.value;
    };
    LRUCache.prototype.removeAll = function () {
        this.head = this.tail = undefined;
        this.size = 0;
        this._keymap = {};
    };
    module.exports = LRUCache;
    return module.exports;
}
function _mod_events8(module) {
    var exports = module.exports;
    module.exports = function (obj) {
        'use strict';
        var eventHandlers = {};
        obj.trigger = function (eventName) {
            if (eventHandlers[eventName]) {
                var handlerArgs = Array.prototype.splice.call(arguments, 1);
                var keepRunning = true;
                eventHandlers[eventName].forEach(function (callback) {
                    if (keepRunning) {
                        var result = callback.apply({}, handlerArgs);
                        keepRunning = result !== false;
                    }
                });
            }
        };
        obj.on = function (eventName, callback) {
            eventHandlers[eventName] = eventHandlers[eventName] || [];
            eventHandlers[eventName].push(callback);
        };
        obj.off = function (eventName, callback) {
            if (!callback) {
                eventHandlers[eventName] = [];
                return;
            }
            eventHandlers[eventName] = eventHandlers[eventName].filter(function (value) {
                return value !== callback;
            });
        };
    };
    return module.exports;
}
function _mod_hookify9(module) {
    var exports = module.exports;
     //var Promise = _mod_Promise3({ exports: {} });
    module.exports = function (obj) {
        'use strict';
        var subscribers = {};
        obj.hookInto = function (name, fun) {
            subscribers[name] = subscribers[name] || [];
            subscribers[name].push(fun);
        };
        obj.hookExecute = function (name, data) {
            if (subscribers[name] === undefined) {
                return Promise.resolve(data);
            } else {
                return Promise.all(subscribers[name].map(function (fun) {
                    return fun.apply(obj, [data]);
                }));
            }
        };
    };
    return module.exports;
}
function _mod_db10(module) {
    var exports = module.exports;
    'use strict';
    var Dbw = _mod_Janus23({ exports: {} }).Dbw;
    var DBG = 'db';
    //console.appDebug(DBG, 'head');
    function DatabaseRW(name) {
        //console.appDebug(DBG, 'constructor config:', arguments);
        name = name || 'userdb';
        Dbw.apply(this, arguments);
    }
    DatabaseRW.prototype = new Dbw();
    module.exports = new DatabaseRW('userdb');
    return module.exports;
}
function _mod_Screen11(module) {
    var exports = module.exports;
    'use strict';
    var DBG = 'janus/Screen';
    //console.appDebug(DBG, 'head');
    function Screen() {
        //console.appDebug(DBG, 'constructor config:', arguments);
    }
    Screen.prototype.display = function (card, displayMode, options) {
        //console.appDebug(DBG, 'display config:', arguments);
        if (card) {
            //console.log('-----------------------Displaying Screen-----------------------');
        } else {
            throw 'There is no card defined to be displayed.';
        }
    };
    Screen.prototype.navigateTo = function (target, options) {
        //console.appDebug(DBG, 'navigateTo arguments:', arguments);
        if (target === 'home') {
            //console.appDebug(DBG, 'navigateTo home');
        } else {
            //console.appDebug(DBG, 'options', options);
        }
    };
    Screen.prototype.navigateBack = function (num) {
        //console.appDebug(DBG, 'navigateBack');
    };
    Screen.prototype.exit = function (relogin) {
        //console.appDebug(DBG, 'exit');
    };
    Screen.prototype.clearNavigationStack = function () {
        //console.appDebug(DBG, 'clearNavigationStack');
    };
    Screen.prototype.restart = function () {
        //console.appDebug(DBG, 'restart');
    };
    module.exports = Screen;
    return module.exports;
}
function _mod_defaultCard12(module) {
    var exports = module.exports;
    'use strict';
    //var Promise = _mod_Promise3({ exports: {} });
    var DBG = 'common/defaultCard';
    //console.appDebug(DBG, 'head');
    var JanusDefaultCard = _mod_Janus23({ exports: {} }).DefaultCard;
    var JanusField = _mod_Janus23({ exports: {} }).Field;
    var hookify = _mod_hookify9({ exports: {} });
    function DefaultCard(config) {
        //console.appDebug(DBG, 'constructor config:', arguments);
        this.fieldcfg = config.fields;
        this.data = {};
        JanusDefaultCard.apply(this, arguments);
        hookify(this);
    }
    DefaultCard.prototype = new JanusDefaultCard();
    DefaultCard.prototype.init = function (config) {
        //console.appDebug(DBG, 'init arguments', arguments);
        var self = this;
        JanusDefaultCard.prototype.init.apply(this, arguments);
        self.hookExecute('init');
    };
    DefaultCard.prototype.preRender = function (resolve, reject) {
        ////console.appDebug(DBG, 'preRender arguments', arguments);
        var self = this;
        //return new Promise(function (resolve) {
            ////console.appDebug(DBG, 'preRender promise', arguments);
            self._generateFields();
            resolve();
        //});
    };
    DefaultCard.prototype._generateFields = function () {
        //console.appDebug(DBG, '_generateFields arguments:', arguments);
        var self = this;
        self.fieldcfg.forEach(function (fieldData) {
            var field = new JanusField(fieldData);
            //field.registerListeners(field);
            self.data[field.id] = field;
        });
    };
    module.exports = DefaultCard;
    return module.exports;
}
function _mod_Controller13(module) {
    var exports = module.exports;
    'use strict';
    //var Promise = _mod_Promise3({ exports: {} });
    var showProgress = function () {
        //console.log('Showing Progress...', arguments);
    };
  
    var DBG = 'controllers/Controller';
    //console.appDebug(DBG, 'head');
    var LRUCache = _mod_LRUCache7({ exports: {} });
    var cache = new LRUCache(10);
    var Screen = _mod_Janus23({ exports: {} }).Screen;
    var hookify = _mod_hookify9({ exports: {} });
    var events = _mod_events8({ exports: {} });
    var sessionData = _mod_sessionData6({ exports: {} });
    function Controller(config) {
        //console.appDebug(DBG, 'constructor', arguments);
        if (typeof config === 'string' && config.length !== 0) {
            this.config = JSON.parse(config);
        } else if (typeof config === 'object') {
            this.config = config;
        } else {
            this.config = {};
        }
        if (this.config && this.config.data && this.config.data.displayMode) {
            this.setDisplayMode(this.config.data.displayMode);
        }
        hookify(this);
        events(this);
        this.hookInto('save', function () {
            //console.appDebug('save hook was called');
            return Promise.resolve();
        });
    }
    Controller.prototype.destroy = function () {
        //console.appDebug(DBG, 'destroy', arguments);
    };
    Controller.prototype.setupConfig = function (resolve) {
        //console.appDebug(DBG, 'setupConfig', arguments);
        var self = this;
        function setConfig(controllerConfig) {
            //console.appDebug(DBG, 'setConfig', arguments);
            if (!self.config.controllerConfig) {
                self.config.controllerConfig = controllerConfig;
            }
            if (self.config.data && self.config.data.mode && self.config.controllerConfig && self.config.controllerConfig.mode && self.config.controllerConfig.mode[self.config.data.mode]) {
                //console.appDebug(DBG, 'setConfig merging', self.config.controllerConfig, self.config.data.mode);
                //console.appDebug(DBG, 'setConfig done merging', self.config.controllerConfig);
            }
        }
        function cachedConfigPromise (resolve, reject) {
            //console.appDebug(DBG, 'cachedConfigPromise', self.config);
            if (self.config.target) {
                var cachedController = cache.get(self.config.target);
                var controllerConfig = cachedController && cachedController.config;
                //console.appDebug(DBG, 'cachedConfigPromise', controllerConfig);
                if (controllerConfig) {
                    resolve(controllerConfig);
                } else {
                    reject();
                }
            }
            resolve();
        }
        cachedConfigPromise(setConfig, function () {
            return self.getTargetForName(self.config.target);
        });
        resolve();
    };
    Controller.prototype.platformInit = function platformInit() {
        //console.appDebug(DBG, 'platformInit', arguments);
        var self = this;
        this.screen = new Screen();
       self.setupConfig(function () {
            self.init();
            self.setupListeners();
            if (self.card) {
                self.card.on('cardVisible', function () {
                    sessionData.setActiveController(self);
                });
            }
            return self.display();
        });
    };
    Controller.prototype.createCard = function (conf) {
        //console.appDebug(DBG, 'createCard', arguments);
        var Card = _mod_defaultCard12({ exports: {} });
        this.card = new Card(conf);
        this.card.init(conf);
        return this.card;
    };
    Controller.prototype.setupListeners = function setupListeners() {
        var self = this;
        //console.appDebug(DBG, 'setupListeners', self.config);
        if (self.card) {
            self.card.on("back", function () {
                //console.appDebug(DBG, 'onBack');
                if (typeof self.onBack === 'function') {
                    self.onBack();
                } else {
                    self.navigateBack();
                }
            });
        }
    };
    Controller.prototype.display = function display(options) {
        //console.appDebug(DBG, 'display', arguments);
        var self = this;
        if (!self.card) {
            return Promise.resolve();
        }
        self.card.preRender(function () {
            ////console.appDebug(DBG, 'display after preRender:', arguments);
            if (typeof self.prepareData === 'function') {
                self.prepareData(function () {
                     ////console.appDebug(DBG, 'display after preRender and prepareData:', arguments);
                     self.screen.display(self.card, self.getDisplayMode(), options);
                }, function(){
                     ////console.appDebug(DBG, 'display rejected', err);
                });
            }
            return Promise.resolve();
        }, function (err) {
            ////console.appDebug(DBG, 'preRender rejeted', err);
        });
    };
    Controller.prototype.setDisplayMode = function (displayMode) {
        this.displayMode = displayMode;
    };
    Controller.prototype.getDisplayMode = function () {
        return this.displayMode || 'default';
    };
    Controller.prototype.navigateTo = function (target, document, extra) {
        showProgress();
        //console.appDebug(DBG, 'navigateTo arguments:', arguments);
        var self = this;
        self.getTargetForName(target, function (contOption) {
            self.screen.navigateTo(contOption.controller, JSON.stringify({
                documentId: document,
                data: extra,
                target: target
            }));
        });
    };
    Controller.prototype.getTargetForName = function (name, resolve) {
        var config = cache.get(name);
        if (config) {
            resolve(config);
        }
        var db = _mod_db10({ exports: {} });
        db.query('app/controller', { key: name }).then(function (result) {
            //console.appDebug('getTargetForName got:', result, ' for ' + name);
            var cntr = result.rows[0].value.controller;
            //console.appDebug('controller is:', cntr);
            config = {
                controller: cntr,
                config: result.rows[0].value.config
            };
            cache.put(name, config);
            resolve(config);
        });
    };
    Controller.prototype.navigateBack = function (num) {
        //console.appDebug(DBG, 'navigateBack');
        var self = this;
        self.screen.navigateBack(num);
    };
    Controller.prototype.init = function () {
        throw new Error('must be implemented by subclass!');
    };
    Controller.prototype.prepareData = function () {
        throw new Error('must be implemented by subclass!');
    };
    module.exports = Controller;
    return module.exports;
}
function _mod_Dbw14(module) {
    var exports = module.exports;
    'use strict';
    //var Promise = _mod_Promise3({ exports: {} });
    var DBG = 'janus/Dbw';
    //console.appDebug(DBG, 'head');
    var DBR = _mod_Dbr15({ exports: {} });
    function DBW(name) {
        //console.appDebug(DBG, 'constructor:', arguments);
        DBR.call(this, name);
    }
    DBW.prototype = new DBR();
    DBW.prototype.putLocal = function (doc, resolve, reject) {
        //console.appDebug(DBG, 'putLocal:', doc);
        resolve({
            'ok': true,
            'id': '_local/' + doc._id,
            'rev': undefined
        });
    };
    DBW.prototype.put = function (doc) {
        //console.appDebug(DBG, 'put:', doc);
        return Promise.resolve({
            'ok': true,
            'id': doc._id,
            'rev': undefined
        });
    };
    DBW.prototype.putAttachment = function (doc, attachmentId, attachment, type) {
        //console.appDebug(DBG, 'putAttachment:', doc, attachmentId, attachment, type);
        return Promise.resolve({
            'ok': true,
            'id': doc._id,
            'rev': undefined
        });
    };
    DBW.prototype.remove = function (doc) {
        //console.appDebug(DBG, 'remove:', doc);
        return Promise.resolve({
            'ok': true,
            'id': doc._id,
            'rev': undefined
        });
    };
    module.exports = DBW;
    return module.exports;
}
function _mod_Dbr15(module) {
    var exports = module.exports;
    'use strict';
    //var Promise = _mod_Promise3({ exports: {} });
    var DBG = 'janus/Dbr';
    //console.appDebug(DBG, 'head');
    var LOGINCACHE;
    var LOGINSETTINGS;
    function DBR(name) {
        //console.appDebug(DBG, 'constructor:', arguments);
    }
    DBR.prototype.get = function (docId) {
        //console.appDebug(DBG, 'get:', docId);
        return Promise.resolve({
            '_id': docId,
            '_rev': undefined
        });
    };
    DBR.prototype.getAttachment = function (docId, attachmentId) {
        //console.appDebug(DBG, 'getAttachment:', docId, attachmentId);
        return Promise.resolve({
            '_attachments': undefined,
            '_id': docId,
            '_rev': undefined
        });
    };
    DBR.prototype.query = function (fun) {
        //console.appDebug(DBG, 'query:', fun);
        return Promise.resolve({
            'offset': 0,
            'rows': [],
            'total_rows': 0
        });
    };
    DBR.prototype.getLocal = function (docId, resolve, reject) {
        //console.appDebug(DBG, 'getLocal:', docId);
        if (docId === 'logincache') {
            resolve({
                '_id': '_local/logincache',
                '_rev': undefined,
                'autologin': false,
                'login': '',
                'password': ''
            });
        } else if (docId === 'loginsettings') {
            resolve({
                '_id': '_local/loginsettings',
                '_rev': undefined,
                'saveCredentials': false
            });
        } else {
            reject({
                'status': 404,
                'name': 'not_found',
                'message': 'missing',
                'error': true,
                'reason': 'missing'
            });
        }
    };
    module.exports = DBR;
    return module.exports;
}
function _mod_User16(module) {
    var exports = module.exports;
    'use strict';
    //var Promise = _mod_Promise3({ exports: {} });
    var DBG = 'janus/User';
    //console.appDebug(DBG, 'head');
    var _info = {
        'db_url_map': {
            'userdb': 'https://sirona.service-pacemaker.com/db/userdb-nvqxq$$$',
            'appdb': 'https://sirona.service-pacemaker.com/db/appdb_max'
        },
        'derived_key': 'd9f608890f3434f68f8a0787600dd3fad4156b59',
        'env': 'devel',
        'iterations': 1000,
        'name': 'max',
        'options': {
            'info': {
                'object_id': 'org.couchdb.user:max',
                'email_address': '',
                'role': [],
                'default_country': 'AL',
                'login_name': 'max',
                'status': 50,
                'full_name': 'Max Schlueter',
                'tenant': [
                    'Sirona',
                    'USA'
                ]
            }
        },
        'pass': '3n9iKaA92rbPP1',
        'roles': ['system.active'],
        'salt': '4bc610232aba087d34667fa4c634fca6',
        'api': 'https://sirona.service-pacemaker.com/api/'
    };
    function User() {
        //console.appDebug(DBG, 'constructor config:', arguments);
    }
    User.prototype.info = function () {
        //console.appDebug(DBG, 'info:', arguments);
        return _info;
    };
    User.prototype.login = function janusUserLogin(credentials, resolve, reject) {
        //console.appDebug(DBG, 'login:', credentials);
        var self = this;
        //return new Promise(function (resolve, reject) {
            if (credentials.login === 'max' && credentials.password === '3n9iKaA92rbPP1') {
                //console.appDebug(DBG, 'login success arguments:', arguments);
                resolve({
                    'code': 200,
                    'data': _info
                });
            } else {
                //console.appDebug(DBG, 'login fail arguments:', arguments);
                reject({
                    'code': 500,
                    'status': 'ifc'
                });
            }
        //});
    };
    User.prototype.logout = function () {
        //console.appDebug(DBG, 'logout', arguments);
    };
    module.exports = User;
    return module.exports;
}
function _mod_Dialog17(module) {
    var exports = module.exports;
    'use strict';
    //var Promise = _mod_Promise3({ exports: {} });
    var DBG = 'janus/Dialog';
    //console.appDebug(DBG, 'head');
    var ASSIST;
    function Dialog() {
        //console.appDebug(DBG, 'constructor config:', arguments);
    }
    Dialog.prototype.show = function (options) {
        //console.appDebug(DBG, 'show:', arguments);
        //console.appDebug(DBG, JSON.stringify(options, null, 2));
        //console.log('-----------------------Showing Dialog-----------------------');
        if (ASSIST) {
            return Promise.resolve(['assist']);
        } else {
            return Promise.resolve(['ok']);
        }
    };
    module.exports = Dialog;
    return module.exports;
}
function _mod_Events18(module) {
    var exports = module.exports;
    'use strict';
    var DBG = 'common/Event';
    //console.appDebug(DBG, 'head');
    function EventHandlers() {
        //console.appDebug(DBG, 'constructor config:', arguments);
        this.handlers = {};
    }
    function upperFirst(string) {
        return string[0].toUpperCase() + string.substr(1);
    }
    EventHandlers.prototype.registerListeners = function (registerObject) {
        //console.appDebug(DBG, 'registerListeners arguments:', arguments);
        var self = this;
        var supportedEvents = this.EVENTS || [];
        var currentEvent;
        for (var i = supportedEvents.length - 1; i >= 0; i--) {
            currentEvent = supportedEvents[i] + '' || ' ';
            //registerObject['on' + upperFirst(currentEvent)] = self.on.bind(self, currentEvent);
            //registerObject['off' + upperFirst(currentEvent)] = self.off.bind(self, currentEvent);
            registerObject['on' + currentEvent] = self.on.bind(self, currentEvent);
            registerObject['off' + currentEvent] = self.off.bind(self, currentEvent);
        }
    };
    EventHandlers.prototype.trigger = function (eventName) {
        //console.appDebug(DBG, 'trigger arguments:', arguments);
        var self = this;
        if (this.handlers[eventName]) {
            var handlerArgs = Array.prototype.splice.call(arguments, 1);
            this.handlers[eventName].forEach(function (handler) {
                if (handler.callback) {
                    //console.appDebug(DBG, 'trigger calling:', handler.callback.toString());
                    handler.callback.apply(handler.context || self, handlerArgs);
                }
            });
        }
    };
    EventHandlers.prototype.off = function (eventName, callback) {
        //console.appDebug(DBG, 'off arguments:', arguments);
        if (!callback) {
            this.handlers[eventName] = [];
            return;
        }
        this.handlers[eventName] = this.handlers[eventName].filter(function (value) {
            return value.callback !== callback;
        });
    };
    EventHandlers.prototype.on = function (eventName, callback, context) {
        //console.appDebug(DBG, 'on arguments:', arguments);
        this.handlers[eventName] = this.handlers[eventName] || [];
        this.handlers[eventName].push({
            callback: callback,
            context: context
        });
    };
    module.exports = EventHandlers;
    return module.exports;
}
function _mod_Field19(module) {
    var exports = module.exports;
    'use strict';
    var DBG = 'janus/Field';
    //console.appDebug(DBG, 'head');
    var Events = _mod_Events18({ exports: {} });
    var INTERNAL_FIELDS = {
        'string': {
            EVENTS: [
                'changeValue',
                'keyboardAction'
            ]
        },
        'password': { EVENTS: ['changeValue'] },
        'richtext': { EVENTS: ['click'] },
        'action': { EVENTS: ['click'] },
        'boolean': { EVENTS: ['changeValue'] },
        'image': { EVENTS: ['click'] },
        'phone': { EVENTS: ['changeValue'] },
        'email': { EVENTS: ['changeValue'] },
        'group': {
            EVENTS: ['changeValue'],
            JS_INTERFACES: ['FieldGroup']
        },
        'seperator': { EVENTS: ['click'] }
    };
    function Field(fieldData) {
        //console.appDebug(DBG, 'constructor:', arguments);
        var self = this;
        self.id = fieldData.id;
        self.type = fieldData.type;
        self.EVENTS = INTERNAL_FIELDS[self.type].EVENTS;
        Events.call(this);
        for (var key in fieldData) {
            if (fieldData.hasOwnProperty(key)) {
                if (key !== 'type')
                    self[key] = fieldData[key];
            }
        }
    }
    Field.prototype = new Events();
    Field.prototype.changeValue = function changeValue(val) {
        this.value = val;
        this.trigger('changeValue', val);
    };
    Field.prototype.click = function click() {
        this.trigger('click');
    };
    module.exports = Field;
    return module.exports;
}
function _mod_utility20(module) {
    var exports = module.exports;
    'use strict';
    var exports = module.exports;
    exports.setProp = function (nMask, oObj, sKey, vValfGet, fSet) {
        var oDesc = {};
        if (nMask & 8) {
            if (vValfGet) {
                oDesc.get = vValfGet;
            } else {
                delete oDesc.get;
            }
            if (fSet) {
                oDesc.set = fSet;
            } else {
                delete oDesc.set;
            }
            delete oDesc.value;
            delete oDesc.writable;
        } else {
            if (arguments.length > 3) {
                oDesc.value = vValfGet;
            } else {
                delete oDesc.value;
            }
            oDesc.writable = Boolean(nMask & 4);
            delete oDesc.get;
            delete oDesc.set;
        }
        oDesc.enumerable = Boolean(nMask & 1);
        oDesc.configurable = Boolean(nMask & 2);
        Object.defineProperty(oObj, sKey, oDesc);
        return oObj;
    };
    exports.btoa = function (input) {
        var str = String(input);
        for (var block, charCode, idx = 0, map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=', output = ''; str.charAt(idx | 0) || (map = '=', idx % 1); output += map.charAt(63 & block >> 8 - idx % 1 * 8)) {
            charCode = str.charCodeAt(idx += 3 / 4);
            if (charCode > 255) {
                throw new Error('\'btoa\' failed: The string to be encoded contains characters outside of the Latin1 range.');
            }
            block = block << 8 | charCode;
        }
        return output;
    };
    exports.inherits = function (ctor, superCtor) {
        ctor.super_ = superCtor;
        ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
                value: ctor,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        ctor.prototype.__noSuchMethod__ = function (id, args) {
            //console.appDebug('NO METHOD', id, '(' + args.join(', ') + ')');
        };
    };
    exports.safeApply = function (obj, method, that, args) {
        if (typeof obj.prototype[method] === 'function') {
            return obj.prototype[method].apply(that, args);
        }
    };
    exports.toCamel = function (str) {
        return str.replace(/(^[a-z]|[_.][a-z])/g, function ($1) {
            return $1.toUpperCase().replace(/[_.]/, '');
        });
    };
    exports.extendObj = function (obj1, obj2) {
        for (var attrname in obj2) {
            obj1[attrname] = obj2[attrname];
        }
    };
    exports.genUUID = function (seed) {
        var d = seed || new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : r & 7 | 8).toString(16);
        });
        return uuid;
    };
    exports.allRejects = function (promises) {
        return new Promise(function (resolve, reject) {
            var values = [];
            var rejects = [];
            var count = promises.length || resolve(values);
            function resect() {
                if (rejects.length === 0) {
                    resolve(values);
                } else {
                    reject(rejects);
                }
            }
            promises.map(function (promise, index) {
                promise.then(function (value) {
                    values[index] = value;
                    --count || resect();
                }, function (value) {
                    rejects[index] = value;
                    --count || resect();
                });
            });
        });
    };
    return module.exports;
}
function _mod_Card21(module) {
    var exports = module.exports;
    'use strict';
    var DBG = 'Janus/Card';
    //console.appDebug(DBG, 'head');
    var EventHandlers = _mod_Events18({ exports: {} });
    var util = _mod_utility20({ exports: {} });
    function Card(config) {
        //console.appDebug(DBG, 'constructor config:', config);
        this.EVENTS = [
            'cardVisible',
            'destroy',
            'back'
        ];
        this.JS_INTERFACES = [];
    }
    Card.prototype = new EventHandlers();
    Card.prototype.init = function (config) {
        //console.appDebug(DBG, 'init arguments:', arguments);
        var self = this;
        if (config.actions !== undefined && Object.getPrototypeOf(config.actions) === Array.prototype) {
        }
        //console.appDebug(DBG, 'EVENTS', self.EVENTS);
        //var events = new EventHandlers();
        //util.extendObj(self, events);
        //self.registerListeners(self);
        Object.defineProperties(this, {
            actions: {
                set: function (actions) {
                    self.setActions(actions);
                },
                get: function () {
                    return self.getActions();
                },
                enumerable: false,
                configurable: true
            }
        });
        self.on = function (event, args) {
            self.trigger(event, args);
        };
    };
    module.exports = Card;
    return module.exports;
}
function _mod_DefaultCard22(module) {
    var exports = module.exports;
    'use strict';
    var DBG = 'janus/DefaultCard';
    //console.appDebug(DBG, 'head');
    var Card = _mod_Card21({ exports: {} });
    function DefaultCard(config) {
        //console.appDebug(DBG, 'constructor config:', config);
        Card.apply(this, arguments);
        this.JS_INTERFACES = ['FieldGroup'];
    }
    DefaultCard.prototype = new Card();
    module.exports = DefaultCard;
    return module.exports;
}
function _mod_Janus23(module) {
    var exports = module.exports;
    module.exports = {
        Dialog: _mod_Dialog17({ exports: {} }),
        Dbw: _mod_Dbw14({ exports: {} }),
        Dbr: _mod_Dbr15({ exports: {} }),
        User: _mod_User16({ exports: {} }),
        Screen: _mod_Screen11({ exports: {} }),
        DefaultCard: _mod_DefaultCard22({ exports: {} }),
        Field: _mod_Field19({ exports: {} })
    };
    return module.exports;
}
function _mod_User24(module) {
    var exports = module.exports;
    'use strict';
    //var Promise = _mod_Promise3({ exports: {} });
    var NativeUser = _mod_Janus23({ exports: {} }).User;
    var STATUS_CODE_MSG = {
        200: 'OK',
        403: 'Login incorrect',
        412: 'Precondition failed',
        419: 'Local login incorrect',
        500: 'General error'
    };
    var OK_STATUS_CODE = 200;
    var DBG = 'common/User';
    //console.appDebug(DBG, 'head');
    function User() {
        //console.appDebug(DBG, 'constructor config:', arguments);
        NativeUser.apply(this, arguments);
    }
    User.prototype = new NativeUser();
    User.prototype.login = function userLogin(credentials, resolve, reject) {
        var self = this;
        //console.appDebug(DBG, 'login arguments:', arguments);
        var args = arguments;
        //var promise = new Promise(function (resolve, reject) {
            NativeUser.prototype.login.apply(self, args, function (response) {
                //console.appDebug(DBG, 'native login arguments:', arguments);
                var returnData = {
                    data: response.data,
                    code: response.code,
                    status: STATUS_CODE_MSG[response.code]
                };
                if (response.code === OK_STATUS_CODE) {
                    self.info = response.data;
                    resolve(returnData);
                } else {
                    reject(returnData);
                }
            }, function (error) {
                //console.appDebug(DBG, 'native login arguments:', arguments);
                reject({
                    data: error,
                    code: 500,
                    status: STATUS_CODE_MSG[500]
                });
            });
        //});
        //return promise;
    };
    User.prototype.logout = function () {
        //console.appDebug(DBG, 'logout', arguments);
        NativeUser.prototype.logout.apply(this, arguments);
    };
    module.exports = User;
    return module.exports;
}
function _mod_login25(module) {
    var exports = module.exports;
    'use strict';
    //var Promise = _mod_Promise3({ exports: {} });
    var showProgress = function () {
        //console.log('Showing Progress...', arguments);
    };
    var hideProgress = function () {
        //console.log('Hiding Progress...', arguments);
    };
    var platform = {
        config: _mod_config1(),
        build: '2.1.1',
        type: 'ifc'
    };
    var Controller = _mod_Controller13({ exports: {} });
    var appversion = _mod_appversion2({ exports: {} });
    var DBG = 'LoginController';
    //console.log(DBG);
    var LOGINCACHE_DOCID = 'logincache';
    var LOGINSETTIGS_DOCID = 'loginsettings';
    var db;
    var dialog = _mod_dialog5({ exports: {} });
    var User = _mod_User24({ exports: {} });
    //console.appDebug(DBG, User);
    var user = new User();
    function LoginController(conf) {
        //console.appDebug(DBG, 'Constructor');
        this.conf = conf;
        this.data = {
            'user': {
                'login': '',
                'password': ''
            }
        };
        Controller.call(this, conf);
        //console.appDebug(DBG, 'Constructor End');
    }
    LoginController.prototype = new Controller();
    LoginController.prototype.init = function init() {
        //console.appDebug(DBG, 'INIT');
        this.createCard({
            fields: [
                {
                    'id': 'spacerUp',
                    'type': 'richtext',
                    'value': ''
                },
                {
                    'id': 'applogo',
                    'type': 'image',
                    'heightLines': 2,
                    'value': {
                        'origin': 'local',
                        'src': { 'name': 'app_logo' }
                    }
                },
                {
                    'id': 'spacerDown',
                    'type': 'richtext',
                    'value': ''
                },
                {
                    'id': 'Login',
                    'type': 'string',
                    'placeholder': 'Username',
                    'inputType': 'email',
                    'readOnly': false,
                    'required': true
                },
                {
                    'id': 'Password',
                    'type': 'password',
                    'placeholder': 'Password',
                    'readOnly': false,
                    'required': true
                },
                {
                    'id': 'SaveCredentials',
                    'type': 'boolean',
                    'label': 'Remember login credentials',
                    'readOnly': false
                },
                {
                    'id': 'LoginButton',
                    'type': 'action',
                    'value': 'Login',
                    'readOnly': true
                },
                {
                    'id': 'AssistanceButton',
                    'type': 'action',
                    'style': 'flat',
                    'value': 'Assistance',
                    'readOnly': false
                },
                {
                    'id': 'RegisterButton',
                    'type': 'action',
                    'style': 'flat',
                    'value': 'Register',
                    'readOnly': false
                }
            ]
        });
    };
    LoginController.prototype.prepareData = function prepareData(resolve, reject) {
        var self = this;
        if (appversion.lt('2.1.1')) {
            dialog.show({
                'title': 'New Version required',
                'text': 'Please download the newest version of this app from https://sirona.service-pacemaker.com/test',
                'actions': [{
                        'name': 'ok',
                        'title': 'Ok'
                    }]
            });
            return Promise.reject();
        } else {
            var Db = _mod_Dbw4({ exports: {} });
            db = new Db('appdb');
            //return new Promise(function (resolve, reject) {
                self.tryAutologin(function () {
                    reject();
                    self.screen.navigateTo('home');
                }, function () {
                    self.mapFields(function () {
                        self.subscribeButtons();
                        self.loginAvailable();
                        resolve();
                    });
                });
            //});
        }
    };
    LoginController.prototype.tryAutologin = function tryAutologin(resolve, reject) {
        //console.appDebug(DBG, 'tryAutologin');
        var self = this;
        //return new Promise(function (resolve, reject) {
            db.getLocal(LOGINCACHE_DOCID, function (data) {
                //console.appDebug(DBG, 'tryAutologin - got data from local db. data = ', data);
                if (!!data) {
                    self.data.user.login = data.login;
                    self.data.user.password = data.password;
                    self.data._rev = data._rev;
                }
                if (data && !!data.autologin && !!data.login && !!data.password) {
                    //console.appDebug(DBG, 'tryAutologin - autologin enabled');
                    self.login(data.login, data.password, true, function () {
                        //console.appDebug(DBG, 'tryAutologin - successfull login');
                        resolve();
                    }, function () {
                        //console.appDebug(DBG, 'tryAutologin - failed to login with stored credentials');
                        reject();
                    });
                } else {
                    //console.appDebug(DBG, 'tryAutologin - autologin disabled');
                    reject();
                }
            }, function (err) {
                //console.appDebug(DBG, 'tryAutologin - no local doc, err: ', err);
                reject();
            });
        //});
    };
    LoginController.prototype.login = function loginLoginController(login, password, saveCredentials, resolve, reject) {
        //console.log(DBG, 'login - ', login, password);
        var self = this;
        var u = login;//.replace(/\s+/g, '').split('@@');
        var p = password;
        user.login({
            'login': u,//[0],
            'password': p//,
            //'environment': u[1] || platform.config.environment
        }, function () {
            console.log(DBG, 'login - success');
            self.updateSavedCredentials(saveCredentials, saveCredentials ? login : '', saveCredentials ? password : '', function () {
                //console.appDebug(DBG, 'login - saved credentials');
                resolve();
            }, function () {
                //console.appDebug(DBG, 'login - failed to saved credentials');
                resolve();
            });
        }, function (err) {
            //console.appDebug(DBG, 'login - error', err);
            reject(err);
        });
    };
    LoginController.prototype.updateSavedCredentials = function (autologin, login, password, resolve, reject) {
        //console.appDebug(DBG, 'updateSavedCredentials - ', autologin, login, password);
        var self = this;
        //return new Promise(function (resolve) {
            db.putLocal({
                '_id': LOGINCACHE_DOCID,
                '_rev': self.data._rev,
                'autologin': autologin,
                'login': login,
                'password': password
            }, resolve, resolve);
       // });
    };
    LoginController.prototype.loginAvailable = function () {
        this.card.data.LoginButton.readOnly = !this.card.data.Login.value || !this.card.data.Password.value;
    };
    LoginController.prototype.saveSettings = function () {
        var self = this;
        self.loginSettings = self.loginSettings || {};
        self.loginSettings._id = '_local/' + LOGINSETTIGS_DOCID;
        self.loginSettings.saveCredentials = self.card.data.SaveCredentials.value;
        db.putLocal(this.loginSettings, function(){});
    };
    LoginController.prototype.mapFields = function (resolve) {
        var self = this;
        //console.appDebug(DBG, Object.keys(this.card.data));
        //console.appDebug(DBG, this.data);
        db.getLocal(LOGINSETTIGS_DOCID, function (doc) {
            self.loginSettings = doc;
            self.card.data.Login.value = self.data.user.login;
            self.card.data.Password.value = self.data.user.password;
            self.card.data.SaveCredentials.value = doc ? doc.saveCredentials : true;
            //return Promise.resolve();
        }, function () {
            self.loginSettings = {};
            self.card.data.Login.value = self.data.user.login;
            self.card.data.Password.value = self.data.user.password;
            self.card.data.SaveCredentials.value = true;
            //return Promise.resolve();
        });
        resolve();
    };
    LoginController.prototype.subscribeButtons = function subscribeButtons() {
        var self = this;
        this.card.data.LoginButton.on('click', self.onLoginClick, self);
        //this.card.data.AssistanceButton.on('click', self.onAssistanceClick, self);
        //this.card.data.RegisterButton.on('click', self.onSignupClick, self);
        this.card.data.Login.on('changeValue', self.loginAvailable, self);
        this.card.data.Password.on('changeValue', self.loginAvailable, self);
    };
    LoginController.prototype.onAssistanceClick = function () {
        //console.appDebug(DBG, 'onAssistanceClick ', arguments);
        this.screen.navigateTo({
            host: 'local',
            docid: '_design/app',
            attachment: 'assistance'
        }, JSON.stringify({ login: this.card.data.Login.value || '' }));
    };
    LoginController.prototype.onSignupClick = function () {
        //console.appDebug(DBG, 'onSignupClick - arguments: ', arguments);
        this.screen.navigateTo({
            host: 'local',
            docid: '_design/app',
            attachment: 'signup'
        }, '');
    };
    LoginController.prototype.onLoginClick = function onLoginClick() {
        //console.appDebug(DBG, 'onLoginClick - arguments: ', arguments);
        var self = this;
        showProgress();
        self.saveSettings();
        var LOGIN_ERRORS = {
            403: '<p>The combination of username and password that you entered is incorrect. If you have forgotten your login or password please seek assistance</p>',
            419: '<p>The combination of username and password that you entered is incorrect. Please notice that you are offline, therefore changed credentials might not have been synchronised yet.</p>',
            412: '<p>The username is unknown to this device. Please notice that you are offline, to login on this device a network connection is required.</p>'
        };
        //console.appDebug(DBG, 'onLoginClick - login card data: ', self.card.data.Login);
        self.login(self.card.data.Login.value, self.card.data.Password.value, self.card.data.SaveCredentials.value, function () {
                        self.screen.navigateTo('home');
            hideProgress();
        }, function (err) {
            //console.log(DBG, 'onLoginClick - error: ', arguments);
            hideProgress();
            dialog.show({
                'title': 'Login failed',
                'text': LOGIN_ERRORS[err.data],
                'actions': [
                    {
                        'name': 'ok',
                        'title': 'Retry'
                    },
                    {
                        'name': 'assist',
                        'title': 'Assistance'
                    }
                ]
            }).then(function (select) {
                //console.appDebug(DBG, 'dialog action: ', select);
                if (select[0] === 'assist') {
                    self.onAssistanceClick();
                }
            });
        });
    };
    module.exports = LoginController;
    return module.exports;
}
function _mod_main26(module) {
    var exports = module.exports;
    'use strict';
  if (typeof setTimeout !== 'function'){
    setTimeout=function(f, x){
            f();
        }
 }
 if(typeof console!=='object'){
    console= {        
        log: function(){}       
    };
 }
 if(typeof console.appDebug!=='function')
 {  
   //console.appDebug= //console.log;
 
    
 }
    ////console.appDebug = //console.log.bind(console);
   
    //console.appDebug("test again");
    var LoginController = _mod_login25({ exports: {} });
    var controller = new LoginController({});
    controller.platformInit();
    setTimeout(function () {
        controller.card.data.Login.changeValue('max');
        controller.card.data.Password.changeValue('3n9iKaA92rbPP1');
        controller.card.data.LoginButton.click();
        
    }, 500);
    return module.exports;
}
_mod_main26({ exports: {} });
