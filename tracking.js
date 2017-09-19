(function () {
    'use strict';
    var apiVersion = 'v1',
        clientVersion = "20161006",
        defaultCookie = "_oto",
        defaultUrl = "/collect",
        sessionTime = 1800;
    var isDebug = false,
        documentAlias = window.document,
        navigatorAlias = window.navigator,
        screenAlias = window.screen,
        windowAlias = window,
        encodeWrapper = window.encodeURIComponent,
        decodeWrapper = window.decodeURIComponent,
        urldecode = unescape,
        param = {},
        defaultDomain = getHostName(),
        isCreated = false,
        OTO_ObjectName = isString(window.OTO_ObjectName) && removeBlank(window.OTO_ObjectName) || "OTO";
    var OTO = function () {
        usageLog.set('o');
        if (arguments.length === 0) {
            return false;
        }
        if (isFunction(trackingObject[arguments[0]])) {
            trackingObject[arguments[0]].apply(undefined, arguments);
        }
        else {
            console.log("ERROR:OTO");
            console.log(arguments[0]);
        }



    };

    var usageLog = new function () {

        var array = [];
        this.set = function (a) {
            array.push(a)
        };
        this.get = function () {
            return array.join('');

        };
    };
    var trackingObject = {
        init: function () {
            usageLog.set('I');
            if (arguments.length != 2) {
                console.log("ERROR:init[arguments]");
                console.log(arguments);
                return;
            }
            var setting = arguments[1];
            if (!isString(setting.client)) {
                console.log("ERROR:init[client]");
                console.log(setting);
                return;
            }
            if (isDefined(setting.uid)) {
                param['uid'] = setting.uid;
            }
            if (isDefined(setting.debug)) {
                console.log("DEBUG:enabled");
                isDebug = true;
            }
            var cookiesName = isString(setting.cookie) ? setting.cookie : defaultCookie;
            var cookieString = getCookie(cookiesName);
            defaultUrl = isString(setting.url) ? setting.url : defaultUrl;
            var time = Math.round((new Date).getTime() / 1E3);
            if (cookieString.length === 0) {

                cookieString = genCookie(visitorId(), time, time);
                usageLog.set('C');

            }
            else {
                var cookieArr = cookieString.split('.'), h;

                if (cookieArr.length == 4 && (h = cookieArr.pop(), h == gahash(cookieArr.join('.')))) {
                    if (time - cookieArr[2] <= sessionTime) {
                        cookieString = genCookie(cookieArr[0], cookieArr[1], time);
                        usageLog.set('S');
                    }
                    else {
                        cookieString = genCookie(cookieArr[0], time, time);
                        usageLog.set('s');
                    }


                }
                else {

                    cookieString = genCookie(visitorId(), time, time);
                    usageLog.set('c');
                }

            }
            setCookie(cookiesName, cookieString, 86400 * 365, "/", isString(setting.domain) ? setting.domain : defaultDomain, isSSL());
            param["v"] = apiVersion;
            param["_v"] = clientVersion;
            param["cid"] = cookieString;
            param["tid"] = removeBlank(setting.client);
            param["je"] = javaEnable()
            param["vp"] = viewportSize();
            param["cs"] = charSet();
            param["fv"] = flashVersion();
            param["la"] = browserLanguage();
            param["sc"] = screenColors();
            param["sr"] = screenResolution();
            param["re"] = getReferrer();
            param["pt"] = pageTitle();
            param["ot"] = windowOrientation();
            param["lp"] = getLocation();
            var f = getParameter('f');
            if (f.length > 0) {
                usageLog.set('f');
                param["fr"] = f;
            } else {
                if (isArray(setting.param)) {
                    usageLog.set('F');
                    var tmparr = [];
                    for (var index = 0; index < setting.param.length; index++) {
                        var element = setting.param[index];
                        var temp = getParameter(element);
                        if (temp.length === 0) {
                            tmparr = [];
                            break;
                        }
                        tmparr.push(temp);

                    }
                    param["fr"] = tmparr.join('|');

                }
            }
            var vid = getParameter('vid');
            if (vid.length > 0) {
                usageLog.set('v');
                param["vid"] = vid;
            }
            isCreated = true;


        },

        pageview: function () {
            usageLog.set('p');
            if (!isCreated) {
                console.log("ERROR:pageview");
                return;
            }
            var arrayparam = [];
            for (var key in param) {
                param.hasOwnProperty(key) && arrayparam.push(key + "=" + encodeWrapper(param[key]));
            }
            arrayparam.push("t=pageview");
            sendRequest(arrayparam.join('&'));



        },

        event: function () {
            usageLog.set('e');
            if (!isCreated) {
                console.log("ERROR:event");
                return;
            }

            if (arguments.length != 2) {
                console.log("ERROR:event[arguments]");
                console.log(arguments);
                return;
            }

            var event = arguments[1];
            if (!isString(event.name) || !isString(event.label) || !isString(event.action)) {
                console.log("ERROR:event[null]");
                console.log(event);
                return;
            }

            var arrayparam = [];
            for (var key in param) {
                param.hasOwnProperty(key) && arrayparam.push(key + "=" + encodeWrapper(param[key]));
            }
            arrayparam.push("t=event");
            arrayparam.push('en=' + encodeWrapper(event.name));
            arrayparam.push('ea=' + encodeWrapper(event.action));
            arrayparam.push('el=' + encodeWrapper(event.label));
            isString(event.value) && arrayparam.push('ev=' + encodeWrapper(event.value));
            sendRequest(arrayparam.join('&'));

        }

    };
    function sendRequest(datas) {

        datas = datas + "&_=" + (new Date).getTime();
        if (isDebug) {
            console.log("DEBUG:sendRequest");
            console.log(datas);
            datas = datas + "&usage=" + usageLog.get() + '_d';
            XMLHttpRequest(defaultUrl, datas);
        } else {
            if (navigatorAlias.sendBeacon) {
                datas = datas + "&usage=" + usageLog.get() + 'b';
                navigatorAlias.sendBeacon(defaultUrl, datas)
            } else if (2036 >= datas.length) {
                datas = datas + "&usage=" + usageLog.get() + 'm';
                imageRequest(defaultUrl, datas);
            } else if (8192 >= datas.length) {
                datas = datas + "&usage=" + usageLog.get() + 'x';
                XMLHttpRequest(defaultUrl, datas);
            }
        }
    };
    function XMLHttpRequest(a, b) {
        var d = windowAlias.XMLHttpRequest;
        if (!d) return false;
        var e = new d;
        if (!("withCredentials" in e)) return false;
        e.open("POST", a, true);
        e.withCredentials = true;
        e.setRequestHeader("Content-Type", "text/plain");
        e.onreadystatechange = function () {
            4 == e.readyState && (e = null);
        };
        e.send(b);
        return true;
    };
    function imageRequest(a, b) {
        var d = createImg(a + "?" + b);
        d.onload = d.onerror = function () {
            d.onload = null;
            d.onerror = null;
        };
    };
    function createImg(a) {
        var b = document.createElement("img");
        b.width = 1;
        b.height = 1;
        b.src = a;
        return b;
    };
    function genCookie(vid, time1, time2) {
        var k = [vid, time1, time2].join(".");
        var hash = gahash(k);
        return k + "." + hash;
    };
    function javaEnable() {
        var e = navigatorAlias && "function" === typeof navigatorAlias.javaEnabled && navigatorAlias.javaEnabled() || false;
        return e ? 1 : 0;
    };
    function windowOrientation() {
        var o = windowAlias.orientation;
        if (typeof (o) === 'undefined') {
            return 'none';
        }
        else {
            return windowAlias.orientation;

        }
    };
    function viewportSize() {
        var c = documentAlias.documentElement, e,
            g = (e = documentAlias.body) && e.clientWidth && e.clientHeight,
            ca = [];
        c && c.clientWidth && c.clientHeight && ("CSS1Compat" === documentAlias.compatMode || !g) ? ca = [c.clientWidth, c.clientHeight] : g && (ca = [e.clientWidth, e.clientHeight]);
        c = 0 >= ca[0] || 0 >= ca[1] ? "" : ca.join("x");
        return c;
    };
    function browserLanguage() {
        return (navigatorAlias && (navigatorAlias.language || navigatorAlias.browserLanguage) || "").toLowerCase();
    };
    function screenColors() {
        return screenAlias.colorDepth + "-bit";
    };
    function screenResolution() {
        return screenAlias.width + "x" + screenAlias.height;
    };
    function charSet() {
        return documentAlias.characterSet || documentAlias.charset;
    };
    function pageTitle() {
        return documentAlias.title || '';
    };

    function fingerPrint() {
        var keys = [];
        keys.push(navigatorAlias.userAgent);
        keys.push(browserLanguage());
        keys.push(charSet());
        keys.push(screenResolution());
        keys.push(screenColors());
        var n, f, t;
        if ((t = (t = navigatorAlias) ? t.plugins : null) && t.length) {
            for (var r = 0; r < t.length && !f; r++) {
                keys.push(t[r].name);
            }
        }
        return gahash(keys.join('###'));



    };
    function visitorId() {
        var rnd = Math.round(Math.random() * 2147483647);
        return rnd ^ fingerPrint() & 2147483647;
    };

    function isSSL() {
        return "https:" == windowAlias.location.protocol ? true : false;
    };

    function gahash(str) {
        var hash = 1,
            charCode = 0,
            idx;
        if (str) {
            hash = 0;
            for (idx = str.length - 1; idx >= 0; idx--) {
                charCode = str.charCodeAt(idx);
                hash = (hash << 6 & 268435455) + charCode + (charCode << 14);
                charCode = hash & 266338304;
                hash = charCode != 0 ? hash ^ charCode >> 21 : hash;
            }
        }
        return hash;
    };

    function isDefined(property) {

        var propertyType = typeof property;

        return propertyType !== 'undefined';
    };


    function isFunction(property) {
        return typeof property === 'function';
    };


    /*
     * Is property an object?
     *
     * @return bool Returns true if property is null, an Object, or subclass of Object (i.e., an instanceof String, Date, etc.)
     */
    function isObject(property) {
        return typeof property === 'object';
    };


    function isArray(a) {
        return "[object Array]" == Object.prototype.toString.call(Object(a));
    };
    function isString(a) {

        return void 0 != a && - 1 < (a.constructor + "").indexOf("String");
    };

    function inString(a, b) {
        return 0 == a.indexOf(b);
    };
    function removeBlank(a) {
        return a ? a.replace(/^[\s\xa0]+|[\s\xa0]+$/g, "") : "";
    };

    function emptyFunction() {
    };

    function getReferrer() {
        var referrer = '';

        try {
            referrer = windowAlias.top.document.referrer;
        } catch (e) {
            if (windowAlias.parent) {
                try {
                    referrer = windowAlias.parent.document.referrer;
                } catch (e2) {
                    referrer = '';
                }
            }
        }

        if (referrer === '') {
            referrer = documentAlias.referrer;
        }

        return referrer;
    };


    function getProtocolScheme(url) {
        var e = new RegExp('^([a-z]+):'),
            matches = e.exec(url);

        return matches ? matches[1] : null;
    };


    function getHostName(url) {
        if (typeof (url) === 'undefined') {
            var a = "" + windowAlias.location.hostname;
            return 0 == a.indexOf("www.") ? a.substring(4) : a;
        }
        // scheme : // [username [: password] @] hostame [: port] [/ [path] [? query] [# fragment]]
        var e = new RegExp('^(?:(?:https?|ftp):)/*(?:[^@]+@)?([^:/#]+)'),
            matches = e.exec(url);

        return matches ? matches[1] : url;
    };

    function getParameter(name, url) {
        if (typeof (url) === 'undefined') {
            url = windowAlias.location.href;
        }
        var regexSearch = "[\\?&#]" + name + "=([^&#]*)";
        var regex = new RegExp(regexSearch);
        var results = regex.exec(url);
        return results ? decodeWrapper(results[1]) : '';
    };
    function getLocation() {
        var d = documentAlias.location;
        if (d) {
            var e = d.pathname || "";
            "/" != e.charAt(0) && (usageLog.set('L'), e = "/" + e);
            return d.protocol + "//" + d.hostname + e + d.search;
        }
    };

    function setCookie(cookieName, value, sToExpire, path, domain, secure) {


        var expiryDate;

        // relative time to expire in milliseconds
        if (sToExpire) {
            expiryDate = new Date();
            expiryDate.setTime(expiryDate.getTime() + sToExpire * 1000);
        }

        documentAlias.cookie = cookieName + '=' + encodeWrapper(value) +
            (sToExpire ? ';expires=' + expiryDate.toGMTString() : '') +
            ';path=' + (path || '/') +
            (domain ? ';domain=' + domain : '') +
            (secure ? ';secure' : '');

    };

    function getCookie(cookieName) {


        var cookiePattern = new RegExp('(^|;)[ ]*' + cookieName + '=([^;]*)'),
            cookieMatch = cookiePattern.exec(documentAlias.cookie);

        return cookieMatch ? decodeWrapper(cookieMatch[2]) : "";
    };

    function purify(url) {
        var targetPattern;
        targetPattern = new RegExp('#.*');
        return url.replace(targetPattern, '');

    };

    function resolveRelativeReference(baseUrl, url) {
        var protocol = getProtocolScheme(url),
            i;

        if (protocol) {
            return url;
        }

        if (url.slice(0, 1) === '/') {
            return getProtocolScheme(baseUrl) + '://' + getHostName(baseUrl) + url;
        }

        baseUrl = purify(baseUrl);

        i = baseUrl.indexOf('?');
        if (i >= 0) {
            baseUrl = baseUrl.slice(0, i);
        }

        i = baseUrl.lastIndexOf('/');
        if (i !== baseUrl.length - 1) {
            baseUrl = baseUrl.slice(0, i + 1);
        }

        return baseUrl + url;
    };

    function flashVersion() {
        var a, b, c;
        if ((c = (c = navigatorAlias) ? c.plugins : null) && c.length)
            for (var d = 0; d < c.length && !b; d++) {
                var e = c[d];
                -1 < e.name.indexOf("Shockwave Flash") && (b = e.description);
            }
        if (!b)
            try {
                a = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7"),
                    b = a.GetVariable("$version");
            } catch (g) {

            }
        if (!b)
            try {
                a = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6"),
                    b = "WIN 6,0,21,0",
                    a.AllowScriptAccess = "always",
                    b = a.GetVariable("$version");
            } catch (ca) {
            }
        if (!b)
            try {
                a = new ActiveXObject("ShockwaveFlash.ShockwaveFlash"),
                    b = a.GetVariable("$version");
            } catch (l) {
            }
        b && (a = b.match(/[\d]+/g)) && 3 <= a.length && (b = a[0] + "." + a[1] + " r" + a[2]);
        return b || '';
    };


    function onPageIsVisibility(funcrun) {
        if ("prerender" == document.visibilityState) return false;
        funcrun();
        return true;
    };

    function addEvent(a, b, c, d) {
        try {
            a.addEventListener ? a.addEventListener(b, c, !!d) : a.attachEvent && a.attachEvent("on" + b, c);
        } catch (e) {

        }
    };
    function init() {
        usageLog.set('i');
        var a = [], b = windowAlias[OTO_ObjectName];
        if (b.q) {
            a = a.concat(b.q);
            usageLog.set('a');
        }
        windowAlias[OTO_ObjectName] = OTO;
        a.forEach(function (element) {
            OTO.apply(undefined, element);
        }, this);

    }
    (function () {
        var a = init;
        if (!onPageIsVisibility(a)) {
            var b = false;
            var c = function () {
                !b && onPageIsVisibility(a) && (b = true, removeEvent(document, "visibilitychange", c));
            };
            addEvent(document, "visibilitychange", c);
        }
    })();

}(window));