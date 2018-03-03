/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
/* EventManager, v1.0.1
*
* Copyright (c) 2009, Howard Rauscher
* Licensed under the MIT License
*/
 
//Based on the code https://gist.github.com/howardr/118668 - thanks!

let EventManager;
export default (EventManager = (function() {
    let EventArg = undefined;
    EventManager = class EventManager {
        static initClass() {
            EventArg = class EventArg {
                constructor(name, data) {
                    this.name = name;
                    this.data = data;
                    this.cancelled = false;
                    this.removed = false;
                }
            
                cancel() {
                    return this.cancelled = true;
                }
    
                remove() {
                    return this.removed = true;
                }
            };
        }

        constructor() {
            this._listeners = [];
        }

        addListener(name, fn) {
            (this._listeners[name] = this._listeners[name] || []).push(fn);
            return this;
        }

        removeListener(name, fn) {
            if(arguments.length === 1) {
                this._listeners[name] = [];
            } else if(typeof(fn) === 'function') {
                const listeners = this._listeners[name];

                if(listeners !== undefined) {
                    let foundAt = -1;
                    for (let i = 0; i < listeners.length; i++) {
                        const listener = listeners[i];
                        if(listener === fn) { 
                            foundAt = i;
                            break;
                        }
                    }
                
                    if(foundAt >= 0) {
                        listeners.splice(foundAt, 1);
                    }
                }
            }

            return this;
        }

        fire(name, args) {
            const listeners = this._listeners[name];
            args = args || [];
            if(listeners !== undefined) {
                let data = {};
                let evt = null;
                for (let j = 0, i = j; j < listeners.length; j++, i = j) {
                    const listener = listeners[i];
                    evt = new EventArg(name, data);
                
                    listener.apply(window, args.concat(evt));

                    ({ data } = evt);
                    if(evt.removed) { 
                        listeners.splice(i, 1);
                        const len = listeners.length;
                        --i;
                    }
                
                    if(evt.cancelled) { 
                        break;
                    }
                }
            }
            return this;
        }

        hasListeners(name) {
            let left;
            return ((left = this._listeners[name] === undefined) != null ? left : {0 : this._listeners[name].length}) > 0;
        }

        static eventify(object, manager) {
            const methods = ['addListener', 'removeListener', 'fire'];
            manager = manager || new EventManager();

            const func = method => 
                object[method] = function() { 
                    return manager[method].apply(manager, arguments);
                }
            ;
        
            return (() => {
                const result = [];
                for (let method of Array.from(methods)) {                     result.push(func(method));
                }
                return result;
            })();
        }
    };
    EventManager.initClass();
    return EventManager;
})());