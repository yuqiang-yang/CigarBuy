
function displayDate(){
	document.getElementById("demo").innerHTML=Date();
        console.log('没有错误，很安全')
}

//var _BASE_ROOT = '';			//网站访问根目录
//var _CMPT_ROOT = '';			//组件所在根目录，通常用于访问静态资源（图片等）


//var _PUB_URL = 'wdk?action=wdk.pub&method=call_service';
//var _PUB_URL2 = 'http://b-test.zj.com.yc/wdk?action=wdk.pub&method=call_service';
 
 
var _PUB_URL = 'http://www.yueyigou.com/wdk?action=ecw.page&method=call_service';
var _ECW_URL = 'http://www.yueyigou.com/ecw';
//var _PUB_URL = 'wdk?action=wdk.pub&method=call_service';
//var _PUB_URL2 = 'http://localhost:8080/eap_imp/wdk?action=wdk.pub&method=call_service';
var _PUB_URL2 = _PUB_URL;
var _ECW_URL2 = _ECW_URL;

var WDK_Timeout = 50000;		//ajax超时参数


var layer_index = -1;
/******************************************************
 * 公用方法
 *****************************************************/
//定义构造函数，用来确保new一个对象的时候能够调用构造函数init
var Class = {
    create: function() {
        return function() { this.init.apply(this, arguments); }
    }
};

//数组中是否包含指定key的元素
Array.prototype.contains = function (obj) {  
    var i = this.length;  
    while (i--) {  
        if (this[i] === obj) {  
            return true;  
        }  
    }  
    return false;  
};

Array.prototype.filter = Array.prototype.filter || function(func) {
	var arr = this;
	var newArr = [];
	
	for(var i = 0; i < arr.length; i++) {
		if (func(arr[i], i, arr)) {
			newArr.push(arr[i])
		}
	}
	return newArr;
}


