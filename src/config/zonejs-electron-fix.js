var originalRemoveEventListener = window.removeEventListener;
function removeEventListenerOverloaded(eventName, listener) {
    if (listener && needToCallOriginalMethod(eventName, listener.toString())) {
        // calling native/original implementation
        return originalRemoveEventListener.apply(this, arguments);
    }
    else {
        // calling implementation patched by Zone.js
        return EventTarget.prototype.removeEventListener.apply(this, arguments);
    }
}
function needToCallOriginalMethod(eventName, listenerFunctionStringified) {
    return eventName === "readystatechange"
        && listenerFunctionStringified.indexOf("registerBrowserPluginElement()") !== -1
        && listenerFunctionStringified.indexOf("registerWebViewElement()") !== -1;
}
window.removeEventListener = removeEventListenerOverloaded;
