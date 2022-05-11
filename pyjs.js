
function str2json(str)
{
        var eob = null;
        try{
                eob = eval("("+str+")");
        }catch(e){
                console.log('string2json error!!')
        }
        return eob;
}

function json2str(o)
{
        return JSON.stringify(o);
}
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
                    }}
function getParams(str)
{
        var res = str2json(str);
        var _url = 'https://www.yueyigou.com/wdk?action=ecw.page&method=call_service';
        _url += _url.match(/\?/) ? (_url.match(/\=/)?"&ajaxparamtime="+new Date().getTime():"ajaxparamtime="+new Date().getTime()) : ("?ajaxparam="+new Date().getTime());
        var _param = "";
        var order_info = {
                cust_uuid:res.resultset[0].cust_uuid,
                order_date:"2022-05-12",
                bill_type:"ORDER",
                bill_uuid:"",
                bill_status:"add",
                ip:"120.218.239.12",
                device_unique_code:"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36"
        };
        var orderdtl_infos = new Array();

        var disorderdtl_infos = []


        for(var i = 0; i < res.resultset.length ;i++)
        {
                var orderdtl_info = new Object();
                orderdtl_info.product_uuid = res.resultset[i].product_uuid;
                orderdtl_info.req_qty = res.resultset[i].quantity;
                orderdtl_info.qty = orderdtl_info.req_qty;
                orderdtl_info.price = res.resultset[i].whole_sale_price;
                orderdtl_info.day_order_qty = orderdtl_info.req_qty;
                orderdtl_infos.push(orderdtl_info);

        }

        var _data = json2str({
                order_info: order_info,
                orderdtl_infos: orderdtl_infos,
                disorderdtl_infos: disorderdtl_infos
            });

        var cujaxdata={
                _SRVNAME: 'service.ecw.order.buy'
                , _SRVMETHOD: 'asynSaveOrder'
                , _DATA: _data       
         }
        _param = "wppm="+Base64.encode2(escape(json2str(cujaxdata)));
        console.log(_url)
        console.log(_param);
        
}
var mode = parseInt(process.argv[2]);
if(mode == 0)
{
        const fsLibrary  = require('fs')
        fsLibrary.readFile('str.txt', (error, txtString) => {
        
        if (error) throw err;
        
        var str = ""

        str = txtString.toString();
        getParams(str);

        });
}
else if(mode == 1)
{
        var acc = process.argv[3];
        var op = process.argv[4];
        var ma = process.argv[5];

        var _data = json2str({
                op_account_uuid:acc,
                op_person_uuid:op,
                manage_unit_uuid:ma,
                order_fields:''
        });

        var cujaxdata={
                _SRVNAME: 'service.ecw.buy.shoppingcart'
                , _SRVMETHOD: 'queryShoppingCartList'
                , _DATA: _data       
         };
         //输出URL和DATA
         var _url = 'https://www.yueyigou.com/wdk?action=ecw.page&method=call_service';
         _url += _url.match(/\?/) ? (_url.match(/\=/)?"&ajaxparamtime="+new Date().getTime():"ajaxparamtime="+new Date().getTime()) : ("?ajaxparam="+new Date().getTime());
         var _param = "";
         _param = "wppm="+Base64.encode2(escape(json2str(cujaxdata)));
         console.log(_url)
        console.log(_param);
}
else if(mode ==2)
{
        var cu = process.argv[3];
        var req = process.argv[4];
        var _data = json2str({
                cust_uuid:cu,
                requestId:req
        })
        var cujaxdata={
                _SRVNAME: 'service.ecw.order.buy'
                , _SRVMETHOD: 'asynSaveOrderStatus'
                , _DATA: _data       
         };
        //输出URL和DATA
        var _url = 'https://www.yueyigou.com/wdk?action=ecw.page&method=call_service';
        _url += _url.match(/\?/) ? (_url.match(/\=/)?"&ajaxparamtime="+new Date().getTime():"ajaxparamtime="+new Date().getTime()) : ("?ajaxparam="+new Date().getTime());
        var _param = "";
        _param = "wppm="+Base64.encode2(escape(json2str(cujaxdata)));
        console.log(_url)
        console.log(_param);
}
else if(mode == 3)
{
        var _url = 'https://www.yueyigou.com/ecw';
        _url += _url.match(/\?/) ? (_url.match(/\=/)?"&ajaxparamtime="+new Date().getTime():"ajaxparamtime="+new Date().getTime()) : ("?ajaxparam="+new Date().getTime());
        cujaxdata = {

        }
        var _param = "";
        _param = "wppm="+Base64.encode2(escape(json2str(cujaxdata)));
        console.log(_url)
        console.log(_param);

}
else if(mode == 4)
{
        var _url = 'https://www.yueyigou.com/wdk?action=ecw.page&method=actionLog&t='+ new Date().getTime();
        _url += _url.match(/\?/) ? (_url.match(/\=/)?"&ajaxparamtime="+new Date().getTime():"ajaxparamtime="+new Date().getTime()) : ("?ajaxparam="+new Date().getTime());
        cujaxdata = {
                func:'一键购买',
                msg:'提交订单'
        }
        var _param = "";
        _param = "wppm="+Base64.encode2(escape(json2str(cujaxdata)));
        console.log(_url)
        console.log(_param);
}