////////////////////////////////////////
////	jquery 扩展方法
////////////////////////////////////////
$.extend({
	//生成分页条
	pagebar:function(jparam){
		var _id = jparam.id?jparam.id:'';										//容器ID
		var _url = jparam.url?jparam.url:_PUB_URL2;								//服务方action地址
		var _queryParams = jparam.queryParams?jparam.queryParams:{};			//请求参数
		var _page_size = jparam.page_size?parseInt(jparam.page_size):20;		//每页记录数，默认每页20条

		var _onPage = jparam.onPage?jparam.onPage:function(curr_page){};		
		var _onBeforePage = jparam.onBeforePage?jparam.onBeforePage:function(_queryParams){};	//开始分页前，通常用于处理请求参数
		var _is_current_open = jparam.current_open?jparam.current_open:false; 
		
		var _mid = $.method_reg(window,_onPage);
		
		
		var _total_size = 0;		//总记录数
		

		

		if(_onBeforePage){
			_onBeforePage(_queryParams);
		}
		
		//开始分页
		$.pagebar_query(_id,_url,Base64.encode($.json2str(_queryParams)),1,_page_size,_mid);
		
		
		$('#'+_id).addClass('page_bar');
		//绑定事件
		$('#'+_id).on('click', function(e) {
			var target = $(e.target);
			var self = $(this);
			var _page = 1;
			var _totalPage = 1;

			if (target.hasClass('pagebar_num_selected') || target.hasClass('pagebar_idx_disabled')) {//如果点击的是不可点击的：当前第一页、当前最后一页、当前页
				return;
			} else if (target.hasClass('pagebar_goprev')) {//如果点击的是上一页
				_page = parseInt(self.attr('currentPage'));
				$.pagebar_query(_id,_url,Base64.encode($.json2str(_queryParams)),_page - 1,_page_size,_mid);

			} else if (target.hasClass('pagebar_gonext')) {//如果点击的是下一页
				_page = parseInt(self.attr('currentPage'));
				$.pagebar_query(_id,_url,Base64.encode($.json2str(_queryParams)),_page + 1,_page_size,_mid);

			} else if (target.hasClass('pagebar_num')) {//如果点击的是分页数目
				_page = parseInt(target.text());
				$.pagebar_query(_id,_url,Base64.encode($.json2str(_queryParams)),_page,_page_size,_mid);			

			} else if (target.hasClass('pagebar_btn')) {//如果点击的是确定按钮
				_page = parseInt(self.find('.pagebar_topage').val());
				_totalPage = parseInt(self.attr('totalPage'));
				var _currentPage = parseInt(self.attr('currentPage')) || 1;
				
				if (!_page || _page > _totalPage || _page < 0 || _page == _currentPage) {//输入页数：无法转换成整数、超出当前最大页数、小于0、等于当前页数
					_page = _currentPage;
					self.find('.pagebar_topage').val(_page);
					return;
				} 
				$.pagebar_query(_id,_url,Base64.encode($.json2str(_queryParams)),_page,_page_size,_mid);
				
			}
		});
		/*
		$.ajax(
			_url,
			{
				data: _queryParams
				,dataType: 'jsonp'
				,crossDomain: true
				,jsonp:'callback'
				,success: function(data) {
					alert(data);
					
				  if(data && data.resultcode == '200'){
						alert(data.result);
						var jres = $.str2json(data.result);
						var nTotal = jres.total;			//总记录数
						var jrows = jres.rows;				//当前分页记录
						alert('nTotal='+nTotal);
				  }
				
				}
			}
		);
		*/
		
		
	}
	,pagebar_query:function(id,url,queryParams,page,rows,onPage_mid){
	//	alert('id='+id+'\nurl='+url+'\nqueryParams='+queryParams+'\npage='+page+'\nrows='+rows+'\nonPage_mid='+onPage_mid);
		
		$.wait_open();
		var _queryParams = $.str2json(Base64.decode(queryParams));
		//处理分页参数
		_queryParams.page = page;					//当前页数
		_queryParams.rows = rows;					//每页记录数
		page = parseInt(page);
		$.cuajax({
			url:url
			,data:_queryParams
			,success:function(result) {
				var jres = $.str2json(result);
				var nTotal = jres.total;			//总记录数
				//开始计算需要显示的页码
				var total_page = Math.ceil(nTotal/rows);	//总页数
				var jrows = jres.rows;				//当前分页记录
				
				var html = new Array();

				if (!total_page) {
					total_page = 1;
				}

				html.push('<div class="pagebar_con">');
				html.push('	<a href="javascript:;" class="pagebar_goprev pagebar_idx'+(1==page?' pagebar_idx_disabled':'')+'">上一页</a>');
				if(total_page<9){
					for(var i=0;i<total_page;i++){
						html.push('	<a href="javascript:;" class="pagebar_num'+(page==(i+1)?' pagebar_num_selected':'')+'">'+(i+1)+'</a>');
					}
				}else{
					
					if(page<=6){
					//情况1：如果当前页数在1-6页时，保持不变
						for(var i=0;i<7;i++){
							html.push('	<a href="javascript:;" class="pagebar_num'+(page==(i+1)?' pagebar_num_selected':'')+'">'+(i+1)+'</a>');
						}
						html.push('	<span class="pagebar_other">…</span>');
						html.push('	<a href="javascript:;" class="pagebar_num">'+total_page+'</a>');
					}else if(page>total_page-5){
					//情况2：如果当前页数在total-6到total时，省略号在第二个，保留第一页
						html.push('	<a href="javascript:;" class="pagebar_num">1</a>');
						html.push('	<span class="pagebar_other">…</span>');
						for(var i=total_page-6;i<total_page;i++){
							html.push('	<a href="javascript:;" class="pagebar_num'+(page==(i+1)?' pagebar_num_selected':'')+'">'+(i+1)+'</a>');
						}
					}else{
					//情况3：如果是其他情况，则显示 第一页、省略号、前两页、前一页、当前页、后一页、后两页、省略号、最后一页
						html.push('	<a href="javascript:;" class="pagebar_num">1</a>');
						html.push('	<span class="pagebar_other">…</span>');
						for(var i=page-3;i<page+2;i++){
							html.push('	<a href="javascript:;" class="pagebar_num'+(page==(i+1)?' pagebar_num_selected':'')+'">'+(i+1)+'</a>');
						}
						html.push('	<span class="pagebar_other">…</span>');
						html.push('	<a href="javascript:;" class="pagebar_num">'+total_page+'</a>');
					}
					
				}
				html.push('	<a href="javascript:;" class="pagebar_gonext'+(total_page==page?' pagebar_idx_disabled':'')+'">下一页</a>');		
				html.push('	<span>共'+total_page+'页</span>');
				html.push('	<span>到</span>');
				html.push('	<input type="text" class="pagebar_topage" value="'+ page +'">');
				html.push('	<span>页</span>');		
				html.push('	<div class="pagebar_btn">确定</div>');			
				html.push('</div>');
				$('#'+id).html(html.join(''));
				$('#'+id).attr('currentPage', page);
				$('#'+id).attr('totalPage', total_page);

				$.method_call(onPage_mid,jres);

				$.wait_close();
			}
			,error:function(result){
				var html = new Array();
				html.push('<div class="pagebar_con">');
				html.push('	<a href="javascript:;" class="pagebar_goprev pagebar_idx_disabled">上一页</a>');
				
				html.push('	<a href="javascript:;" class="pagebar_gonext pagebar_idx_disabled">下一页</a>');		
				html.push('	<span>共0页</span>');
				html.push('	<span>到</span>');
				html.push('	<input type="text" id="pagebar_topage" class="pagebar_topage" value="0">');
				html.push('	<span>页</span>');		
				html.push('	<div class="pagebar_btn">确定</div>');			
				html.push('</div>');
				$('#'+id).html(html.join(''));
				$.method_call(onPage_mid,jres);

				alert('网络错误！result='+result);
				$.wait_close();
			}
		});
	}
	,pagebar_refresh:function(jparam){
		var _id = jparam.id?jparam.id:'';								//容器ID
		var _total_size = jparam.total_size?jparam.total_size:'0';		//总页数
		var _curr_page = jparam.curr_page?jparam.curr_page:'1';			//当前页数
		
		
	}
	//日期格式转换，相关参数说明如下
	//	strDate输入格式支持如下：
	//	1、yyyy-MM-dd
	//	2、yyyy-MM-dd HH:mm:ss
	//	3、yyyyMMdd
	//	4、yyyyMMddHHmmss
	//strFormat格式自定义
	,date_format:function(strDate,strFormat){
		if(!strDate){
			return strDate;
		}

		var d;
		var length = strDate.length;
		switch(length){
			case 10:
				var arr = strDate.split('-');
				d = new Date(arr[0],parseInt(arr[1])-1,arr[2],0,0,0);
				weekday = d.getDay();
				break;
			case 19:
				var arr = strDate.split(' ');
				var arr2 = arr[0].split('-');
				d = new Date(arr2[0],parseInt(arr2[1])-1,arr2[2],arr2[3],arr2[4],arr2[5]);
				weekday = d.getDay();
				break;
			case 8:
				d = new Date(strDate.substring(0,4),parseInt(strDate.substring(4,6))-1,strDate.substring(6),0,0,0);
				weekday = d.getDay();
				break;
			case 14:
				d = new Date(strDate.substring(0,4),parseInt(strDate.substring(4,6))-1,strDate.substring(6,8),strDate.substring(8,10),strDate.substring(10,12),strDate.substring(12,14));
				weekday = d.getDay();
				break;
			default:
				break;
		}


		var o = {         
			"M+" : d.getMonth()+1, //月份         
			"d+" : d.getDate(), //日         
			"h+" : d.getHours()%12 == 0 ? 12 : d.getHours()%12, //小时         
			"H+" : d.getHours(), //小时         
			"m+" : d.getMinutes(), //分         
			"s+" : d.getSeconds(), //秒         
			"q+" : Math.floor((d.getMonth()+3)/3), //季度         
			"S" : d.getMilliseconds() //毫秒         
		};         
		var week = {         
			"0" : "/u65e5",         
			"1" : "/u4e00",         
			"2" : "/u4e8c",         
			"3" : "/u4e09",         
			"4" : "/u56db",         
			"5" : "/u4e94",         
			"6" : "/u516d"        
		};         
		if(/(y+)/.test(strFormat)){         
			strFormat = strFormat.replace(RegExp.$1, (d.getFullYear()+"").substr(4 - RegExp.$1.length));         
		}         
		if(/(E+)/.test(strFormat)){         
			strFormat = strFormat.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "/u661f/u671f" : "/u5468") : "")+week[d.getDay()+""]);         
		}         
		for(var k in o){         
			if(new RegExp("("+ k +")").test(strFormat)){         
				strFormat = strFormat.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));         
			}         
		}         
		return strFormat;      
	}

	//星期几换算，日期格式支持一下格式并会自动转换：
	//	1、yyyy-MM-dd
	//	2、yyyy-MM-dd HH:mm:ss
	//	3、yyyyMMdd
	//	4、yyyyMMddHHmmss
	//返回结果参数如下（例如为星期四）：
	//	retType=null	返回 4
	//	retType=1		返回 星期四
	//	retType=2		返回 周四
	,date2weekday:function(strDate,retType){
		if(!strDate){
			return strDate;
		}

		var d;
		var weekday = -1;
		var length = strDate.length;
	
		switch(length){
			case 10:
				var arr = strDate.split('-');
				d = new Date(arr[0],parseInt(arr[1])-1,arr[2]);
				weekday = d.getDay();
				break;
			case 19:
				var arr = strDate.split(' ');
				var arr2 = arr[0].split('-');
				d = new Date(arr2[0],parseInt(arr2[1])-1,arr2[2]);
				weekday = d.getDay();
				break;
			case 8:
				d = new Date(strDate.substring(0,4),parseInt(strDate.substring(4,6))-1,strDate.substring(6));
				weekday = d.getDay();
				break;
			case 14:
				d = new Date(strDate.substring(0,4),parseInt(strDate.substring(4,6))-1,strDate.substring(6));
				weekday = d.getDay();
				break;
			default:
				break;
			
		}
		var weekArray01 = new Array("7", "1", "2", "3", "4", "5", "6");
		var weekArray02 = new Array("星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六");
		var weekArray03 = new Array("周日", "周一", "周二", "周三", "周四", "周五", "周六");
		
		var retWeekday;
		switch(retType){
			case '1':
				retWeekday = weekArray02[weekday];
				break;
			case '2':
				retWeekday = weekArray03[weekday];
				break;
			default:
				retWeekday = weekArray01[weekday];
				break;
		}
		return retWeekday;

	}
	//获取最顶层对象
	,getRoot:function(){
//		var _top = window;
//		while(_top!=_top.parent){
//			_top = _top.parent;
//		}
//		return _top;
		var _top = window;
		while(_top.__isTop!=true){
			_top = _top.parent;
			if(_top==_top.parent){
				break;
			}
		}
		return _top;
	}
	//注册方法
	//	win:注册页面的window对象
	//	funname:方法函数名,也可以是函数句柄
	//	jparam:附加传递参数
	,method_reg:function(win,funname,jparam){
		var _top = $.getRoot();
		var _method = _top._METHOD;
		if(!_method){
			_top._METHOD = new Object();
			_method = _top._METHOD;
		}
		var _id = $.getUUID();
		_method[_id]={
				win:win,
				method:funname,
				jparam:jparam
		};
		return _id;
	}
	//执行事件
	//	id:注册方法返回的ID
	//	jparam:调用时传递的参数，json格式
	,method_call:function(id,jparam){
		var _top = $.getRoot();
		var _method = _top._METHOD;
		if(_method[id]){
			var _fun = _method[id].method;
			if('string'==typeof(_fun)){
				_fun = _method[id].win[_method[id].method];
			}
			var _v = _fun(jparam,_method[id].jparam);
			return _v;
		}
		return null;
	}
	//返回一个JSON对象属性数量
	,getObjectAttrCount:function(object){
		return Object.getOwnPropertyNames(object).length;
	}
	//json转字符串
	,json2str:function(o){
		/*var r = [];
		   if(typeof o == "string" || o == null) {
		     return o;
		   }
		   if(typeof o == "object"){
		     if(!o.sort){
		       r[0]="{";
		       for(var i in o){
		         r[r.length]=i;
		         if(typeof o[i] == "object"){
		        	 r[r.length]=":";
			         r[r.length]=$.json2str(o[i]);
			         r[r.length]=",";
		         }else{
			         r[r.length]=":";
			         r[r.length]="\"";
			         r[r.length]=$.json2str(o[i]);
			         r[r.length]="\"";
			         r[r.length]=",";
		         }
		       }
		       if(r.length>1){
		    	   r[r.length-1]="}";
		       }else{
		    	   r[r.length]="}";
		       }
		     }else{
		       r[0]="[";
		       for(var i =0;i<o.length;i++){
		         r[r.length]=$.json2str(o[i]);
		         r[r.length]=",";
		       }
		       if(r.length>1){
		    	   r[r.length-1]="]";
		       }else{
		    	   r[r.length]="]";
		       }
		     }
		     return r.join("");
		   }
		   return o.toString();
		   */
		   return JSON.stringify(o);
	}
	//字符串转json
	,str2json:function(str){
		var eob = null;
		try{
			eob = eval("("+str+")");
			//eob=JSON.parse(str);
		}catch(e){
//			alert('err:'+str);
			if(null!=str&&''!=str){
				$.getRoot().$.messager.alert('信息提示','字符转换错误：'+e.message+'\nstr='+str,'error');
			}
		}
		return eob;
	},
	//在当前页面打开等待提示
	wait_open:function(jparam){
		var _shade = (jparam && jparam.shade) ? jparam.shade : false;
		index = layer.load(0, {
			shade: _shade
		});
		layer_index = index;
		/*
		$("#wdk_wait").remove();
		$("#wdk_wait_msg").remove();
		
		$("<div id=\"wdk_wait\" class=\"wait_div\" style=\"z-index:9999\"></div>").css({display:"block",width:"100%",height:$(window).height()}).appendTo("body"); 
		$("<div id=\"wdk_wait_msg\" class=\"wait_div_msg\" style=\"z-index:10000\"></div>").html("正在处理，请稍候。。。").appendTo("body").css({display:"block",left:($(document.body).outerWidth(true) - 190) / 2,top:($(window).height() - 45) / 2}); 
		*/
	}
	//在当前页面关闭等待提示
	,wait_close:function(){
		layer.close(layer_index);  
		/*
		$("#wdk_wait").remove();
		$("#wdk_wait_msg").remove();
		*/
	}
	/*
	,wait_open:function(){
		//return index = layer.load(0, {shade: true});
		
		
		
		$("#wdk_wait").remove();
		$("#wdk_wait_msg").remove();
		
		$("<div id=\"wdk_wait\" class=\"wait_div\" style=\"z-index:9999\"></div>").css({display:"block",width:"100%",height:$(window).height()}).appendTo("body"); 
		$("<div id=\"wdk_wait_msg\" class=\"wait_div_msg\" style=\"z-index:10000\"></div>").html("正在处理，请稍候。。。").appendTo("body").css({display:"block",left:($(document.body).outerWidth(true) - 190) / 2,top:($(window).height() - 45) / 2}); 
		
	}
	//在当前页面关闭等待提示
	,wait_close:function(){
		//layer.close(index);  
		
		$("#wdk_wait").remove();
		$("#wdk_wait_msg").remove();
		
	}*/
	//创建ajax传输对象
	,createXMLHttpRequest:function() {  
		var request = false;  
		if (window.XMLHttpRequest) {  
			request = new XMLHttpRequest();  
			if (request.overrideMimeType) {  
				request.overrideMimeType('text/xml');  
			}  
		} else if (window.ActiveXObject) {  
			var versions = [ 'Microsoft.XMLHTTP', 'MSXML.XMLHTTP',  
					'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.7.0',  
					'Msxml2.XMLHTTP.6.0', 'Msxml2.XMLHTTP.5.0',  
					'Msxml2.XMLHTTP.4.0', 'MSXML2.XMLHTTP.3.0', 'MSXML2.XMLHTTP' ];  
			for ( var i = 0; i < versions.length; i++) {  
				try {  
					request = new ActiveXObject(versions[i]);  
					if (request) {  
						return request;  
					}  
				} catch (e) {  
				}  
			}  
		}  
		return request;  
	}
	//提交ajax
	,cuajax:function(jparam){
		try{
			var fireGlobals,s;
			s = jQuery.ajaxSetup( {}, jparam );
			fireGlobals = s.global;
			// Watch for a new set of requests
			if ( fireGlobals && jQuery.active++ === 0 ) {
				jQuery.event.trigger("ajaxStart");
			}
			var _url = jparam["url"]?jparam["url"]:_PUB_URL;					//目标地址
			var _method = jparam["method"]?jparam["method"]:"post";				//提交方式，get或者post				
			var _data = jparam["data"];					//提交的参数
			var _timeout = jparam["timeout"]?jparam['timeout']:WDK_Timeout;			//超时时间
			var _ontimeout = jparam["onTimeout"];		//超时回调
			var _success = jparam["success"];			//成功
			var _error = jparam["error"];				//失败
			
			var _param = "";			//提交的参数
			var _tm;					//超时对象
			var _xmlhttp;
			var _async=jparam.async==false?false:true;
			
			if(!_data){
				
			}

			//读取提交参数
			/*
			var paramarr = new Array();
			if(_data){
				for(var att in _data){
					//paramarr.push(att+"="+_data[att]);
					var str = _data[att]+'';
					//str = str.replace(/\+/g,"%2B");
					paramarr.push(att+"="+encodeURIComponent(str));
				}
			}
			_param = paramarr.join('&');
			*/
			_param = "wppm="+Base64.encode2(escape($.json2str(_data)));
			//alert('_param='+_param)
			//设置默认值
			_method = (null==_method||""==_method||"get"!=_method.toLowerCase())?"post":"get";
			_timeout = (null==_timeout||""==_timeout)?30*1000:_timeout;

			//进行ajax提交
			if(null!=_url&&""!=_url){
				_url += _url.match(/\?/) ? (_url.match(/\=/)?"&ajaxparamtime="+new Date().getTime():"ajaxparamtime="+new Date().getTime()) : ("?ajaxparam="+new Date().getTime());
					_xmlhttp = $.createXMLHttpRequest();
					_xmlhttp.onreadystatechange=function(){
						if(_xmlhttp.readyState==4){
							if(_xmlhttp.status==200) { 
								//清除定时器
								if(_tm){
									clearTimeout(_tm);
								}

								var resultStr = _xmlhttp.responseText;
								if(null==_success||""==_success||"undefined"==_success||"function"!=typeof(_success)){
									alert('信息提示：success函数为空或不是函数','warning');
								}else{
										_success(resultStr);
										if(typeof jQuery == "function"){
											if ( fireGlobals ) {
												if ( !( --jQuery.active ) ) {
													jQuery.event.trigger("ajaxStop");
												}
											}
										}
//									}
								}
							}else{
								if(_tm){
									clearTimeout(_tm);
								}
								//alert('response.status='+_xmlhttp.status);
								if(505==_xmlhttp.status){
									//session超时，跳转到错误页面
									//_alert('ajax提交错误：'+_xmlhttp.status);
									$.page_redirect("page_error","page_code=505");
//									$.getRoot().location.href = 'wdk?action=ecw.page&method=display&site_id=hangzhou&inclient=&page_id=page_error&page_code=505';
								}
							}
						}
					};
					
					
					//设置超时定时器
					_tm = setTimeout(
										function(){
											if(null==_ontimeout||""==_ontimeout||"undefined"==_ontimeout||"function"!=typeof(_ontimeout)){
												$.cuajaxTimeout(_xmlhttp);
											}else{
												if (_xmlhttp){
													_xmlhttp.abort();
												}
												_ontimeout();
											}
										}
										,_timeout
									);
				    if (_method == "post") {
						//alert2(_url);alert2(_param);

						_xmlhttp.open (_method,_url,_async);
						_xmlhttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
						//_xmlhttp.setRequestHeader("Origin","http://www.yueyigou.com");
						//_xmlhttp.setRequestHeader("Content-Length", _param.length);
						_xmlhttp.send(_param);
					}
					else {
						//document.cookie="jwt=eyJhbGciOiJIUzI1NiJ9.eyJsb2dpbl9uYW1lIjoiNDQxMjAxMTExMDI0IiwiY3VzdF91dWlkIjoiMDAwMDAwMDAwMDAwMDAwMDAwMDA0NDEyMDExMTEwMjQiLCJtYW5hZ2VfdW5pdF91dWlkIjoiMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMzgiLCJleHAiOjE2NTE5MzY2MjIsImlhdCI6MTY1MTkyOTQyMn0.vB_kAcL8xcg-HNiHr1kImofBveCmW4MUknvEHsgJd54; wdk_user=%7B%22corp_uuid%22%3A%2200000000000000000000000011441201%22%2C%22county_uuid%22%3A%2200000000000000000000001044120104%22%2C%22cust_uuid%22%3A%2200000000000000000000441201111024%22%2C%22cust_name%22%3A%22%u7AEF%u5DDE%u533A%u5B87%u822A%u98DF%u54C1%u4FBF%u5229%u5E97%22%2C%22depart_uuid%22%3A%2200000000000000000001144120101119%22%2C%22manage_unit_uuid%22%3A%2200000000000000000000000000000038%22%2C%22reset_pwd_flag%22%3A%220%22%2C%22account_uuid%22%3A%2200000000000000000000441201111024%22%2C%22login_name%22%3A%22441201111024%22%2C%22user_type%22%3A%22CUSTOMER%22%2C%22user_type_infos%22%3A%22CUSTOMER%22%7D; _user=ndqXmJaXmteXmdi0; JSESSIONID=AFEED530DB9236989394454D4113DF8B; SERVERID=a8891b2e8a830244312aaecabc00b54a|1651932301|1651932289";
						_url += "&"+_param;
						_xmlhttp.open (_method,_url,_async);
						//_xmlhttp.setRequestHeader("Origin","http://www.yueyigou.com");

						_xmlhttp.send(null);
					}

			}else{

				if(null==_error||""==_error||"undefined"==_error||"function"!=typeof(_error)){
					//alert("error为空或不是函数");
				}else{
					error("提交的URL不能为空！");
				}
			}	
		}catch(e){
//			alert("ajax提交失败："+e);
			alert('信息提示：ajax提交失败：'+e.message,'error');
		}
	}
	//ajax超时处理		
	,cuajaxTimeout:function(xmlhttp){				
		if (xmlhttp){
			xmlhttp.abort();
//			alert('提交请求超时');
			alert('信息提示：ajax提交请求超时','error');
		}
	}
	,getURLParams: function(){
		var vars = [], hash;
		var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
		for(var i = 0; i < hashes.length; i++){
			hash = hashes[i].split('=');
			vars.push(hash[0]);
			vars[hash[0]] = hash[1];
		}
		var _urlid = vars['ipturlid'];
		if(null!=_urlid&&""!=_urlid){
			var pobj = $.getRoot()._INPUTPOP[_urlid];
			if(null!=pobj){
				for(var att in pobj){
					vars[att] = pobj[att];
				}
			}
		}
		return vars;
	}
	,getURLParam: function(name){
		return $.getURLParams()[name];
	}
	,getUUID:function(){
		//
		// Loose interpretation of the specification DCE 1.1: Remote Procedure Call
		// described at http://www.opengroup.org/onlinepubs/009629399/apdxa.htm#tagtcjh_37
		// since JavaScript doesn't allow access to internal systems, the last 48 bits 
		// of the node section is made up using a series of random numbers (6 octets long).
		//  
		var dg = new Date(1582, 10, 15, 0, 0, 0, 0);
		var dc = new Date();
		var t = dc.getTime() - dg.getTime();
		var h = '';
		var tl = UUID.getIntegerBits(t,0,31);
		var tm = UUID.getIntegerBits(t,32,47);
		var thv = UUID.getIntegerBits(t,48,59) + '1'; // version 1, security version is 2
		var csar = UUID.getIntegerBits(UUID.rand(4095),0,7);
		var csl = UUID.getIntegerBits(UUID.rand(4095),0,7);

		// since detection of anything about the machine/browser is far to buggy, 
		// include some more random numbers here
		// if NIC or an IP can be obtained reliably, that should be put in
		// here instead.
		var n = UUID.getIntegerBits(UUID.rand(8191),0,7) + 
				UUID.getIntegerBits(UUID.rand(8191),8,15) + 
				UUID.getIntegerBits(UUID.rand(8191),0,7) + 
				UUID.getIntegerBits(UUID.rand(8191),8,15) + 
				UUID.getIntegerBits(UUID.rand(8191),0,15); // this last number is two octets long
		return tl + h + tm + h + thv + h + csar + csl + h + n; 
	}
	,getEvent: function() {//ie/ff
        if (document.all) {
            return window.event;
        }
        func = getEvent.caller;
        while (func != null) {
            var arg0 = func.arguments[0];
            if (arg0) {
                if ((arg0.constructor == Event || arg0.constructor == MouseEvent) || (typeof (arg0) == "object" && arg0.preventDefault && arg0.stopPropagation)) {
                    return arg0;
                }
            }
            func = func.caller;
        }
        return null;
    },
    getMousePos: function(ev) {
        if (!ev) {
            ev = this.getEvent();
        }
        if (ev.pageX || ev.pageY) {
            return {
                x: ev.pageX,
                y: ev.pageY
            };
        }

        if (document.documentElement && document.documentElement.scrollTop) {
            return {
                x: ev.clientX + document.documentElement.scrollLeft - document.documentElement.clientLeft,
                y: ev.clientY + document.documentElement.scrollTop - document.documentElement.clientTop
            };
        }
        else if (document.body) {
            return {
                x: ev.clientX + document.body.scrollLeft - document.body.clientLeft,
                y: ev.clientY + document.body.scrollTop - document.body.clientTop
            };
        }
    },
    getElementPos: function(el) {
        el = this.getItself(el);
        var _x = 0, _y = 0;
        do {
            _x += el.offsetLeft;
            _y += el.offsetTop;
        } while (el = el.offsetParent);
        return { x: _x, y: _y };
    },
    getItself: function(id) {
        return "string" == typeof id ? document.getElementById(id) : id;
    },
    getViewportSize: { w: (window.innerWidth) ? window.innerWidth : (document.documentElement && document.documentElement.clientWidth) ? document.documentElement.clientWidth : (document.body?document.body.offsetWidth:0), h: (window.innerHeight) ? window.innerHeight : (document.documentElement && document.documentElement.clientHeight) ? document.documentElement.clientHeight : (document.body ? document.body.offsetHeight : 0) },
    isIE: document.all ? true : false,
    setOuterHtml: function(obj, html) {
        var Objrange = document.createRange();
        obj.innerHTML = html;
        Objrange.selectNodeContents(obj);
        var frag = Objrange.extractContents();
        obj.parentNode.insertBefore(frag, obj);
        obj.parentNode.removeChild(obj);
    },
    firstChild: function(parentObj, tagName) {
        if ($.isIE) {
            return parentObj.firstChild;
        }
        else {
            var arr = parentObj.getElementsByTagName(tagName);
            return arr[0];
        }
    },
    lastChild: function(parentObj, tagName) {
        if ($.isIE) {
            return parentObj.lastChild;
        }
        else {
            var arr = parentObj.getElementsByTagName(tagName);
            return arr[arr.length - 1];
        }
    },
    setCookie: function(name, value,time) {
        //document.cookie = name + "=" + value;
    	 var exp = new Date(); 
    	if(time){
    		 exp.setTime(exp.getTime() + time*24*60*60*1000);//根据传入的参数进行匹配 
    	}else{
    		exp.setTime(exp.getTime() + 60 * 2000);
    	}
        document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();  
    },
    getCookie: function(name) {
        var strCookie = document.cookie;
        var arrCookie = strCookie.split("; ");
        for (var i = 0; i < arrCookie.length; i++) {
            var arr = arrCookie[i].split("=");
            if (!arr[1]) {
                return "";
            }
            if (arr[0] == name) {
                return arr[1];
            }
        }
        return "";
    },
    delCookie: function(name) {
        var exp = new Date();
        exp.setTime(exp.getTime() - 1);
        var cval = this.getCookie(name);
        if (cval != null) document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
    },
    combobox:function(jparam) {
		//属性
		var _id = jparam.id?jparam.id:'';
		var _initvalue = jparam.initvalue?jparam.initvalue:'';
		var _url = jparam.url?jparam.url:'';
		var _queryParams = jparam.queryParams?jparam.queryParams:{};
		var _disabled = jparam.disabled?jparam.disabled:false;
		var _data = jparam.data?jparam.data:[];
		var _val=jparam.idField?jparam.idField:"id";
		var _text=jparam.textFiled?jparam.textFiled:"text";
		var _placeholder = jparam.placeholder?jparam.placeholder:'';
		var _showClear = jparam.showClear?jparam.showClear:false;//是否显示删除小图标
		var _style = jparam.style?jparam.style:'';//自定义样式
		var _initOption = jparam.initOption?jparam.initOption:null;	//初始化默认选项
		var _asyn = (true==jparam.asyn)?jparam.asyn:false;								//是否异步加载
		var _defaultOption = jparam.defaultOption?jparam.defaultOption:'';//初始化默认选项
		var _wrapParent = jparam.wrapParent ? jparam.wrapParent : 'body';
		var _init = $('#'+_id).attr('data-notInit') ? false : true;
		//从后台拿到的字段类型 Array 按后台提供的字段数据
		var _dataStr=jparam.dataStr?jparam.dataStr:"area_name,area_uuid,sys_code";
		
		//事件
		//var _formatState = jparam.formatState?$.event_getHandler(jparam.formatState):function(state){ return state.text;};
		//var _onLoad = jparam.onLoad?$.event_getHandler(jparam.onLoad):function(){};
		//var _onLoadSuccess = jparam.onLoadSuccess?$.event_getHandler(jparam.onLoadSuccess):function(){};
		var _onChange = jparam.onChange?jparam.onChange:function(){};
		//var _select = jparam.select?$.event_getHandler(jparam.select):function(){};
		//var _unSelect = jparam.unSelect?$.event_getHandler(jparam.unSelect):function(){};

		var _container,
			_select,
			_combobox_select_list;
		
		if (_init) {

			_container = $('#' + _id).parent().attr('id', 'combobox_' + _id);
			_container.append('<strong class="combobox_select_text ellipsis"></strong><i class="dropdown_ico" style="background-image: url(wdk?action=wdk.pub&method=attachment_download&fileid=ecw_icon_icon_cq)"></i>');
			_select = $('<select class="combobox_select"></select>');
			_combobox_select_list = $('<ul class="combobox_select_list" id="combobox_select_list_'+ _id +'"></ul>');
			_container.append(_select);
			$(_wrapParent).append(_combobox_select_list);
			$('#'+_id).attr('data-notInit', true);
		} else {
			_container = $('#combobox_' + _id);
			_select = _container.find('.combobox_select');
			_combobox_select_list = $('#combobox_select_list_' + _id);
		}
		

		// 初始化渲染
		if (_url) {
			$.cuajax({
			  	url: _url,
				method: "post", 
				timeout: WDK_Timeout,
				data: _queryParams,   
				success: function(result) {
						var jres = $.str2json(result);
						if (jres.code) {
							if (_init) {
								bindHandlers();
							}
							reader(jres.resultset);
						} else {
							if (_init) {
								bindHandlers();
							}
							reader(jres);
						}
					
				},
				error:function(result){
					alert('网络错误！result='+result);
				}
			});
		} else {
			if (_init) {
				bindHandlers();
			}
			reader(_data);
		}
		
		function bindHandlers() {
			// 选择框添加change事件：
			_container.find('.combobox_select').on('change', function() {
				var _val = $(this).val();
				var _text = $(this).find("option:selected").length > 0 ? $(this).find("option:selected").text() : _defaultOption;
				var _data_id=$(this).attr("data-uuid");
                var _id = $(this).siblings('.from').attr('id');
                
                $(this).closest('.combobox').find('.combobox_select_text').text(_text);
				//$(this).closest('.combobox').find('.combobox_select_text').attr("data-uuid",_data_uuid)
				$('#'+_id).val(_val);
				
				if (_val == _defaultOption) {
					$('#combobox_select_list_' + _id).find('li').eq(0).addClass('active').siblings().removeClass('active');
					
				} else {
					$('#combobox_select_list_' + _id).find('li[data-value="'+ _val +'"]').addClass('active').siblings().removeClass('active');
				}

				
				_onChange && _onChange.call(this, _data_id);

				
			});

			// 选择框绑定点击事件：
            _container.on('click', item_click_handle);
            //下拉框绑定点击事件：
            _combobox_select_list.on('click', list_click_handle);
            function item_click_handle(e) {
                var _id = $(this).attr('id').substring(9);
                if (!$(this).attr('disabled')) {
                    $('.combobox_select_list').not('#combobox_select_list_' + _id).css('display', 'none');
                    $('#combobox_select_list_' + _id).toggle();
                    
                    $('#combobox_select_list_' + _id).css({
        				'left': _container.offset().left,
        				'top': _container.offset().top + _container.outerHeight() - 1
        			});
                }
                e.stopPropagation();
            }
            function list_click_handle(e) {
            	var _data_id="";
                var _target = e.target;
                var _val = '';
                var _text = '';
                var _id = $(this).attr('id').substring(21);
                if (_target.tagName == 'A') {
                	if (!$(_target).closest('li').hasClass('active')) {
                		_data_id=$(_target).closest('li').attr('data-uuid')
						_val = $(_target).closest('li').attr('data-value');
                    	_text = $(_target).text();
                    	$('#combobox_' + _id).find('.combobox_select').attr("data-uuid",_data_id);
                    	$('#combobox_' + _id).find('.combobox_select').val(_val).trigger('change');
                	} 

                }
            }
		}
		
		function reader(_data){
			//写得太死 TODO
			if(!_data){
				return;
			}
			var fieldArray=_dataStr.split(",");
			var field0=fieldArray[0]?fieldArray[0]:null;
			var field1=fieldArray[1]?fieldArray[1]:null;
			var field2=fieldArray[2]?fieldArray[2]:null;
			var optStr = '';
			var listStr = '';
			if (_defaultOption) {
				optStr += '<option value="'+ _defaultOption +'">'+ _defaultOption +'</option>';
				listStr += '<li><a href="javascript:;">'+ _defaultOption +'</a></li>';
			}
	
			for(var i = 0; i < _data.length; i++) {
				var da = _data[i];
				optStr += '<option value="'+ da[field0] +'" data-uuid="'+ da[field2] +'">'+ da[field0] +'</option>';
				listStr += '<li data-uuid="'+ da[field2] +'" data-value="'+ da[field0] +'"><a href="javascript:;">'+ da[field0] +'</a></li>';
				
				if(_disabled){
					_container.attr('disabled', true);
				}
			}
			_select.html(optStr);
			_combobox_select_list.html(listStr);
			
			var _max_height = $(window).height() - _container.offset().top - 100;
			if (_max_height < 228) {
				_max_height = 228;
			}
			_combobox_select_list.css({
				'width': _container.outerWidth() - 2,
				'left': _container.offset().left,
				'top': _container.offset().top + _container.outerHeight() - 1,
				'display': 'none',
				'max-height': _max_height
			});
			
			if(_init && _initvalue.length > 0){
				var values  = _initvalue.split(",");
				for(var i = 0;i < values.length; i++) {
					_container.find('.combobox_select').val(values[i]).trigger('change');
				}
			} else {
				if (_defaultOption) {
                    $('#combobox_' + _id).find('.combobox_select').val('').trigger('change');
				}
			}
			
			
		}
	},
	combobox1: function(jparam) {
		//属性
		var _id = jparam.id?jparam.id:'';
		var _initvalue = jparam.initvalue?jparam.initvalue:'';
		var _url = jparam.url?jparam.url:'';
		var _queryParams = jparam.queryParams?jparam.queryParams:{};
		var _disabled = jparam.disabled?jparam.disabled:false;
		var _data = jparam.data?jparam.data:[];
		var _val=jparam.idField?jparam.idField:"id";
		var _text=jparam.textFiled?jparam.textFiled:"text";
		var _placeholder = jparam.placeholder?jparam.placeholder:'';
		var _showClear = jparam.showClear?jparam.showClear:false;//是否显示删除小图标
		var _style = jparam.style?jparam.style:'';//自定义样式
		var _initOption = jparam.initOption?jparam.initOption:null;	//初始化默认选项
		var _asyn = (true==jparam.asyn)?jparam.asyn:false;								//是否异步加载
		var _defaultOption = jparam.defaultOption?jparam.defaultOption:'';//初始化默认选项
		var _wrapParent = jparam.wrapParent ? jparam.wrapParent : 'body';
		var _init = $('#'+_id).attr('data-notInit') ? false : true;
		//从后台拿到的字段类型 Array 按后台提供的字段数据
		var _dataStr=jparam.dataStr?jparam.dataStr:"area_name,area_uuid,sys_code";
		var _successFieldName=jparam.successFieldName?jparam.successFieldName:'resultset';
		var _childFieldName=jparam.childFieldName?jparam.childFieldName:'';
		var _canType = jparam.canType ? jparam.canType : false;
		
		//事件
		//var _formatState = jparam.formatState?$.event_getHandler(jparam.formatState):function(state){ return state.text;};
		//var _onLoad = jparam.onLoad?$.event_getHandler(jparam.onLoad):function(){};
		//var _onLoadSuccess = jparam.onLoadSuccess?$.event_getHandler(jparam.onLoadSuccess):function(){};
		var _onChange = jparam.onChange?jparam.onChange:function(){};
		//var _select = jparam.select?$.event_getHandler(jparam.select):function(){};
		//var _unSelect = jparam.unSelect?$.event_getHandler(jparam.unSelect):function(){};

		var _container,
			_select,
			_combobox_select_list;
		
		if (_init) {
			_container = $('#' + _id).parent().attr('id', 'combobox_' + _id);
			if (_canType) {
				_container.append('<input id="combobox_select_text_'+ _id +'" class="combobox_select_text" style="border:0;padding:0;height:100%;width:90%;"><i class="dropdown_ico" style="background-image: url(wdk?action=wdk.pub&method=attachment_download&fileid=ecw_icon_icon)"></i>');
			} else {
				_container.append('<strong class="combobox_select_text ellipsis"></strong><i class="dropdown_ico" style="background-image: url(wdk?action=wdk.pub&method=attachment_download&fileid=ecw_icon_icon)"></i>');
			}
			
			_select = $('<select class="combobox_select"></select>');
			_combobox_select_list = $('<ul class="combobox_select_list" id="combobox_select_list_'+ _id +'"></ul>');
			_container.append(_select);
			$(_wrapParent).append(_combobox_select_list);
			$('#'+_id).attr('data-notInit', true);
			//$('#'+_id).remove();
		} else {
			_container = $('#combobox_' + _id);
			_select = _container.find('.combobox_select');
			_combobox_select_list = $('#combobox_select_list_' + _id);
		}
		

		// 初始化渲染
		if (_url) {
			$.cuajax({
			  	url: _url,
				method: "post", 
				timeout: WDK_Timeout,
				data: _queryParams,   
				success: function(result) {
						var jres = $.str2json(result);
						var data = jres[_successFieldName];
						if (jres.code === '1') {
							if (_init) {
								bindHandlers();
							}
							reader(data);
						} else {
							if (_init) {
								bindHandlers();
							}
							reader(jres);
						}
					
				},
				error:function(result){
					alert('网络错误！result='+result);
				}
			});
		} else {
			if (_init) {
				bindHandlers();
			}
			reader(_data);
		}
		
		function bindHandlers() {
			// 选择框添加change事件：
			_container.find('.combobox_select').on('change', function() {
				var _val = $(this).val();
				
				var _text = $(this).find("option:selected").length > 0 ? $(this).find("option:selected").text() : _defaultOption;
				
                var _id = $(this).closest('.combobox').attr('id').substring(9);
                
                if (_canType) {
                	$(this).closest('.combobox').find('.combobox_select_text').val(_text);
                } else {
                	$(this).closest('.combobox').find('.combobox_select_text').text(_text);
                }
				
				//$(this).closest('.combobox').find('.combobox_select_text').attr("id",_val)
				$('#'+_id).val(_val);
				
				if (_val == _defaultOption) {
	                $('#combobox_select_list_' + _id).find('li').eq(0).addClass('active').siblings().removeClass('active');
	                
	            } else {
	                $('#combobox_select_list_' + _id).find('li').removeClass('active');
	                $('#combobox_select_list_' + _id).find('li[data-value="'+ _val +'"]').addClass('active');
	            }
				
				
				_onChange && _onChange.call(this, _val);
				
			});
			
			if (_canType) {
				_container.find('.combobox_select_text').on('input', function() {
					$('.combobox_select_list').css('display', 'none');
					var _id = $(this).closest('.combobox').attr('id').substring(9);
					$('#'+_id).val('');
					$(this).siblings('.combobox_select').val('');
					$('#combobox_select_list_' + _id).find('li').removeClass('active');
				});
			}

			// 选择框绑定点击事件：
            _container.on('click', item_click_handle);
            //下拉框绑定点击事件：
            _combobox_select_list.on('click', list_click_handle);
            function item_click_handle(e) {
                var _id = $(this).attr('id').substring(9);
                if (!$(this).attr('disabled')) {
                    $('.combobox_select_list').not('#combobox_select_list_' + _id).css('display', 'none');
                    $('#combobox_select_list_' + _id).toggle();
                    
                    $('#combobox_select_list_' + _id).css({
        				'left': _container.offset().left,
        				'top': _container.offset().top + _container.outerHeight() - 1
        			});
                }
                e.stopPropagation();
            }
            function list_click_handle(e) {
                var _target = e.target;
                var _val = '';
                var _text = '';
                var _id = $(this).attr('id').substring(21);
                if (_target.tagName == 'A') {
                	if (!$(_target).closest('li').hasClass('active')) {
						_val = $(_target).closest('li').attr('data-value');
                    	_text = $(_target).text();
                    
                    	$('#combobox_' + _id).find('.combobox_select').val(_val).trigger('change');
                	} 

                }
            }
		}
		
		function reader(_data){
			//写得太死 TODO
			if(!_data){
				return;
			}
			var fieldArray=_dataStr.split(",");
			var field0=fieldArray[0]?fieldArray[0]:null;
			var field1=fieldArray[1]?fieldArray[1]:null;
			var field2=fieldArray[2]?fieldArray[2]:null;
			var optStr = '';
			var listStr = '';
			if (_defaultOption) {
				optStr += '<option value="'+ _defaultOption +'">'+ _defaultOption +'</option>';
				listStr += '<li><a href="javascript:;">'+ _defaultOption +'</a></li>';
			}
	
			for(var i = 0; i < _data.length; i++) {
				var da = _data[i];
				
				if(i === 0 && !_defaultOption) {
					optStr += '<option selected="selected" value="'+ da[field1] +'" data-uuid="'+ da[field2] +'">'+ da[field0] +'</option>';
				} else {
					optStr += '<option value="'+ da[field1] +'" data-uuid="'+ da[field2] +'">'+ da[field0] +'</option>';
				}
				
				listStr += '<li data-uuid="'+ da[field2] +'" data-value="'+ da[field1] +'"><a href="javascript:;">'+ da[field0] +'</a>';
				
				if (_childFieldName) {
					var child = da[_childFieldName];
					if (child.length) {
						listStr += '<ul>';
						for(var j = 0; j < child.length; j++) {
							var ch = child[j];
							optStr += '<option value="'+ ch[field1] +'" data-uuid="'+ ch[field2] +'">'+ ch[field0] +'</option>';
						
							listStr += '<li data-uuid="'+ ch[field2] +'" data-value="'+ ch[field1] +'"><a href="javascript:;">'+ ch[field0] +'</a></li>';
						}
						listStr += '</ul>';
					}
					
				}
				listStr += '</li>';
				if(_disabled){
					_container.attr('disabled', true);
				}
			}
			_select.html(optStr);
			_combobox_select_list.html(listStr);
			
			var _max_height = $(window).height() - _container.offset().top - 100;
			if (_max_height < 228) {
				_max_height = 228;
			}
			_combobox_select_list.css({
				'width': _container.outerWidth() - 2,
				'left': _container.offset().left,
				'top': _container.offset().top + _container.outerHeight() - 1,
				'display': 'none',
				'max-height': _max_height
			});
			
			if(_init && _initvalue.length > 0){
				var values  = _initvalue.split(",");
				for(var i = 0;i < values.length; i++) {
					_container.find('.combobox_select').val(values[i]).trigger('change');
				}
			} else {
				if (_defaultOption) {
                    $('#combobox_' + _id).find('.combobox_select').val('').trigger('change');
				} else {
					$('#combobox_' + _id).find('.combobox_select').trigger('change');
				}
			}
			
			
		}
	},
	addLog: function(func, msg) {
		$.cuajax({
			url: 'http://www.yueyigou.com/wdk?action=ecw.page&method=actionLog&t=' + new Date().getTime(),
			method: 'post',
			data:{
				func: func,
				msg: msg
			},
			success: function(user_infos) {
			},
			error: function(result){
				// alert('网络错误！result='+result);
			}
		});
	}
});









