# ouph analytics platform jsSDK

## What's ouph analytics platform?
ouph analytics platform is open source web/mobile analytics platform.
* open source
* multiply database support
* 100% data ownership
* customisable and extensible

There are 4 parts of ouph analytics platform : 
1. SDK:sends web/app data to server
2. receiver: collects data form SDK
3. etl：extract,transform form raw data and make data more readable
4. dashboard：data visualization

## How to use ouph analytics platform jsSDK?

### bulid from  source
#### 1.download source form github
``git clone https://github.com/laneleads/ouph-jsSDK.git``
#### 2.ouph analytics platform jsSDK is working on nodejs and gulp.please install them frist.
``npm install``

``npm run publish`` or ``gulp`` 

#### 3.copy **tracking.min.js** form  **publish** directory 

### download compressed file
/build/tracking.min.js


### add tracking code to webpage

        (function (i, s, o, g, r, a, m) {
        i['OTO_ObjectName'] = r;
        i[r] = i[r] || function () {
        (i[r].q = i[r].q || []).push(arguments)
        }, i[r].l = 1 * new Date();
        a = s.createElement(o),
        m = s.getElementsByTagName(o)[0];
        a.async = 1;
        a.src = g;
        m.parentNode.insertBefore(a, m)
        })(window, document, 'script', '[path]/tracking.min.js', 'OTO');
        OTO("init",{client:"[clientID]",url:'[URL]'});
        OTO("pageview");

