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

$.extend({
        str2json:function(str){
		var eob = null;
		try{
			eob = eval("("+str+")");
		}catch(e){
		        alert('err:'+str);
			
			}
		
		return eob;
	}
});

$.extend({
	getClientInfo:function(callback){
		// 获取终端信息（包括IP，浏览器信息）
        $.cuajax({
            url: 'http://www.yueyigou.com/ecw',
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
	}});