/***********************************************************/
/****													****/
/****					UUID							****/
/****													****/
/****													****/
/***********************************************************/
//获取唯一UUID

function UUID(){
	this.id = this.createUUID();
}

// When asked what this Object is, lie and return it's value
UUID.prototype.valueOf = function(){ return this.id; };
UUID.prototype.toString = function(){ return this.id; };

//
// INSTANCE SPECIFIC METHODS
//

UUID.prototype.createUUID = function(){
	//
	// Loose interpretation of the specification DCE 1.1: Remote Procedure Call
	// described at http://www.opengroup.org/onlinepubs/009629399/apdxa.htm#tagtcjh_37
	// since JavaScript doesn't allow access to internal systems, the last 48 bits 
	// of the node section is made up using a series of random numbers (6 octets long).
	//  
	var dg = new Date(1582, 10, 15, 0, 0, 0, 0);
	var dc = new Date();
	var t = dc.getTime() - dg.getTime();
	var h = '';
	var tl = UUID.getIntegerBits(t,0,31);
	var tm = UUID.getIntegerBits(t,32,47);
	var thv = UUID.getIntegerBits(t,48,59) + '1'; // version 1, security version is 2
	var csar = UUID.getIntegerBits(UUID.rand(4095),0,7);
	var csl = UUID.getIntegerBits(UUID.rand(4095),0,7);

	// since detection of anything about the machine/browser is far to buggy, 
	// include some more random numbers here
	// if NIC or an IP can be obtained reliably, that should be put in
	// here instead.
	var n = UUID.getIntegerBits(UUID.rand(8191),0,7) + 
			UUID.getIntegerBits(UUID.rand(8191),8,15) + 
			UUID.getIntegerBits(UUID.rand(8191),0,7) + 
			UUID.getIntegerBits(UUID.rand(8191),8,15) + 
			UUID.getIntegerBits(UUID.rand(8191),0,15); // this last number is two octets long
	return tl + h + tm + h + thv + h + csar + csl + h + n; 
};


