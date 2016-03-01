### EventManager, v1.0.1
*
* Copyright (c) 2009, Howard Rauscher
* Licensed under the MIT License
###
 
#Based on the code https://gist.github.com/howardr/118668 - thanks!

module.exports = class EventManager
    class EventArg
        constructor: (@name, @data) ->
            @cancelled = false;
            @removed = false;
        
        cancel: ->
            @cancelled = true;

        remove: ->
            @removed = true;

    _listeners = []

    constructor: ->

    addListener: (name, fn) ->
        (_listeners[name] = _listeners[name] || []).push(fn)
        return @

    removeListener: (name, fn) ->
        if(arguments.length == 1)
            _listeners[name] = []
        else if(typeof(fn) == 'function')
            listeners = _listeners[name]

            if(listeners != undefined)
                foundAt = -1
                for listener,i in listeners
                    if(listener == fn) 
                        foundAt = i
                        break
                
                if(foundAt >= 0)
                    listeners.splice(foundAt, 1);

        return @

    fire: (name, args) ->
        listeners = _listeners[name]
        args = args || []
        if(listeners != undefined)
            data = {}
            evt = null
            for listener,i in listeners
                evt = new EventArg(name, data)
                
                listener.apply(window, args.concat(evt))

                data = evt.data
                if(evt.removed) 
                    listeners.splice(i, 1)
                    len = listeners.length
                    --i
                
                if(evt.cancelled) 
                    break
        return @

    hasListeners: (name) ->
        return (_listeners[name] == undefined ? 0 : _listeners[name].length) > 0

    @eventify: (object, manager) ->
        methods = ['addListener', 'removeListener', 'fire']
        manager = manager || new EventManager()

        func = (method) -> 
            object[method] = -> 
                return manager[method].apply(manager, arguments)
        
        func(method) for method in methods