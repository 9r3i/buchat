/* parse.js
 * ~ parse an object as json view in an element id
 * authored by 9r3i
 * https://github.com/9r3i
 * started march 16th 2015
 * --- not require cordova nor header.js
 */
;function parse(id,pad){
this.version='1.3.0';
this.id=typeof id==='string'?id:'parse-result-'+(Math.random().toString().substr(2,9));
this.pad=typeof pad==='number'?parseInt(pad):2;
this.json=function(obj,limit,space){
  var el=document.getElementById(this.id);
  if(!el){return false;}
  el.style.fontFamily='consolas,monospace';
  el.style.fontSize='11px';
  el.style.whiteSpace='pre-wrap';
  el.style.backgroundColor='#fff';
  el.style.border='1px dotted #bbb';
  el.style.padding='10px';
  el.style.wordBreak='break-all';
  space=space?parseInt(space):0;
  limit=limit?parseInt(limit):3;
  var pad=this.pad;
  if(space==0){el.innerText='';}
  if((typeof obj==='object'&&obj!==null)||Array.isArray(obj)){
    var start=Array.isArray(obj)?'[':'{';
    var end=Array.isArray(obj)?']':'}';
    if(space==0){
      el.innerText+=(' ').repeat(pad*space)+''+start+'\r\n';
    }
    var len=this.olength(obj);
    var counter=0;
    for(var i in obj){
      counter++;
      var comma=counter<len?',':'';
      var e=obj[i];
      var espace=space+2;
      if((typeof e==='object'&&e!==null)||Array.isArray(e)){
        var estart=Array.isArray(e)?'[':'{';
        var eend=Array.isArray(e)?']':'}';
        var k=start==='{'?'"'+i+'" : ':'';
        el.innerText+=(' ').repeat(pad*espace)+''+k+estart+'\r\n';
        if((espace/2)<limit){
          this.json(e,limit,espace);
        }else{
          el.innerText+=(' ').repeat(pad*(espace+2))+'[***LIMITED:'+limit+'***]\r\n';
        }
        el.innerText+=(' ').repeat(pad*espace)+''+eend+comma+'\r\n';
      }else if(typeof e==='string'||typeof e==='number'){
        var k=typeof e==='number'?e.toString():'"'+e+'"';
        i=start==='{'?'"'+i+'" : ':'';
        el.innerText+=(' ').repeat(pad*espace)+''+i+k+comma+'\r\n';
      }else if(typeof e==='boolean'){
        var k=e===true?'true':'false';
        i=start==='{'?'"'+i+'" : ':'';
        el.innerText+=(' ').repeat(pad*espace)+''+i+k+comma+'\r\n';
      }else if(e===null){
        i=start==='{'?'"'+i+'" : ':'';
        el.innerText+=(' ').repeat(pad*espace)+''+i+'null'+comma+'\r\n';
      }else{
        var k='"['+(typeof e)+']"';
        i=start==='{'?'"'+i+'" : ':'';
        el.innerText+=(' ').repeat(pad*espace)+''+i+k+comma+'\r\n';
      }
    }
    if(space==0){
      el.innerText+=(' ').repeat(pad*space)+''+end+'\r\n';
    }
  }else if(typeof obj==='string'){
    el.innerText+=(' ').repeat(pad*space)+'"'+obj+'"\r\n';
  }else if(typeof obj==='number'){
    el.innerText+=(' ').repeat(pad*space)+''+obj.toString()+'\r\n';
  }else if(typeof obj==='boolean'){
    el.innerText+=(' ').repeat(pad*space)+''+(obj===true?'true':'false')+'\r\n';
  }else if(obj===null){
    el.innerText+=(' ').repeat(pad*space)+'null\r\n';
  }else{
    el.innerText+=(' ').repeat(pad*space)+'"['+(typeof obj)+']"\r\n';
  }
};
this.olength=function(obj){
  var size=0,key;
  for(key in obj){
    if(obj.hasOwnProperty(key)){size++;}
  }return size;
};
};