//
// GENERAL METHODS (Not instance specific)
//


// Pull out only certain bits from a very large integer, used to get the time
// code information for the first part of a UUID. Will return zero's if there 
// aren't enough bits to shift where it needs to.
UUID.getIntegerBits = function(val,start,end){
	var base16 = UUID.returnBase(val,16);
	var quadArray = new Array();
	var quadString = '';
	var i = 0;
	for(i=0;i<base16.length;i++){
		quadArray.push(base16.substring(i,i+1));	
	}
	for(i=Math.floor(start/4);i<=Math.floor(end/4);i++){
		if(!quadArray[i] || quadArray[i] == '') quadString += '0';
		else quadString += quadArray[i];
	}
	return quadString;
};

// Numeric Base Conversion algorithm from irt.org
// In base 16: 0=0, 5=5, 10=A, 15=F
UUID.returnBase = function(number, base){
	//
	// Copyright 1996-2006 irt.org, All Rights Reserved.	
	//
	// Downloaded from: http://www.irt.org/script/146.htm	
	// modified to work in this class by Erik Giberti
	var convert = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
    if (number < base) var output = convert[number];
    else {
        var MSD = '' + Math.floor(number / base);
        var LSD = number - MSD*base;
        if (MSD >= base) var output = this.returnBase(MSD,base) + convert[LSD];
        else var output = convert[MSD] + convert[LSD];
    }
    return output;
};

