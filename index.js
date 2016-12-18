/*
* Name: xhr,AJAX封装函数
* Description: 一个ajax调用封装类,仿jquery的ajax调用方式
* Author: schacker
*/
var xhr = function() {
    var ajax = function() {
    	if (typeof XMLHttpRequest !== 'undefined') {
    		return new XMLHttpRequest();
    	} else if (typeof ActiveXObject !== 'undefined') {
    		if (typeof arguments.callee.activeXString !== 'string') {
    			var versions = ['MSXML2.XMLHttp.6.0', 'MSXML2.XMLHttp.3.0', 'MSXML2.XMLHttp'];
    			for (var i = 0,len = versions.length;i < len;i++) {
    				try {
    					var xhr = new ActiveXOject(versions[i]);
    					arguments.callee.activeXString = versions[i];
    					return xhr;
    				} catch (ex) {
    					continue;
    				}
    			}
    		}
    		return new ActiveXObject(arguments.callee.activeXString);
    	} else {
    		throw new Error("no xhr object available");
    	}
    };
    var formatData = function(fd) {
        var res = '';
        for (var f in fd) {
            res += f+'='+fd[f]+'&';
        }
        return res.slice(0, -1);
    };
    var AJAX = function(ops) {
        var root = this;
        var req = ajax;
        root.url = ops.url;
        root.type = ops.type || 'responseText';
        root.contentType = ops.contentType || 'application/x-www-form-urlencoded';
        root.method = ops.method || 'GET';
        root.async = ops.async || true;
        root.data = ops.data || {};
        root.complete = ops.complete || function() {};
        root.success = ops.success || function(){};
        root.error =  ops.error || function (s) { alert(root.url+'->status:'+s+'error!')};
        root.abort = req.abort;
        root.timeout = ops.timeout;
        root.setData = function  (data) {
            for(var d in data) {
                root.data[d] = data[d];
            }
        }
        root.send = function  () {
            var datastring = root.contentType==='application/x-www-form-urlencoded'? formatData(root.data) : root.data,
            sendstring,get = false,
            async = root.async,
            complete = root.complete,
            method = root.method,
            type = root.type,
            contentType = root.contentType;
            if(method === 'GET') {
                root.url += '?'+datastring;
                get = true;
            }
            req.open(method, root.url, async);
            if(!get) {
                req.setRequestHeader("Content-type",contentType);
                sendstring = datastring;
            }
             //在send之前重置onreadystatechange方法,否则会出现新的同步请求会执行两次成功回调(chrome等在同步请求时也会执行onreadystatechange)
            req.onreadystatechange = async ? function  () {
                // console.log('async true');
                if (req.readyState ==4){
                    complete();
                    if(req.status == 200) {
                        root.success(req[type]);
                    } else {
                        root.error(req.status);
                    }
                }
            } : null;
            req.send(sendstring);
            if(!async) {
                //console.log('async false');
                complete();
                root.success(req[type]);
            }
        }
        root.url && root.send();
    };
    return function(ops) {return new AJAX(ops);}
}();
module.exports = xhr;