// pick a random number within a range of numbers
// int b rand(int a); where 0 <= b <= a
UUID.rand = function(max){
	return Math.floor(Math.random() * max);
};




/***********************************************************/
/****													****/
/****					cookie							****/
/****													****/
/****													****/
/***********************************************************/

var Cookies = {};
/* 设置Cookies  */
Cookies.set = function(name, value)
{
    if ((typeof (name) != "undefined") && (name != null) && (name != ""))
    {
        var argv = arguments;
        var argc = arguments.length;
        var expires = (argc > 2) ? argv[2] : null;
        var path = (argc > 3) ? argv[3] : '/';
        var domain = (argc > 4) ? argv[4] : null;
        var secure = (argc > 5) ? argv[5] : false;
        document.cookie = name + "=" + escape(value) +
               ((expires == null) ? "" : ("; expires=" + expires.toGMTString())) +
               ((path == null) ? "" : ("; path=" + path)) +
               ((domain == null) ? "" : ("; domain=" + domain)) +
               ((secure == true) ? "; secure" : "");
    }
};
/* 读取Cookies  */
Cookies.get = function(name)
{
    var arrCookie = document.cookie.split(";");
    for (var i = 0; i < arrCookie.length; i++)
    {
        var eachCookie = arrCookie[i].split("=");
        //表达式/^\s*|\s*$/ 表示前导空格和后导空格
        if (name == eachCookie[0].replace(/^\s*|\s*$/, ""))
        {
            return unescape(eachCookie[1]);
        }
    }
    //没有找到相应的cookie时
    return null;
};
/*清除Cookies*/
Cookies.clear = function(name)
{
    if (Cookies.get(name))
    {
        var expdate = new Date();
        expdate.setTime(expdate.getTime() - (1 * 24 * 60 * 60 * 1000));
        Cookies.set(name, "", expdate);
    }
};

/***********************************************************/
/****													****/
/****					BASE64							****/
/****													****/
/****													****/
/***********************************************************/


Base64 = {

		Base64Chars1:
			    "ABCDEFGHIJKLMNOP" +
			    "QRSTUVWXYZabcdef" +
			    "ghijklmnopqrstuv" +
			    "wxyz0123456789*-|",
			    //"wxyz0123456789@*" +
			    //"-",
			    Base64Chars:"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/-",
			    Base64Chars2:"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=",
		/**
		 * Encode a string to a Base64 string follow Bse64 regular.
		 * @param s, a normal string
		 * @return a Base64 string
		 */
		encode: function(s){
		    if(!s || s.length == 0) return s;

		    var d = "";
		    var b = this.ucs2_utf8(s);
		    var b0, b1, b2, b3;
		    var len = b.length;
		    var i = 0;
		    while(i < len){
		       var tmp = b[i++];
		       b0 = (tmp & 0xfc) >> 2;
		       b1 = (tmp & 0x03) << 4;
		       if(i < len){
		          tmp = b[i++];
		          b1 |= (tmp & 0xf0) >> 4;
		          b2 = (tmp & 0x0f) << 2;
		          if(i< len){
		             tmp = b[i++];
		             b2 |= (tmp & 0xc0) >> 6;
		             b3 = tmp & 0x3f;
		          }else{
		             b3 = 64; // 1 byte "-" is supplement

		          }
		       }else{
		          b2 = b3 = 64; // 2 bytes "-" are supplement

		       }

		       d+=this.Base64Chars.charAt(b0);
		       d+=this.Base64Chars.charAt(b1);
		       d+=this.Base64Chars.charAt(b2);
		       d+=this.Base64Chars.charAt(b3);
		    }

		    return d;
		    
		},
		encode2: function(s){
		    if(!s || s.length == 0) return s;

		    var d = "";
		    var b = this.ucs2_utf8(s);
		    var b0, b1, b2, b3;
		    var len = b.length;
		    var i = 0;
		    while(i < len){
		       var tmp = b[i++];
		       b0 = (tmp & 0xfc) >> 2;
		       b1 = (tmp & 0x03) << 4;
		       if(i < len){
		          tmp = b[i++];
		          b1 |= (tmp & 0xf0) >> 4;
		          b2 = (tmp & 0x0f) << 2;
		          if(i< len){
		             tmp = b[i++];
		             b2 |= (tmp & 0xc0) >> 6;
		             b3 = tmp & 0x3f;
		          }else{
		             b3 = 64; // 1 byte "-" is supplement

		          }
		       }else{
		          b2 = b3 = 64; // 2 bytes "-" are supplement

		       }

		       d+=this.Base64Chars2.charAt(b0);
		       d+=this.Base64Chars2.charAt(b1);
		       d+=this.Base64Chars2.charAt(b2);
		       d+=this.Base64Chars2.charAt(b3);
		    }

		    return d;
		    
		},
		/**
		 * Decode a Base64 string to a string follow Base64 regular.
		 * @param s, a Base64 string
		 * @return a normal string
		 */
		decode: function(s){
		    if(!s) return null;
		    var len = s.length;
		    if(len%4 != 0){
		       throw s+" is not a valid Base64 string.";
		    }

		    var b = new Array();
		    var i=0, j=0, e=0, c, tmp;
		    while(i < len){
		       c = this.Base64Chars.indexOf(s.charAt(i++));
		       tmp = c << 18;
		       c = this.Base64Chars.indexOf(s.charAt(i++));
		       tmp |= c << 12;
		       c = this.Base64Chars.indexOf(s.charAt(i++));
		       if(c < 64){
		          tmp |= c << 6;
		          c = this.Base64Chars.indexOf(s.charAt(i++));
		          if(c < 64){
		             tmp |= c;
		          }else{
		             e = 1;
		          }
		       }else{
		          e = 2;
		          i++;
		       }

		       b[j+2] = tmp & 0xff;
		       tmp >>= 8;
		       b[j+1] = tmp & 0xff;
		       tmp >>= 8;
		       b[j+0] = tmp & 0xff;
		       j += 3;
		       
		    }
		    
		    b.splice(b.length-e, e);

		    return this.utf8_ucs2(b);
		    
		},
		/** 
		 * Encodes a ucs2 string to a utf8 integer array. 
		 * @param s, a string
		 * @return an integer array
		 */
		ucs2_utf8: function(s){
		    if (!s) return null;
		    var d = new Array();
		    if (s == "") return d;

		    var c = 0, i = 0, j = 0;
		    var len = s.length;
		    while(i < len){
		       c = s.charCodeAt(i++);
		       if(c <= 0x7f){
		          // 1 byte

		          d[j++] = c;
		       }else
		       if((c >= 0x80) && (c <= 0x7ff)){
		          // 2 bytes

		          d[j++] = ((c >> 6) & 0x1f) | 0xc0;
		          d[j++] = (c & 0x3f) | 0x80;
		       }else{
		          // 3 bytes

		          d[j++] = (c >> 12) | 0xe0;
		          d[j++] = ((c >> 6) & 0x3f) | 0x80;
		          d[j++] = (c & 0x3f) | 0x80;
		       }
		    }
		    
		    return d;
		},
		/** 
		 * Encodes a utf8 integer array to a ucs2 string.
		 * @param s, an integer array
		 * @return a string
		 */
		utf8_ucs2: function(s){
		    if(!s) return null;
		    var len = s.length;
		    if(len == 0) return "";

		    var d = "";
		    var c = 0, i = 0, tmp = 0;
		    while(i < len){
		       c = s[i++];
		       if((c & 0xe0) == 0xe0){
		          // 3 bytes

		          tmp = (c & 0x0f) << 12;
		          c = s[i++];
		          tmp |= ((c & 0x3f) << 6);
		          c = s[i++];
		          tmp |= (c & 0x3f);
		       }else
		       if((c & 0xc0) == 0xc0){
		          // 2 bytes

		          tmp = (c & 0x1f) << 6;
		          c = s[i++];
		          tmp |= (c & 0x3f);
		       }else{
		          // 1 byte

		          tmp = c;
		       }
		       
		       d += String.fromCharCode(tmp);
		    }
		    
		    return d;
		}
		
};


var _PUB_imgerror_exist;
var _SITE_ID;
var _INCLIENT = '';
var _USER_TYPE = '';

$(function() {
    _INCLIENT = $.getURLParam('inclient') || '';
	$('body').on('error_evt', function(e, parentElement) {
		if (typeof _PUB_imgerror_exist === 'undefined') {
			$('<img>').attr('src', 'wdk?action=wdk.pub&method=attachment_download&fileid=img_error').on({
				'load': function() {
					_PUB_imgerror_exist = true;
					
					$(parentElement).find('img').off().on('error', function() {
						$(this).attr('src', 'wdk?action=wdk.pub&method=attachment_download&fileid=img_error');
					});
				},
				'error': function() {
					_PUB_imgerror_exist = false;
				}
			});
			
		} else if (_PUB_imgerror_exist) {
			$(parentElement).find('img').off().on('error', function() {
				$(this).attr('src', 'wdk?action=wdk.pub&method=attachment_download&fileid=img_error');
			});
		}
	});
});

$.extend({
	getClientInfo:function(callback){
		// 获取终端信息（包括IP，浏览器信息）
        $.cuajax({
            url: _ECW_URL2,
            data: {
            },
            success: function (result) {
                var jres = $.str2json(result);
				var ip = '';
                if (jres.code == '1') {
                    ip = jres.result || '';
                }

                callback && callback({
                    ip: ip
                    ,userAgent:navigator.userAgent
                });
            },
            error: function (result) {
                callback && callback({
                    ip: ''
                    ,userAgent:navigator.userAgent
                });
            }
        })
	},
	getPubPara: function(para_code, callback) {
		// 获取投诉电话、客服热线
		$.cuajax({
	        url: _PUB_URL2,
	        data: {
	            _SRVNAME: 'service.ecw.pub.ecwpara',
	            _SRVMETHOD: 'getPara',
	            _DATA: $.json2str({
	            	manage_unit_uuid: $.getLoginUser().manage_unit_uuid,
	            	para_code: para_code
	            })
	        },
	        success: function (result) {
	            var jres = $.str2json(result);
	            
	            if (jres.code == '1') {
	            	callback && callback(jres.para_info);
	            } else {
	            	alert(jres.desc);
	            }
	        },
	        error: function (result) {
	            alert('网络错误！result=' + result);
	        }
	    })
	},
	getColumnSetup:function(app_code, module_code, callback) {
		// 按应用模块取管理单元栏目配置
		$.cuajax({
	        url: _PUB_URL2,
	        data: {
	            _SRVNAME: 'service.ecw.cms.setup',
	            _SRVMETHOD: 'getColumnSetup',
	            _DATA: $.json2str({
	            	manage_unit_uuid: $.getLoginUser().manage_unit_uuid,
	            	app_code: app_code,
	            	module_code: module_code
	            })
	        },
	        success: function (result) {
	            var jres = $.str2json(result);
	            
	            if (jres.code == '1') {
	            	callback && callback(jres.column_infos, jres.module_info);
	            } else {
	            	alert(jres.desc);
	            }
	        },
	        error: function (result) {
	            alert('网络错误！result=' + result);
	        }
	    })
	},
	//由系统调用，再页面组件加载之前调用
	page_init_before:function(page_id){
	}
	//由系统调用，再页面组件加载之后调用
	,page_init_after:function(page_id){
		var _column_uuid = '';
		// 获取栏目配置信息
		if (page_id == "page_ntmbuyer_index") {	// 非烟商城
			$.getColumnSetup('NTM', 'NTM_INDEX_TCGG', function(column_infos) {
				openPopnotice(column_infos, module_info);
			});
		} else if(page_id == "page_index") {	// 卷烟商城
			$.getColumnSetup('ECW', 'ECW_INDEX_TCGG', function(column_infos) {
				openPopnotice(column_infos, function() {
					// 确保个人中心弹窗在最上面
					$.getColumnSetup('ECW', 'ECW_INDEX_GRXXBHZC', function (column_infos) {
						openPopnoticePip(column_infos);
					});
				});
			});
		}
		
		function openPopnotice (column_infos, callback) {
			var column = column_infos[0] || {};
			var _sessionuser = $.getLoginUser();
			if (!column.column_uuid) {
				return;
			}
		    $.cuajax({
		        url: _PUB_URL2,
		        data: {
		            _SRVNAME: 'service.ecw.cms.main',
		            _SRVMETHOD: 'queryUnReadPopupList',
		            _DATA: $.json2str({
		            	user_info: {
		            		account_id: _sessionuser.account_uuid,
		            		personuuid: _sessionuser.cust_uuid,
		            		manageunituuid: _sessionuser.manage_unit_uuid
						},
		            	column_uuid: column.column_uuid,
		            	search_fields: {
							title: '',
							show_time_start: '',
							show_time_end: ''
						},
		            	result_fields: '',
		            	order_fields: ''
		            })
		        },
		        success: function (result) {
		            var jres = $.str2json(result);
		            var jrows = jres.result;
		            
		            if (jres.code == '1' && jrows.length != 0) {
		            	var _width = $(window).width();
		            	var _height = $(window).height();
		            	_height = _height > 520 ? 520 : _height;
		            	_width = _width > 700 ? 700 : _width;
		            	$.dialog_open({
		        			page: 'page_popnotice',
		              		width: _width + 'px',
		              		height: _height + 'px',
		              		closeBtn: 0,
		              		title: ['', 'overflow:visible'],
		              		page_param: 'column_uuid=' + column.column_uuid
		        		});
		            }

								callback && callback();
		        },
		        error: function (result) {
							callback && callback();
		            alert('网络错误！result=' + result);
		        }
		    })
		}

		function openPopnoticePip(column_infos) {
			var column = column_infos[0] || {};
			var _sessionuser = $.getLoginUser();
			if (!column.column_uuid) {
				return;
			}
			$.cuajax({
				url: _PUB_URL2,
				data: {
					_SRVNAME: 'service.ecw.cms.main',
					_SRVMETHOD: 'pageQueryPublishedList',
					_DATA: $.json2str({
						user_info: {
							account_id: _sessionuser.account_uuid,
							personuuid: _sessionuser.cust_uuid,
							manageunituuid: _sessionuser.manage_unit_uuid
						},
						column_uuid: column.column_uuid,
						search_fields: {
							title: '',
							show_time_start: '',
							show_time_end: ''
						},
						result_fields: '',
						order_fields: ''
					}),
					rows: '1',
					page: '1'
				},
				success: function (result) {
					var jres = $.str2json(result);
					var jrows = jres.result.rows;

					if (jres.code == '1' && jrows.length != 0) {
						var jrow = jrows[0] || {};
						if (jrow.is_read == '1') {
							return;
						}
						var _width = $(window).width();
						var _height = $(window).height();
						_height = _height > 520 ? 520 : _height;
						_width = _width > 900 ? 900 : _width;
						$.dialog_open({
							page: 'page_popnoticepip',
							width: _width + 'px',
							height: _height + 'px',
							closeBtn: 0,
							title: ['', 'overflow:visible'],
							page_param: 'column_uuid=' + column.column_uuid
						});
					}
				},
				error: function (result) {
					alert('网络错误！result=' + result);
				}
			})
		}
		
	}
	,setLoginUser:function(juser){
        sessionStorage.setItem("wdk_user", $.json2str(juser));
	}
    ,setHttpOnly:function(flag){
        // Cookies.set('HttpOnly',flag);
    }
	,clearCookies: function() {
        sessionStorage.removeItem("wdk_user");
	}
	//获取sessionuser对象
	,getLoginUser:function(){
        var juser = sessionStorage.getItem("wdk_user");
        if(juser){
        	return $.str2json(juser);
		}else{
            if($.is_in_client()){
                $.cuajax({
                    url: 'http://www.yueyigou.com/wdk?action=ecw.page&method=getUser',
					type:'GET',
                    async:false,
                    data:{

                    },
                    success: function (result) {
                        var jres = $.str2json(result);
                        if(jres.code=='1'){
                        	$.setLoginUser(jres.user);
						}
                    },
                    error: function (result) {
                        alert('网络错误！result=' + result);
                    }
                });
                juser = sessionStorage.getItem("wdk_user");
                if(juser) {
                    return $.str2json(juser);
                }else{
                	return {};
				}
            }else{
                return {};
			}
		}

	}
	//获取站点中文名
	,getSiteName:function () {
		var _SITE_NAME = _SITE_ID;
		if(_SITE_ID=='hangzhou'){
            _SITE_NAME = '杭州站';
		}else if(_SITE_ID=='ningbo'){
            _SITE_NAME = '宁波站';
        }else if(_SITE_ID=='wenzhou'){
            _SITE_NAME = '温州站';
        }else if(_SITE_ID=='jiaxing'){
            _SITE_NAME = '嘉兴站';
        }else if(_SITE_ID=='huzhou'){
            _SITE_NAME = '湖州站';
        }else if(_SITE_ID=='shaoxing'){
            _SITE_NAME = '绍兴站';
        }else if(_SITE_ID=='jinhua'){
            _SITE_NAME = '金华站';
        }else if(_SITE_ID=='quzhou'){
            _SITE_NAME = '衢州站';
        }else if(_SITE_ID=='lishui'){
            _SITE_NAME = '丽水站';
        }else if(_SITE_ID=='taizhou'){
            _SITE_NAME = '台州站';
        }else if(_SITE_ID=='zhoushan'){
            _SITE_NAME = '舟山站';
        }
		return _SITE_NAME;
    }
	//回到订货网站首页
	,go_index:function(){
		$.getRoot().location.href =  'wdk?action=ecw.page&method=display&site_id=' + _SITE_ID + '&inclient='+ _INCLIENT +'&page_id=page_index';
	}
	//回到商家管理首页
	,go_ntm_index:function(){
        $.getRoot().location.href =  'wdk?action=ecw.page&method=display&site_id=' + _SITE_ID + '&inclient='+ _INCLIENT +'&page_id=page_ntm_onsale';
	}
	//回到订货网站首页
	,go_login:function(){
        $.getRoot().location.href =  'wdk?action=ecw.page&method=display&site_id=' + _SITE_ID + '&inclient='+ _INCLIENT +'&page_id=page_login';
	}
	//回到商家管理首页
	,go_ntm_login:function(){
        $.getRoot().location.href =  'wdk?action=ecw.page&method=display&site_id=' + _SITE_ID + '&inclient='+ _INCLIENT +'&page_id=page_ntm_login';
	}
    //回到员工登录首页
    ,go_staff_login:function(){
        $.getRoot().location.href =  'wdk?action=ecw.page&method=display&site_id=' + _SITE_ID + '&inclient='+ _INCLIENT +'&page_id=page_staff_login';
    }
	//是否在终端容器中运行
	,is_in_client:function () {
        var is_in_client = false;

        //判断是否在指定的浏览器中允许，如果是的话则不在新页签中打开
        var ua = navigator.userAgent;
        //alert(ua);

        if(ua.indexOf("rv:24.0") > -1 && ua.indexOf("Gecko/ /24.0") > -1){
            //Mozilla/5.0 (Windows NT 6.1; WOW64; rv:24.0) Gecko/ /24.0
            is_in_client = true;//用友终端
        }
        if(is_in_client==false && ua.indexOf("Chrome/44.0.2403.119") > -1 ){
            //Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36
            //Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36
            //Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; SLCC2; .NET CLR 2.0.50727; .NET4.0C; .NET4.0E; .NET CLR 3.5.30729; .NET CLR 3.0.30729; rv:11.0) like Gecko
            is_in_client = true;//百富终端
        }
        if(is_in_client==false && _INCLIENT == '1'){
            is_in_client = true;//url上带了从终端访问的标志
		}

        return true;
    }
	//新开窗口打开页面
//	page_open:function(page_id,page_param){
//		if(!page_param){
//			page_param = '';
//		}else{
//			page_param = '&'+page_param;
//		}
//		window.open('wdk?action=ecw.page&method=display&page_id='+page_id+page_param);
//	}
	,currentPage_open: function(page_id,page_param) {
		if(!page_param){
			page_param = '';
		}else{
			page_param = '&'+page_param;
		}
		location.href = 'wdk?action=ecw.page&method=display&site_id=' +  _SITE_ID + '&inclient='+ _INCLIENT +'&page_id='+page_id+page_param;
	}
	,page_open:function(page_id,page_param){
        var is_in_client = $.is_in_client();

		if(!page_param){
			page_param = '';
		}else{
			page_param = '&'+page_param;
		}

		var _url = 'wdk?action=ecw.page&method=display&site_id=' +  _SITE_ID + '&inclient='+ _INCLIENT +'&page_id='+page_id+page_param;

        if(is_in_client){
        	//在终端内运行
            $.getRoot().location.href = _url;
        }else{
            window.open(_url);
		}

	}
	//替换当前页面跳转到新页面
	,page_redirect:function(page_id,page_param){
		if(!page_param){
			page_param = '';
		}else{
			page_param = '&'+page_param;
		}
        $.getRoot().location.href = 'wdk?action=ecw.page&method=display&site_id=' + _SITE_ID + '&inclient='+ _INCLIENT +'&page_id='+page_id+page_param;
	}
    ,page_redirect_innewtab:function(page_id,page_param){
		var is_in_client = $.is_in_client();

		if(is_in_client){
			$.page_redirect(page_id,page_param);
		}else {
            if (!page_param) {
                page_param = '';
            } else {
                page_param = '&' + page_param;
            }

            var _url = 'wdk?action=ecw.page&method=display&site_id=' + _SITE_ID + '&inclient='+ _INCLIENT +'&page_id=' + page_id + page_param;

            window.open(_url);
        }
    }
	//弹出窗口
	//	实现思路如下：
	//		1、创建第一个蒙版图层，遮盖当前整个页面，透明度50%
	//		2、创建第二个图层，里面嵌入iframe
	//		3、注册回调方法
	//		4、将目标地址引入iframe，并将当前参数传递进去，用于回调使用
	,dialog_open:function(jparam){
		var _win_id = $.getUUID();
		var _page = jparam.page;
		var _url = jparam.url;
		var _closeBtn = jparam.closeBtn;
		var _move = jparam.move; 
		
		if (!_move && (typeof _move !== 'boolean')) {
			_move = '.layui-layer-title';
		}
		if (typeof _closeBtn === "String" && !_closeBtn) {//如果是
			_closeBtn = 1;
		}
		
		var _title_text = jparam.title;
		var _title_style = 'border:0;height:auto;background:transparent;text-align:center;color:#a6985f;font-size:20px;font-weight:bold;';
		var _title;
		
		if (_title_text === false) {
			_title = false;
			
		} else if (Object.prototype.toString.call(_title_text) === '[object Array]' && _title_text[1]) {
			_title_style += _title_text[1];
			_title = [_title_text[0], _title_style];
			
		} else {
			_title_text = _title_text ? _title_text : '';
			_title = [_title_text, _title_style];
		}
		
		
		var _page_param = jparam.page_param?jparam.page_param:'';
		var _page_param2 = _page_param;
		if(''!=_page_param){
			_page_param = '&'+_page_param;
		}
		if(_page){
			_url =  'wdk?action=ecw.page&method=display&site_id=' + _SITE_ID + '&inclient='+ _INCLIENT +'&win_id='+_win_id+'&page_id='+_page+_page_param;
		}else{
			_url = _url.match(/\?/) ? (_url+"&win_id="+_win_id+_page_param):(_url+'?win_id='+_win_id+_page_param)
		}
		var _width = jparam.width;
		var _height = jparam.height;
		var _maximum = jparam.maximum || false;
//		_width = _width.replace('px','');
//		_height = _height.replace('px','');

		var _onSubmit = jparam.onSubmit?jparam.onSubmit:function(){};
		var _onCancel = jparam.onCancel?jparam.onCancel:function(){};
		
		var _mid_onSubmit = $.method_reg(window,_onSubmit);
		var _mid_onCancel = $.method_reg(window,_onCancel);
		
		_url = _url+'&mid_submit='+_mid_onSubmit+'&mid_cancel='+_mid_onCancel;
//		关闭函数
	
		if(typeof jparam.close == "function"){
			var _closefn=jparam.close;
		}
		
		
//		if (Object.prototype.toString.call(_title) === '[object Array]') {//如果是数组
//			
//		}
		_win_id = $.getRoot().layer.open({
			type: 2,
			content: _url,
			area: [_width, _height],
			title: _title,
			cancel: _closefn,
			closeBtn: _closeBtn,
			move: _move,
			success: function(layero, index) {
				//如果要求最大化窗口则调用窗口最大化方法
				if(_maximum==true){
                    $.getRoot().layer.full(index);
				}
			}
		});
		
		return _win_id;
		
		//创建蒙版div
		/*
		var div_bg = document.createElement("DIV");
		div_bg.style.visibility = 'visible';  
		div_bg.style.zIndex = 999997;
		div_bg.style.overflow = "hidden";
		div_bg.style.width = '100%';
		div_bg.style.height = '100%';
		div_bg.style.position = 'fixed';
		div_bg.style.left = '0px';
		div_bg.style.top = '0px';
		div_bg.style.backgroundColor = '#000000';
		div_bg.style.opacity = "0.5";
		document.body.appendChild(div_bg); 
		*/
//		var html_bg = new Array();
//		html_bg.push('<div name="designer_dlg" id="designer_dlg_'+_win_id+'" style="z-index:999997;visibility:visible;overflow:hidden;width:100%;height:100%;position:fixed;left:0px;top:0px;background-color:#000000;opacity:0.5;_position:absolute;_clear:both;"></div>');
//		
//		var _top = $.getRoot();
//		$(_top.document.body).append(html_bg.join(''));
//
//
//
//		var html = new Array();
//		html.push(' <div name="designer_dlg" id="designer_dlg_'+_win_id+'_ifr" style="z-index:999998;overflow:hidden;position:fixed;left:50%;right:50%;top:50%;bottom:50%;width:'+_width+'px;height:'+_height+'px;margin-left:-'+_width/2+'px;margin-top:-'+_height/2+'px;');
//		html.push('_position:absolute;_clear:both;_top:expression(eval(document.compatMode && document.compatMode=="CSS1Compat") ? documentElement.scrollTop + (documentElement.clientHeight-this.clientHeight) - 1 : document.body.scrollTop + (document.body.clientHeight-this.clientHeight) - 1);">');
//		html.push('		<iframe id="" name="" src="'+_url+'"  width="100%" height="100%" frameborder="no" border="0" marginwidth="0" marginheight="0" scrolling="no" ></iframe>');
//		html.push(' </div>');
//		$(_top.document.body).append(html.join(''));
//
//		return _win_id;
//		document.body.appendChild(html.join(''));

		/*
		//创建iframe居中背景
		var div_parent = document.createElement("DIV");
		div_parent.style.visibility = 'visible';  
		div_parent.style.zIndex = 999998;
		div_parent.style.overflow = "hidden";
		//div_parent.style.width = _width;
		//div_parent.style.height = _height;
		div_parent.style.position = 'fixed';
		div_parent.style.left = '50%';
		div_parent.style.top = '50%';
		div_parent.style.bottom = '50%';
		div_parent.style.right = '50%';
		document.body.appendChild(div_parent); 

		//创建iframe		
		var div_ifr = document.createElement("DIV");
		div_ifr.style.visibility = 'visible';  
		div_ifr.style.zIndex = 999999;
		div_ifr.style.overflow = "hidden";
		div_ifr.style.width = _width;
		div_ifr.style.height = _height;
		//div_parent.appendChild(div_ifr); 

		div_parent.innerHTML = '<iframe id="" name="" src="'+_url+'"  width="'+_width+'" height="'+_height+'" style="margin-left:100px;" frameborder="no" border="0" marginwidth="0" marginheight="0" scrolling="no" ></iframe>';
		*/
	}
	//关闭对话框的回调
	,dialog_close:function(win_id){	
		var index = $.getRoot().layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        $.getRoot().layer.close(index);
		
//		layer.close(win_id);
//		var _top = $.getRoot();
//		$(_top.document.body).find("div[name='designer_dlg']").css('display','none');
//		if(!win_id){
//			win_id = $.getURLParam('win_id');
//		}
//		var _mid_submit = $.getURLParam('mid_submit');
//		var _mid_cancel = $.getURLParam('mid_cancel');
//		$.method_call(_mid_cancel,{});
//		$(_top.document.body).find("div[name='designer_dlg']").remove();		
	}
	,dialog_submit:function(jresult,win_id){	
		var index = $.getRoot().layer.getFrameIndex(window.name); //先得到当前iframe层的索引
		var _mid_submit = $.getURLParam('mid_submit');
		var _mid_cancel = $.getURLParam('mid_cancel');
		$.method_call(_mid_submit,jresult);

        $.getRoot().layer.close(index);
		
//		var _top = $.getRoot();		
//		$(_top.document.body).find("div[name='designer_dlg']").css('display','none');
//		if(!win_id){
//			win_id = $.getURLParam('win_id');
//		}
//		$(_top.document.body).find("div[name='designer_dlg']").remove();
	}
	//在浏览器新页签中打开
	,dialog_open_innewtab:function(jparam){
        var is_in_client = $.is_in_client();

		if(is_in_client){
			$.dialog_open(jparam);
		}else{
            var _win_id = $.getUUID();
            var _page = jparam.page;
            var _newtabpage = jparam.newtabpage || '';
            var _url = jparam.url;

            var _page_param = jparam.page_param?jparam.page_param:'';
            var _page_param2 = _page_param;
            if(''!=_page_param){
                _page_param = '&'+_page_param;
            }

            if(_newtabpage){
                _page = _newtabpage;
			}

            if(_page){
                _url =  'wdk?action=ecw.page&method=display&site_id=' +  _SITE_ID + '&inclient='+ _INCLIENT +'&win_id='+_win_id+'&page_id='+_page+_page_param;
            }else{
                _url = _url.match(/\?/) ? (_url+"&win_id="+_win_id+_page_param):(_url+'?win_id='+_win_id+_page_param)
            }

            window.open(_url);
		}
	}
	//获取当前登录用户json对象
	,getSessionUser:function(){
		var juser = new Object();
		juser.id = '';
		return juser;
	}
	//跳转到卷烟列表
	,ciga_list:function(condition){
		/*
		var jcondi = {
			company_ids:'111,222'
			,company_names:'哈哈，额呵呵'
			,pinpai_ids:''
			,pinpai_names:''
			,price_low_id:''
			,price_low_name:''
			,price_high_id:''
			,price_high_name:''
			,label_ids:''
			,label_names:''			
		}
		*/
			condition = Base64.encode($.json2str(condition));
			$.page_redirect('page_cigalist','condition='+condition);
		
	},
//	附件下载
	filedownloader:function(jparam){
		var _url = jparam.url?jparam.url:'wdk?action=wdk.pub&method=attachment_download&ajaxparam='+new Date().getTime();
		var _fileid = jparam.fileid;
		if(-1==_url.indexOf('http')){
			_url = $.base()+"/"+_url;
		}
	    if(_fileid){
	        if(_url.indexOf("?")>0){
	          _url += "&fileid="+_fileid;
	        }else{
	          _url += "?fileid="+_fileid;
	        }
	     }
		
		var oDiv = document.getElementById('wdk_download_div');
		if(!oDiv){
			oDiv = document.createElement("DIV");  
			oDiv.id = 'wdk_download_div';
			oDiv.style.visibility = 'visible';  
			oDiv.style.zIndex = -999999;
			oDiv.style.overflow="hidden";
			oDiv.style.width = '0px';
			oDiv.style.height = '0px';
			document.body.appendChild(oDiv); 
		}
		var ifr = $('<iframe width="0px" height="0px" frameborder="no" border="0" marginwidth="0" marginheight="0" scrolling="no"></iframe>').appendTo($(oDiv));
		if(_url.length>2000){
			var insid=$.getUUID();
			var form = $('<form method="post"></form>').appendTo($(oDiv));
			form.hide();
			form.attr("id","form"+insid);
			form.attr("target","ifr"+insid);
			var rurl=_url.substring(0,_url.indexOf("?"));
			form.attr("action",rurl);
			var pstr=_url.substr(_url.indexOf("?")+1);
			var parr = pstr.split("&");
			for(var i=0;i<parr.length;i++){
				var pp=parr[i].split("=");
				var ipt = $("<input>").appendTo(form);
				ipt.attr("name",pp[0]);
				ipt.val(decodeURIComponent(pp[1]));
			}
			//oDiv.innerHTML = '<iframe src="'+_url+'" width="0px" height="0px" frameborder="no" border="0" marginwidth="0" marginheight="0" scrolling="no"></iframe>';
			ifr.attr("id","ifr"+insid);
			ifr.attr("name","ifr"+insid);
			form[0].submit();
		}else{
			ifr.attr("src",_url);
		}
	},
    export_excel:function(jparam){
		var _url = 'wdk?action=ecw.page&method=export_excel';

        var _title = jparam.title?jparam.title:'';
        //var _columns = jparam.columns?jparam.columns:$.json2str([]);
        var _gridcode = jparam.gridcode?jparam.gridcode:'';
		var _queryParams = jparam.data?jparam.data:$.json2str({});

        _queryParams.eptitle = _title;
        _queryParams.epgridcode = _gridcode;
        //_queryParams.epcolumns = _columns;

        var _param = "wppm="+Base64.encode2(escape($.json2str(_queryParams)));

        _url += "&"+_param;

		$.filedownloader({url:_url});
    },
	base:function(){
		if($("base").length>0){
			var b=$("base").attr("href");
			return b.substring(0,b.length-1);
		}
		var urlstr = document.location.href;
		if(urlstr.indexOf("http")!=-1){
			var reg = /http:\/\/[^\/]*/g;
			var httpurl = reg.exec(urlstr)+"";
			var str1 = urlstr.replace(/http:\/\//g,"");
			var reg = /[^\/]*\/[^\/]*/g;
			var str2 = reg.exec(str1)+"";
			var appname = str2.replace(/[^\/]*\//g,"");    
			return httpurl+"/"+appname;
		}else{
			return "";
		}
	},
	//密码长度要求8位及以上，且至少包含字母、数字两种；
	test_web: function(pwdStr){
	    var reg1 = /^.*[0-9].*$/;
	    var reg2 = /^.*[a-zA-Z].*$/;
	    
	    var num = 0;
	    if(reg1.test(pwdStr)){
	      num++;
	    }
	    if(reg2.test(pwdStr)){
	      num++;
	    }
	    
	    if(num!=2){
	      return false;
	    }
	    if(pwdStr.length<8){
	      return false;
	    }
	    return true;
	}	
	
});


/***********************************************************/
/****													****/
/****					ALERT							****/
/****													****/
/****													****/
/***********************************************************/
window.alert = function(msg, callback) {
	if (typeof callback == "function") {
		layer.alert(msg, {closeBtn: 0}, function(index) {
			callback(index);
		});
	} else {
		layer.alert(msg, {closeBtn: 0});
	}
	
}


/***********************************************************/
/****													****/
/****					TRIM							****/
/****													****/
/****													****/
/***********************************************************/
if (typeof String.prototype.trim !== 'function') {
	 String.prototype.trim = function() {
		 return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	 }
}


/***********************************************************/
/****													****/
/****					CONSOLE							****/
/****													****/
/****													****/
/***********************************************************/
if (typeof(console) == "undefined") {
	window.console = {
			log: function() {},
			debug: function() {}
	}
}

// var aa = $.getLoginUser();
// var username = "441201111024".trim();
// var pwd = "s2837465".trim();

// $.cuajax({
// 	url:'http://yueyigou.com/wdk?action=ecw.page&method=login',
// 		    //url:'http://localhost:8080/wdk?action=wdk.pub&method=call_service',
// 		    //url: _PUB_URL2,
// 		    data: {
// 			_SRVNAME: 'service.ecw.member'
// 			, _SRVMETHOD: 'login'
// 			, _DATA: $.json2str({
// 			    login_name:username,
// 			    login_pwd:pwd,
// 		site_id:"zhaoqing",
// 			    identifying_code:1234
// 			})
// 		    },
// 		    success:function (result) {
// 			var jres = $.str2json(result);

// 	     //login_successMsg($.json2str(jres.session_info));
// 			eval(jres.script);
// 		    },
// 		    error: function (result) {
// 			alert('网络错误！result=' + result);
// 		    }

// 		})


// $.cuajax({
//         url: _PUB_URL2,
//         async: false,
//         data: {
//             _SRVNAME: 'service.ecw.order.buy',
//             _SRVMETHOD: 'canorder',
//             _DATA: $.json2str({
//                 op_acc: $.getLoginUser().account_uuid,
//                 cust_uuid: $.getLoginUser().cust_uuid
//             })
//         },
//         success:function (result) {
//             var jres = $.str2json(result)
//             if(jres.code == "1"){
//                 var can_order = jres.can_order;
//                 if(can_order == "1"){
//                     canorder=true;
//                 }else {
//                     canorder=false;
//                     layer.confirm(jres.next_order_date_desc, {
//                         btn: ['确认']
//                     }, function (index) {
//                         layer.close(index);
//                         $.page_redirect("page_index");

//                     }, function (index) {
//                         layer.close(index);
//                     });
//                 }
//             }else {
//                 canorder=false;
//                 layer.confirm(jres.desc, {
//                     btn: ['确认']
//                 }, function (index) {
//                     layer.close(index);
//                     $.page_redirect("page_index");

//                 }, function (index) {
//                     layer.close(index);
//                 });
//             }
//         },
//         error:function (result) {
//             canorder=false;
//             layer.confirm('网络错误！result=' + result, {
//                 btn: ['确认']
//             }, function (index) {
//                 layer.close(index);
//                 $.page_redirect("page_index");

//             }, function (index) {
//                 layer.close(index);
//             });
//         }
//     });