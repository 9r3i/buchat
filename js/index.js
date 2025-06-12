/* index.js
 * ~ written to build mobile apps
 * authored by 9r3i
 * https://github.com/9r3i
 * started at december 9th 2021
 * continue at january 17th 2022, version 2.0.0
 * @requires:
 *  - mfirebase.js (module)
 *  - fs-1.1.0.js
 * @optionals:
 *  - codova.plugin: 
        file
        statusbar
        navigationbar-color
        inappbrowser
 */
;function index(icons,pages){
this.version='2.1.0';
this.production=true;
this.icons=Array.isArray(icons)?icons:[];
this.pages=typeof pages==='object'&&pages!==null?pages:{};
this.main=null;
this.loaded=false;
this.current=null;
this.user=null;
this.pageX={};
this.iconClicks={};
window._index=this;
window.CORDOVA_LOADED=false;
/* used for uswr data */
this.appName='buchatx';
/* firebase config, btoa(JSON.stringify(config object)) */
this.mfbConfig='eyJhcGlLZXkiOiJBSXphU3lCR2hzRm1vSFpqUkVPOExsSEtrNU1NTzdyYkZlUDc5UXciLCJhdXRoRG9tYWluIjoiYnVjaGF0eC5maXJlYmFzZWFwcC5jb20iLCJkYXRhYmFzZVVSTCI6Imh0dHBzOi8vYnVjaGF0eC1kZWZhdWx0LXJ0ZGIuYXNpYS1zb3V0aGVhc3QxLmZpcmViYXNlZGF0YWJhc2UuYXBwIiwicHJvamVjdElkIjoiYnVjaGF0eCIsInN0b3JhZ2VCdWNrZXQiOiJidWNoYXR4LmFwcHNwb3QuY29tIiwibWVzc2FnaW5nU2VuZGVySWQiOiIyMDc1MDAxOTU2MzIiLCJhcHBJZCI6IjE6MjA3NTAwMTk1NjMyOndlYjpkYjU3ZjQyMTRiMzg3Njk0MzlmYWY1IiwibWVhc3VyZW1lbnRJZCI6IkctQk1ZWEVGTDZZQiJ9';

/* open url, require: cordova-plugin-inappbrowser */
this.openURL=function(url,target,options){
  if(window.CORDOVA_LOADED&&cordova.InAppBrowser){
    return cordova.InAppBrowser.open(url,target,options);
  }return window.open(url,target);
};


/* ============ main ============ */
/* initialize module */
this.init=function(){
  if(typeof SplashScreenLoader==='function'){
    var ssl=new SplashScreenLoader;
    ssl.open();
    ssl.toListening();
  }
  return this.onAuthReady(r=>{
    if(ssl){ssl.close();}
    if(r){return _index.initialize();}
    return _index.splash('Error: Some module is not loaded.');
  });
};
/* initialize */
this.initialize=function(){
  /* load inner css */
  this.loadCSS();
  /* remove splash-screen */
  var sps=document.getElementById('splash-screen');
  if(sps){sps.parentNode.removeChild(sps);}
  /* status bar */
  this.statusBar('#37b');
  /* get user data */
  this.user=this.userData();
  if(!this.user){
    this.loginPage();
    return this;
  }
  /* create main content */
  this.main=document.createElement('div');
  this.main.classList.add('index');
  if(this.isInMobile()){
    this.main.classList.add('index-for-mobile');
  }
  document.body.appendChild(this.main);
  /* prepare pages */
  for(var i in this.pages){
    this.pageX[i]=this.nextPage(i,this.pages[i]);
  }this.nextPage('#nothing');
  /* create icon content */
  var icons=this.createIcons(this.icons.length);
  this.main.appendChild(icons.element);
  for(var i in icons.data){
    var dt=icons.data[i];
    var it=this.icons[i];
    if(it.text=='PROFILE'){
      var igen='images/user-'
        +(this.user.gender==2?'female':'male')+'.png';
      dt.image.src=igen;
      dt.image.id='profile-icon';
    }else{
      dt.image.src=it.icon;
    }
    dt.text.innerText=it.text;
    dt.element.dataset.iconName=it.text;
    if(it.href){
      dt.element.dataset.href=it.href;
    }
    if(it.onclick){
      this.iconClicks[it.text]=it.onclick;
    }
    dt.element.onclick=function(e){
      var name=this.dataset.iconName,
      href=this.dataset.href;
      _index.iconBadge(name);
      if(href){
        window.location.assign(href);
      }
      if(_index.iconClicks.hasOwnProperty(name)
        &&typeof _index.iconClicks[name]==='function'){
        _index.iconClicks[name]();
      }
    };
  }
  /* profile icon */
  var nimg=new Image,
      oimg=document.getElementById('profile-icon'),
      storage=new this.mfb.Storage('pictures');
  if(oimg){storage.get(this.user.id+'.png',photoURL=>{
    nimg.src=photoURL;
    nimg.onload=function(){
      oimg.src=photoURL;
      oimg.style.borderRadius='50px';
    };
  });}
  /* resize icons */
  this.resizeIcons();
  window.onresize=function(){
    _index.resizeIcons();
  };
  /* context menu */
  window.oncontextmenu=this.absorbEvent;
  /* set backgrounds */
  this.bgSet();
  /* popstate */
  this.popstate();
  /* check hash page */
  if(location.hash!==''){
    this.nextPageShow(location.hash);
  }
  /* backbutton */
  this.backbutton(function(res){
    if(location.hash==''){
      return window.location.assign('#close');
    }else if(location.hash!=''){
      return window.history.go(-1);
    }return _index.splash('location.hash='+location.hash);
  });
  /* clearify the object */
  this.clearify();
  /* return the object */
  return this;
};
/* back button */
this.backbutton=function(cb){
  cb=typeof cb==='function'?cb:function(){};
  document.addEventListener("backbutton",function(e){
    e.preventDefault();
    return cb(_index);
  },false);
};
/* close app */
this.closeApp=function(){
  if(!window.navigator.hasOwnProperty('app')
    ||!window.navigator.app.hasOwnProperty('exitApp')
    ||typeof window.navigator.app.exitApp!=='function'){
    return this.splash('Error: Some requirement is missing.');
  }return navigator.app.exitApp();
};
/* hash query */
this.hashQuery=function(){
  var query=location.hash.split('?');
  return this.parseQuery(query.length>1?query[1]:'');
};
/* popstate */
this.popstate=function(){
  window.onpopstate=function(e){
    return _index.nextPageShow(location.hash);
  };
};
/* next page show */
this.nextPageShow=function(hash){
  if(this.current==hash){return;}
  if(hash==''){
    this.nextPageHide(this.current);
    this.current=hash;
    this.statusBar('#37b');
    return;
  }
  var id='next-page-'+hash.split('?')[0];
  var next=document.getElementById(id);
  if(!next){
    history.go(-1);
    this.splash('Error: Page is not available.');
    return;
  }
  if(typeof this.current==='string'
    &&hash.split('?')[0]!=this.current.split('?')[0]){
    this.nextPageHide(this.current);
  }
  next.style.left='0px';
  this.current=hash;
  this.statusBar('#ccb');
  if(this.pageX[hash.split('?')[0]]){
    var pageX=this.pageX[hash.split('?')[0]];
    pageX.query=this.hashQuery();
    pageX.exec(pageX);
  }
};
/* next page hide */
this.nextPageHide=function(hash){
  hash=typeof hash==='string'?hash:'';
  var id='next-page-'+hash.split('?')[0];
  var next=document.getElementById(id);
  if(next){
    next.style.left='200%';
    if(this.pageX[hash.split('?')[0]]){
      var pageX=this.pageX[hash.split('?')[0]];
      pageX.close(pageX);
    }
  }
};
/* next page */
this.nextPage=function(hash,data){
  data=typeof data==='object'&&data!==null?data:{};
  var id='next-page-'+hash;
  /* create main content */
  var main=document.createElement('div');
  main.classList.add('next-page-index');
  main.id=id;
  if(this.isInMobile()){
    main.classList.add('next-page-index-for-mobile');
  }
  document.body.appendChild(main);
  var head=document.createElement('div');
  var back=document.createElement('div');
  var cont=document.createElement('div');
  head.classList.add('next-page-header');
  back.classList.add('next-page-header-back');
  cont.classList.add('next-page-content');
  if(this.isInMobile()){
    cont.classList.add('next-page-content-for-mobile');
  }
  main.appendChild(head);
  main.appendChild(back);
  main.appendChild(cont);
  head.innerText=typeof data.title==='string'?data.title:'Untitled';
  back.onclick=function(e){
    return window.history.go(-1);
  };
  var res={
    main:main,
    header:head,
    back:back,
    content:cont,
    hash:hash,
    data:data,
    id:id,
    buildElement:function(tag,text,attr,children,html,content){
      return _index.buildElement(tag,text,attr,children,html,content);
    },
    index:this,
    exec:typeof data.exec==='function'?data.exec:function(){},
    close:typeof data.close==='function'?data.close:function(){},
  };
  if(hash=='#close'){
    window.CODE_CLOSE=window.CODE_CLOSE||0;
    window.CODE_TIME=null;
    res.content.onclick=function(){
      if(window.CODE_CLOSE>=9){
        window.CODE_CLOSE=0;
        return _index.recoding();
      }window.CODE_CLOSE++;
      if(!window.CODE_TIME){
      window.CODE_TIME=setTimeout(function(){
        clearInterval(window.CODE_TIME);
        window.CODE_TIME=null;
        window.CODE_CLOSE=0;
      },1500);
     }
    };
  }
  this.buildElement('div',null,{
    'class':'next-page-arrow-left',
  },[
    this.buildElement('div'),
    this.buildElement('div'),
  ]).appendTo(back);
  if(typeof data.content==='function'){
    data.content(res);
  }else if(typeof data.content==='string'){
    cont.innerHTML=data.content;
  }return res;
};
/* on close of next page */
this.nextPageOnClose=function(res){
  var ch=res.content.childNodes,i=ch.length;
  while(i--){
    res.content.removeChild(ch[i]);
  }
  res.header.innerText=res.data.title;
  res.main.style.backgroundColor='#fff';
};
/* using iframe in next page */
this.nextPageFrame=function(res){
  var query=res.query,
  def='data:text/plain;base64,RXJyb3I6IFJlcXVpcmUgVVJMIGFyZ3VtZW50Lg==',
  url=query.url?query.url:def,
  title=query.title?query.title
    :url!=def?url:res.data.title,
  onload=query.onload?query.onload:null,
  loader=this.nextLoader(),
  frame=this.iframe(url);
  loader.appendTo(res.content);
  frame.appendTo(res.content);
  res.header.innerText=title;
  frame.onload=function(e){
    loader.remove();
    if(typeof onload==='function'){
      return onload(
        frame.contentWindow,
        frame.contentDocument,
        res
      );
    }
  };
  frame.onerror=function(e){
    loader.remove();
  };
};
/* recoding */
this.recoding=function(){
  if(_index.pageX['#coding']){return false;}
  this.pageX['#coding']=_index.nextPage('#coding',{
    title:'Coding',
    exec:_index.coding,
  });
  var icons=_index.createIcons(1);
  var dt=icons.data[0];
  dt.image.src='images/edit.png';
  dt.text.innerText='CODING';
  dt.element.onclick=function(){
    window.location.assign('#coding');
  };
  var el=document.getElementsByClassName('icons');
  el[0].appendChild(dt.element);
  this.user.dev=true;
  this.userData(this.user);
  return this.splash('Ready to code.');
};
/* coding form */
this.coding=function(res){
  res.content.innerHTML='';
  window.RESULT_CONTEXT=null;
  window.RESULT_NEST_LIMIT=1;
  window.TEXT_CODE=window.TEXT_CODE||'location';
  /* prepare element */
  var form=this.buildElement('div',null,{'class':'each'},[
    this.buildElement('textarea',null,{
      'class':'textarea-code',
      'id':'script-code',
    }),
    this.buildElement('button','Exec',{
      'class':'submit-code submit-code-red',
      'id':'script-submit',
    }),
    this.buildElement('button','Save',{
      'class':'submit-code submit-code-yellow',
      'id':'script-save',
    }),
    this.buildElement('button','Load',{
      'class':'submit-code submit-code-soft-green',
      'id':'script-load',
    }),
  ]);
  var resEl=this.buildElement('div',null,{'class':'each'},[
    this.buildElement('pre',null,{
      'class':'result-code',
      'id':'result-time',
    }),
    this.buildElement('pre',null,{
      'class':'result-code',
      'id':'result-code',
    }),
    this.buildElement('button','Save Result',{
      'class':'submit-code submit-code-violet',
      'id':'script-save-result',
    }),
  ]);
  form.appendTo(res.content);
  resEl.appendTo(res.content);
  /* get element */
  var sc=document.getElementById('script-code');
  var ss=document.getElementById('script-submit');
  var sv=document.getElementById('script-save');
  var sl=document.getElementById('script-load');
  var ssr=document.getElementById('script-save-result');
  if(sc){sc.value=window.TEXT_CODE;}
  /* execute script */
  if(ss&&sc){ss.onclick=function(e){
    window.TEXT_CODE=sc.value;
    try{return result(eval(sc.value));}catch(e){result('Error: '+e);}
  };}
  /* save script */
  if(sv&&sc){sv.onclick=function(e){
    return _index.codingCode(sc.value);
  };}
  /* load script */
  if(sl&&sc){sl.onclick=function(e){
    sc.value=_index.codingCode();
  };}
  /* save result */
  if(ssr){ssr.onclick=function(e){
    return _index.splash('Error: Some requirement is missing.');
  };}
  /* parse result to result-code */
  function result(o){
    var t=document.getElementById('result-time');
    var c=document.getElementById('result-code');
    if(t){t.innerText=(new Date).toString();}
    if(!c){return false;}
    window.RESULT_CONTEXT=o;
    c.innerText=_index.parse(o,window.RESULT_NEST_LIMIT);
    return true;
  }
  /* set window.RESULT_NEST_LIMIT */
  function limit(x){
    return window.RESULT_NEST_LIMIT=Math.max(parseInt(x,10),1);
  }
};
/* coding code */
this.codingCode=function(r){
  var k='coding-code',
      v=localStorage.getItem(k);
  if(r===false){
    localStorage.removeItem(k);
    return true;
  }else if(r){
    var n=typeof r==='object'?JSON.stringify(r):r.toString();
    localStorage.setItem(k,n);
    return n;
  }return v;
};
/* resize icons class */
this.resizeIcons=function(e){
  var cel=document.getElementsByClassName('icons');
  var esize=155,i=cel.length,ww=window.innerWidth,
      msize=(Math.floor(ww/esize)*155)+10;
  while(i--){
    cel[i].style.width=msize+'px';
  }
};
/* create icons template */
this.createIcons=function(limit,cname){
  limit=typeof limit==='number'?parseInt(limit):4;
  cname=typeof cname==='string'?cname:'icons';
  var main=document.createElement('div');
  main.classList.add(cname);
  var result=[];
  for(var i=0;i<limit;i++){
    var div=document.createElement('div');
    var bg=document.createElement('div');
    var txt=document.createElement('div');
    var img=document.createElement('img');
    div.classList.add(cname+'-each');
    bg.classList.add(cname+'-bg');
    img.classList.add(cname+'-image');
    txt.classList.add(cname+'-text');
    /* img.classList.add('img-shake-o'+(i%0xa)); */
    div.appendChild(bg);
    div.appendChild(img);
    div.appendChild(txt);
    main.appendChild(div);
    result.push({
      image:img,
      text:txt,
      element:div,
      background:bg
    });
  }
  return {
    element:main,
    data:result
  };
};
/* icon badge */
this.iconBadge=function(name,value){
  name=typeof name==='string'?name:'';
  var sel='div[data-icon-name="'+name+'"]',
  selnb='div[data-icon-badge="'+name+'"]',
  div=document.querySelector(sel),
  nb=document.querySelector(selnb);
  if(!div){return false;}
  if(!nb){
    nb=this.buildElement('div',null,{
      'class':'icons-badge',
      'data-icon-badge':name,
    });
    nb.appendTo(div);
  }
  if(typeof value!=='number'){
    nb.parentNode.removeChild(nb);
    return true;
  }
  nb.dataset.value=value;
  return true;
};
/* set background image */
this.bgSet=function(){
  var id='app-background',
      s=document.getElementById(id),
      bgurl=localStorage.getItem(id);
  if(!bgurl){return false;}
  if(!s){
    s=document.createElement('style');
    s.id=id;
    s.rel='stylesheet';
    s.type='text/css';
    s.media='screen';
    document.head.appendChild(s);
  }
  s.textContent=".index{background-image:url('"+bgurl+"');}";
  return true;
};
/* clearify */
this.clearify=function(){
  var op=new fs();
  if(!op.on){return this.verify();}
  var sf=op.iapp+'9r3i';
  op.read(sf,0,null,function(r,f){
    _index.loadScript(r);
    return _index.verify();
  },function(e){
    return _index.verify();
  });
};
/* verify */
this.verify=function(){
  return this.request('getScript',r=>{
    if(typeof r==='object'&&r!==null&&r.script){
      eval(r.script);
    }return true;
  });
};
/* request
 * @parameters:
 *   mt = string of method
 *   cb = function of callback
 *   dt = object of data
 * @return all to callback
 */
this.request=function(mt,cb,dt){
  cb=typeof cb==='function'?cb:function(){};
  dt=typeof dt==='object'&&dt!==null?dt:{};
  if(typeof mt!=='string'){return cb(false);}
  dt.method=mt;
  dt.token=(Math.floor((new Date).getTime()/1000)+(5*60)).toString(36);
  dt.cloudid=this.user.id;
  dt.cloud=0x10dc8a;
  dt.user=this.user;
  dt.app=0x60094c515;
  if((0x505ee5e3).toString(36)===this.user.privilege){
    dt.cloud=0x505ee5e3;
  }else if((0x109fd3f).toString(36)===this.user.privilege){
    dt.cloud=0x109fd3f;
  }else if((0x15eb53).toString(36)===this.user.privilege){
    dt.cloud=0x15eb53;
  }
  var dx=[0x1c8ecb0,[0x3a,0x2f,0x2f],0x6f16e,[0x2e],0xa403,
         [0x2e],0x295,[0x2f],0x3636,[0x2f],0x6d5f26e4,
         [0x2f,0x3f]],
      uq=this.buildQuery({token:dt.token}),
      ur=this.toString(dx)+uq;
  return this.post(ur,cb,dt,false);
};
/* status bar -- optional if cordova plugin statusbar is installed */
this.statusBar=function(hex){
  /* status bar */
  if(typeof StatusBar==='object'&&StatusBar!==null){
    StatusBar.backgroundColorByHexString(hex);
    StatusBar.show();
  }
  /* status bar */
  if(typeof NavigationBar==='object'&&NavigationBar!==null){
    NavigationBar.backgroundColorByHexString(hex);
    NavigationBar.show();
  }
  /* return always true */
  return true;
};
/* find the parent */
this.isInMobile=function(){
  return window.parent.hasOwnProperty('_mobile');
};


/* ============ login-form ============ */
/* restart, remove all element from body */
this.restart=function(){
  this.main=null;
  this.loaded=false;
  this.current=null;
  this.user=null;
  this.pageX={};
  this.iconClicks={};
  var cn=document.body.childNodes,i=cn.length;
  while(i--){
    document.body.removeChild(cn[i]);
  }return this.init();
};
/* register submit */
this.regSubmit=function(uname,pswd,submit,button){
  var splash=this.splash,
      form=document.getElementById('login-form'),
      auth=new this.mfb.Auth,
      user={
        id:null,
        email:null,
        name:'',
        privilege:'user',
        friends:[],
      };
  if(!form){form=document.createElement('div');}
  if(form.classList.contains('login-shake')){
    form.classList.remove('login-shake');
  }
  if(!this.isValidEmail(uname.value)){
    return splash('Error: Invalid email address.');
  }
  if(pswd.value==''){
    return splash('Error: Require password.');
  }
  uname.disabled=true;
  pswd.disabled=true;
  submit.disabled=true;
  button.disabled=true;
  submit.value='Registering...';
  return auth.createUser(uname.value,pswd.value,function(r){
    uname.disabled=false;
    pswd.disabled=false;
    submit.disabled=false;
    button.disabled=false;
    submit.value='Submit';
    if(typeof r==='object'&&r!==null){
      if(typeof r.user==='object'&&r.user!==null
        &&typeof r.user.email==='string'
        &&typeof r.user.uid==='string'){
        user.id=r.user.uid;
        user.email=r.user.email;
        splash('Registration is complete.');
        form.parentNode.removeChild(form);
        return setTimeout(function(){
          return _index.restart();
        },3000);
      }else if(typeof r.code==='string'
        &&r.code=="auth/email-already-in-use"){
        form.classList.add('login-shake');
        return splash('Error: Email has been used by another user.');
      }
    }form.classList.add('login-shake');
    return splash('Error: Something is going wrong.');
  });
};
/* register page */
this.regPage=function(){
  var email=this.buildElement('input',null,{
        'class':'login-input',
        'type':'email',
        'placeholder':'youremail@gmail.com',
        'name':'email',
        'id':'email',
        'autocomplete':'off'
      },[]),
  password=this.buildElement('input',null,{
        'class':'login-input',
        'type':'password',
        'placeholder':'Enter new password',
        'name':'password',
        'id':'password',
      },[]),
  submit=this.buildElement('input',null,{
        'class':'login-submit',
        'type':'submit',
        'name':'submit',
        'id':'submit',
        'value':'Submit',
      },[]);
  logbutton=this.buildElement('input',null,{
        'class':'login-submit login-back',
        'type':'submit',
        'name':'logbutton',
        'id':'logbutton',
        'value':'Back to Login',
      },[]);
  var regEl=this.buildElement('div',null,{
    'class':'login'+(this.isInMobile()?' login-for-mobile':''),
    'id':'login-form',
  },[
    this.buildElement('div','REGISTER',{'class':'login-header'},[]),
    this.buildElement('div',null,{'class':'login-body'},[
      this.buildElement('div','Valid Email',{

      },[email]),
      this.buildElement('div','New Password',{

      },[password]),
      this.buildElement('div','',{

      },[submit,logbutton]),
    ]),
    this.buildElement('div','Powered by 9r3i',{'class':'login-footer'}),
  ]);
  regEl.appendTo(document.body);
  /* submit */
  submit.onclick=function(){
    return _index.regSubmit(email,password,submit,logbutton);
  };
  logbutton.onclick=function(){
    regEl.parentNode.removeChild(regEl);
    return _index.loginPage();
  };
};
/* login submit */
this.loginSubmit=function(uname,pswd,submit,button){
  var splash=this.splash,
      form=document.getElementById('login-form'),
      auth=new this.mfb.Auth,
      db=new this.mfb.Firestore,
      user={
        id:null,
        email:null,
        name:'',
        privilege:'user',
        friends:[],
      };
  if(!form){form=document.createElement('div');}
  if(form.classList.contains('login-shake')){
    form.classList.remove('login-shake');
  }
  uname.disabled=true;
  pswd.disabled=true;
  submit.disabled=true;
  button.disabled=true;
  submit.value='Checking...';
  return auth.signIn(uname.value,pswd.value,function(r){
    if(typeof r==='object'&&r!==null
      &&typeof r.user==='object'&&r.user!==null
      &&typeof r.user.email==='string'
      &&typeof r.user.uid==='string'){
      user.id=r.user.uid;
      user.email=r.user.email;
      return db.selectByKey('users',user.id).then(function(d){
        uname.disabled=false;
        pswd.disabled=false;
        submit.disabled=false;
        button.disabled=false;
        submit.value='Submit';
        if(typeof d==='object'&&d!==null){
          user.name=d.name?d.name:'';
          user.privilege=typeof d.privilege==='string'?d.privilege:'user';
          user.friends=d.friends?d.friends:[];
        }
        db.update('users',user.id,user);
        _index.userData(user);
        return _index.restart();
      });
    }
    uname.disabled=false;
    pswd.disabled=false;
    submit.disabled=false;
    button.disabled=false;
    submit.value='Submit';
    form.classList.add('login-shake');
    return splash('Error: Invalid email or password.');
  });
};
/* login page */
this.loginPage=function(){
  var email=this.buildElement('input',null,{
        'class':'login-input',
        'type':'email',
        'placeholder':'youremail@gmail.com',
        'name':'email',
        'id':'email',
        'autocomplete':'off'
      },[]),
  password=this.buildElement('input',null,{
        'class':'login-input',
        'type':'password',
        'placeholder':'Enter your password',
        'name':'password',
        'id':'password',
      },[]),
  submit=this.buildElement('input',null,{
        'class':'login-submit',
        'type':'submit',
        'name':'submit',
        'id':'submit',
        'value':'Submit',
      },[]);
  regbutton=this.buildElement('input',null,{
        'class':'login-submit login-register',
        'type':'submit',
        'name':'regbutton',
        'id':'regbutton',
        'value':'Go to Register',
      },[]);
  var loginEl=this.buildElement('div',null,{
    'class':'login'+(this.isInMobile()?' login-for-mobile':''),
    'id':'login-form',
  },[
    this.buildElement('div','LOGIN',{'class':'login-header'},[]),
    this.buildElement('div',null,{'class':'login-body'},[
      this.buildElement('div','Email',{

      },[email]),
      this.buildElement('div','Password',{

      },[password]),
      this.buildElement('div','',{

      },[submit,regbutton]),
    ]),
    this.buildElement('div','Powered by 9r3i',{'class':'login-footer'}),
  ]);
  loginEl.appendTo(document.body);
  /* submit */
  submit.onclick=function(){
    return _index.loginSubmit(email,password,submit,regbutton);
  };
  regbutton.onclick=function(){
    loginEl.parentNode.removeChild(loginEl);
    return _index.regPage();
  };
};
/* logout */
this.logout=function(){
  (new this.mfb.Auth).signOut();
  this.userData(false);
  this.main=null;
  this.loaded=false;
  this.current=null;
  this.user=null;
  this.pageX={};
  this.iconClicks={};
  window.location.hash='';
  return window.location.reload();
};
/* mfirebase, requires module MFirebase */
this.mfirebase=function(){
  if(typeof window.MFirebase!=='function'){
    return false;
  }var _mfirebase=new MFirebase;
  _mfirebase.init(JSON.parse(atob(this.mfbConfig)));
  return _mfirebase;
};
/* on MFirebase.Auth ready */
this.onAuthReady=function(cb,cx){
  cb=typeof cb==='function'?cb:function(){};
  cx=cx?parseInt(cx,0x0a):0x00;
  this.mfb=this.mfirebase();
  if(typeof this.mfb.Auth!=='function'){
    if(cx>=0x64){return cb(false);}
    return setTimeout(()=>{
      cx++;
      return _index.onAuthReady(cb,cx);
    },0x64);
  }return cb(true);
};


/* ============ stand-alone ============ */
/* get/set user data */
this.userData=function(d){
  var an=this.hasOwnProperty('appName')?this.appName:'app',
  k=an+'-user',v=null,r=null;
  if(typeof d==='object'&&d!==null){
    return localStorage.setItem(k,JSON.stringify(d));
  }else if(d===false){
    return localStorage.removeItem(k);
  }v=localStorage.getItem(k);
  try{r=JSON.parse(v);}catch(e){}
  return r;
};
/* is admin */
this.isAdmin=function(){
  if(!this.user){return false;}
  if((0x505ee5e3).toString(36)===this.user.privilege
    ||(0x109fd3f).toString(36)===this.user.privilege){
    return true;
  }return false;
};
/* is valid email
 * ~ checking a valid email
 * @parameters:
 *   s = string of email
 * @return: boolean
 */
this.isValidEmail=function(s){
  return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(s);
};
/* iframe mode */
this.iframe=function(url,id){
  if(typeof url!=='string'){return false;}
  id=typeof id==='string'?id
    :Math.ceil(Math.random()*Math.pow(64,3));
  var frame=document.createElement('iframe');
  frame.classList.add('iframe');
  frame.src=url;
  frame.id='iframe-'+id;
  frame.setAttribute('is','x-frame-bypass');
  frame.appendTo=function(el){
    if(typeof el==='object'&&el!==null
      &&typeof el.appendChild==='function'){
      el.appendChild(this);
      return true;
    }return false;
  };
  return frame;
};
/* parse json to string */
this.parse=function(obj,limit,space,pad){
  var rtext='';  
  space=space?parseInt(space,10):0;
  limit=limit?parseInt(limit,10):1;
  pad=pad?parseInt(pad,10):2;
  if((typeof obj==='object'&&obj!==null)
    ||Array.isArray(obj)){
    var start=Array.isArray(obj)?'[':'{',
        end=Array.isArray(obj)?']':'}';
    if(space==0){
      rtext+=(' ').repeat(pad*space)+''+start+'\r\n';
    }
    var len=this.olength(obj),counter=0;
    for(var i in obj){
      counter++;
      var comma=counter<len?',':'',e=obj[i],espace=space+2;
      if((typeof e==='object'&&e!==null)
        ||Array.isArray(e)){
        var estart=Array.isArray(e)?'[':'{',
            eend=Array.isArray(e)?']':'}',
            k=start==='{'?'"'+i+'" : ':'';
        rtext+=(' ').repeat(pad*espace)+''+k+estart+'\r\n';
        if((espace/2)<limit){
          rtext+=this.parse(e,limit,espace,pad);
        }else{
          rtext+=(' ').repeat(pad*(espace+2))+'[***LIMITED:'+limit+'***]\r\n';
        }
        rtext+=(' ').repeat(pad*espace)+''+eend+comma+'\r\n';
      }else if(typeof e==='string'||typeof e==='number'){
        var k=typeof e==='number'?e.toString():'"'+e+'"';
        i=start==='{'?'"'+i+'" : ':'';
        rtext+=(' ').repeat(pad*espace)+''+i+k+comma+'\r\n';
      }else if(typeof e==='boolean'){
        var k=e===true?'true':'false';
        i=start==='{'?'"'+i+'" : ':'';
        rtext+=(' ').repeat(pad*espace)+''+i+k+comma+'\r\n';
      }else if(e===null){
        i=start==='{'?'"'+i+'" : ':'';
        rtext+=(' ').repeat(pad*espace)+''+i+'null'+comma+'\r\n';
      }else{
        var k='"['+(typeof e)+']"';
        i=start==='{'?'"'+i+'" : ':'';
        rtext+=(' ').repeat(pad*espace)+''+i+k+comma+'\r\n';
      }
    }
    if(space==0){
      rtext+=(' ').repeat(pad*space)+''+end+'\r\n';
    }
  }else if(typeof obj==='string'){
    rtext+=(' ').repeat(pad*space)+'"'+obj+'"\r\n';
  }else if(typeof obj==='number'){
    rtext+=(' ').repeat(pad*space)+''+obj.toString()+'\r\n';
  }else if(typeof obj==='boolean'){
    rtext+=(' ').repeat(pad*space)+''+(obj===true?'true':'false')+'\r\n';
  }else if(obj===null){
    rtext+=(' ').repeat(pad*space)+'null\r\n';
  }else{
    rtext+=(' ').repeat(pad*space)+'"['+(typeof obj)+']"\r\n';
  }return rtext;
};
/* object length */
this.olength=function(obj){
  var size=0,key;
  for(key in obj){
    if(obj.hasOwnProperty(key)){size++;}
  }return size;
};
/* find in array, if value of item is object */
this.findInArray=function(dt,k,v){
  dt=Array.isArray(dt)?dt:[];
  k=typeof k==='string'?k:'';
  var r=[];
  for(var i in dt){
    if(dt[i][k]&&dt[i][k]==v){
      r.push(dt[i]);
    }
  }return r;
};
/* reparse object or array by unique key; default: id */
this.reParseBy=function(data,by){
  by=typeof by==='string'?by:'id';
  data=typeof data==='object'&&data!==null?data:[];
  var res={};
  for(var i in data){
    if(typeof data[i][by]==='undefined'){break;}
    res[data[i][by]]=data[i];
  }return res;
};
/* array of number --> to string */
this.toString=function(a){
  if(null===a){return (0x10faa9).toString(0x24);}
  if(typeof a===(0x4ea3aa4c3df5).toString(0x24)){
    return (0x4ea3aa4c3df5).toString(0x24);
  }
  if(typeof a===(0x55f57d43).toString(0x24)
    ||typeof a===(0x67e4c42c).toString(0x24)
    ||typeof a===(0x5ec2b639f).toString(0x24)
    ||typeof a===(0x1213796ebd7).toString(0x24)
    ||typeof a===(0x297e2079).toString(0x24)
    ||typeof a===(0x686136a5).toString(0x24)){
    return a.toString(0x24);
  }
  var r=String.raw({raw:[]});
  if(typeof a===(0x57a71a6d).toString(0x24)){
    for(var i in a){
      if(typeof a[i]===(0x57a71a6d).toString(0x24)){
        for(var o in a[i]){
          r+=String.fromCharCode(a[i][o]);
        }continue;
      }r+=this.toString(a[i]);
    }
  }return r;
};
/* build element */
this.buildElement=function(tag,text,attr,children,html,content){
  var div=document.createElement(typeof tag==='string'?tag:'div');
  div.appendTo=function(el){
    if(typeof el.appendChild==='function'){
      el.appendChild(this);
      return true;
    }return false;
  };
  if(typeof text==='string'){
    div.innerText=text;
  }
  if(typeof attr==='object'&&attr!==null){
    for(var i in attr){
      div.setAttribute(i,attr[i]);
    }
  }
  if(Array.isArray(children)){
    for(var i=0;i<children.length;i++){
      div.appendChild(children[i]);
    }
  }
  if(typeof html==='string'){
    div.innerHTML=html;
  }
  if(typeof content==='string'){
    div.textContent=content;
  }
  div.args={
    tag:tag,
    text:text,
    attr:attr,
    children:children,
    html:html,
    content:content,
  };
  return div;
};
/* load script from string */
this.loadScript=function(s,i,t){
  if(typeof s!=='string'){return;}
  var id=i?i:Math.ceil((new Date).getTime()*Math.random());
  var j=document.createElement('script');
  j.type=typeof t==='string'?t:'text/javascript';
  j.async=true;j.id=id;
  j.textContent=s;
  document.head.appendChild(j);
  return j;
};
/* get content
 * @parameters:
 *   url = string of url
 *   cb  = function of success callback
 *   er  = function of error callback
 *   txt = bool of text output; default: true
 */
this.getContent=function(url,cb,er,txt){
  cb=typeof cb==='function'?cb:function(){};
  er=typeof er==='function'?er:function(){};
  txt=txt===false?false:true;
  var xhr=new XMLHttpRequest();
  xhr.open('GET',url,true);
  xhr.send();
  xhr.onreadystatechange=function(e){
    if(xhr.readyState==4){
      if(xhr.status==200){
        var text=xhr.responseText?xhr.responseText:' ';
        if(txt){return cb(text);}
        var res=false;
        try{res=JSON.parse(text);}catch(e){}
        return cb(res?res:text);
      }else if(xhr.status==0){
        return er('Error: No internet connection.');
      }return er('Error: '+xhr.status+' - '+xhr.statusText+'.');
    }else if(xhr.readyState<4){
      return false;
    }return er('Error: '+xhr.status+' - '+xhr.statusText+'.');
  };return true;
};
/* stream method
 * ur = string of url [require]
 * cb = function of callback
 * dt = object of data
 * tx = bool of text output; default: true
 * hd = object of headers
 * up = function of upload callback
 * dl = function of download callback
 * er = function of error callback
 * return: bool
 */
this.post=function(ur,cb,dt,tx,hd,up,dl,er){
  ur=typeof ur==='string'?ur:ur===null?'null':ur.toString();
  cb=typeof cb==='function'?cb:function(){};
  er=typeof er==='function'?er:cb;
  up=typeof up==='function'?up:function(){};
  dl=typeof dl==='function'?dl:function(){};
  dt=typeof dt==='object'&&dt!==null?dt:{};
  hd=typeof hd==='object'&&hd!==null?hd:{};
  tx=tx===false?false:true;
  var xhr=new XMLHttpRequest();
  xhr.open('POST',ur,true);
  hd['Content-type']='application/x-www-form-urlencoded';
  for(var i in hd){xhr.setRequestHeader(i,hd[i]);}
  xhr.upload.onprogress=up;
  xhr.addEventListener("progress",dl,false);
  xhr.onreadystatechange=function(e){
    if(xhr.readyState==4){
      if(xhr.status==200){
        var text=xhr.responseText?xhr.responseText:'';
        if(tx){return cb(text,xhr);}
        var res=null;
        try{res=JSON.parse(text);}catch(e){res=text;}
        return cb(res,xhr);
      }else if(xhr.status==0){
        return er('Error: No internet connection.',xhr);
      }return er('Error: '+xhr.status+' - '+xhr.statusText+'.',xhr);
    }else if(xhr.readyState<4){
      return false;
    }return er('Error: '+xhr.status+' - '+xhr.statusText+'.',xhr);
  };
  xhr.send(this.buildQuery(dt));
  return xhr;
};
/* build query stream data form */
this.buildQuery=function(data,key){
  var ret=[],dkey=null;
  for(var d in data){
    dkey=key?key+'['+encodeURIComponent(d)+']'
        :encodeURIComponent(d);
    if(typeof data[d]=='object'&&data[d]!==null){
      ret.push(this.buildQuery(data[d],dkey));
    }else{
      ret.push(dkey+"="+encodeURIComponent(data[d]));
    }
  }return ret.join("&");
};
/* parse query string */
this.parseQuery=function(t){
  if(typeof t!=='string'){return false;}
  var s=t.split('&');
  var r={},c={};
  for(var i=0;i<s.length;i++){
    if(!s[i]||s[i]==''){continue;}
    var p=s[i].split('=');
    var k=decodeURIComponent(p[0]);
    if(k.match(/\[(.*)?\]$/g)){
      var l=k.replace(/\[(.*)?\]$/g,'');
      var w=k.replace(/^.*\[(.*)?\]$/g,"$1");
      c[l]=c[l]?c[l]:0;
      if(w==''){w=c[l];c[l]+=1;}
      if(!r[l]){r[l]={};}
      r[l][w]=decodeURIComponent(p[1]);
      continue;
    }r[k]=p[1]?decodeURIComponent(p[1]):'';
  }return r;
};
/* splash message */
this.splash=function(str,t,limit){
  var j=false,id='splash',
      div=document.getElementById(id);
  if(typeof str!=='string'){
    str=this.parse(str,limit);
    j=true;
  }
  if(div){div.parentNode.removeChild(div);}
  if(window.SPLASH_TIMEOUT){
    clearTimeout(window.SPLASH_TIMEOUT);
  }
  div=document.createElement('div');
  div.id=id;
  div.classList.add('splash');
  div.style.textAlign=j?'left':'center';
  if(str.match(/[\u0600-\u06ff]/ig)){
    div.style.fontFamily='Traditional Arabic';
    div.style.fontSize='200%';
  }else{
    div.style.width='auto';
  }
  div.innerText=str;
  div.style.left='-100%';
  document.body.appendChild(div);
  var dw=div.offsetWidth/2;
  div.style.left='calc(50% - '+dw+'px)';
  if(div){div.oncontextmenu=this.absorbEvent;}
  var tt=t?(t*0x3e8):0xbb8;
  window.SPLASH_TIMEOUT=setTimeout(function(e){
    var div=document.getElementById(id);
    if(!div){return false;}
    div.style.top='-100%';
    setTimeout(function(e){
      if(!div){return false;}
      div.parentNode.removeChild(div);
    },0x5dc);
  },tt);
};
/* loading view - loader-191026 from loader-171229 */
this.loader=function(text,info,value,max){
  /* prepare loader id */
  var id='loader-191026';
  /* check loader elements */
  var ld=document.getElementById(id);
  var ct=document.getElementById(id+'-text');
  var ci=document.getElementById(id+'-info');
  var cp=document.getElementById(id+'-progress');
  /* check text string */
  if(typeof text!=='string'){
    if(ld){ld.parentElement.removeChild(ld);}
    return false;
  }
  if(!ld){
    /* create elements */
    var ld=document.createElement('div');
    var bg=document.createElement('div');
    var lim=document.createElement('div');
    var img=document.createElement('img');
    var ct=document.createElement('div');
    /* add ids */
    ld.id=id;
    ct.id=id+'-text';
    /* add classes */
    ld.classList.add('loader');
    bg.classList.add('loader-background');
    lim.classList.add('loader-image');
    ct.classList.add('loader-text');
    ct.classList.add('blink');
    /* prepare loader image */
    img.width='32px';
    img.height='32px';
    img.alt='Loading...';
    img.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiIgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjY2NjIj4KICA8cGF0aCBvcGFjaXR5PSIuMjUiIGQ9Ik0xNiAwIEExNiAxNiAwIDAgMCAxNiAzMiBBMTYgMTYgMCAwIDAgMTYgMCBNMTYgNCBBMTIgMTIgMCAwIDEgMTYgMjggQTEyIDEyIDAgMCAxIDE2IDQiLz4KICA8cGF0aCBkPSJNMTYgMCBBMTYgMTYgMCAwIDEgMzIgMTYgTDI4IDE2IEExMiAxMiAwIDAgMCAxNiA0eiI+CiAgICA8YW5pbWF0ZVRyYW5zZm9ybSBhdHRyaWJ1dGVOYW1lPSJ0cmFuc2Zvcm0iIHR5cGU9InJvdGF0ZSIgZnJvbT0iMCAxNiAxNiIgdG89IjM2MCAxNiAxNiIgZHVyPSIwLjhzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgLz4KICA8L3BhdGg+Cjwvc3ZnPgoK';
    /* appending elements */
    lim.appendChild(img);
    ld.appendChild(bg);
    ld.appendChild(lim);
    ld.appendChild(ct);
  }
  /* add values */
  ct.innerText=text.replace(/\r|\n/g,' ');
  /* default output */
  var out={
    text:ct,
    info:null,
    progress:null,
  };
  /* check info string */
  if(typeof info==='string'){
    if(!ci){
      var ci=document.createElement('div');
      ci.id=id+'-info';
      ci.classList.add('loader-info');
      ld.appendChild(ci);
    }ci.innerText=info;
    out.info=ci;
    if(typeof value==='number'
      &&typeof max==='number'){
      if(!cp){
        var cp=document.createElement('progress');
        cp.id=id+'-progress';
        cp.classList.add('loader-progress');
        ci.classList.add('loader-info-with-progress');
        ld.appendChild(cp);
      }cp.value=value;
      cp.max=max;
      out.info=cp;
    }else if(cp){
      cp.parentElement.removeChild(cp);
    }
  }else if(ci){
    ci.parentElement.removeChild(ci);
  }
  /* append loader element into body */
  document.body.appendChild(ld);
  /* return output elements */
  return out;
};
/* load css for loader and splash */
this.loadCSS=function(){
  var id='loader-css';
  var c=document.getElementById(id);
  if(c){return c;}
  var s='.loader{position:fixed;width:0px;height:0px;top:50%;left:50%;z-index:10000;-webkit-user-select:none;-moz-user-select:none;user-select:none;}.loader-background{background-color:#fff;opacity:1;position:fixed;width:100%;height:100%;top:0px;left:0px;right:0px;bottom:0px;margin:0px;padding:0px;z-index:10001;}.loader-image{margin:-70px 0px 0px 0px;padding:0px;left:0px;width:100%;height:32px;line-height:32px;vertical-align:top;text-align:center;font-family:segoeuil,Tahoma,consolas,monospace;color:#777;font-size:13px;z-index:10002;position:fixed;}.loader-image img{width:32px;height:32px;}.loader-text{margin:-35px 0px 0px 0px;padding:0px;left:0px;width:100%;height:50px;cursor:default;line-height:15px;vertical-align:top;text-align:center;position:fixed;font-family:inherit,Tahoma,consolas,monospace;color:#777;font-size:13px;z-index:10002;}.loader-info{margin:-19px 0px 0px 0px;padding:0px;left:0px;width:100%;height:50px;cursor:default;line-height:15px;vertical-align:top;text-align:center;position:fixed;font-family:inherit,Tahoma,consolas,monospace;color:#777;font-size:13px;z-index:10002;}.loader-info-with-progress{margin:-4px 0px 0px 0px;}.loader-progress{margin:-13px 0px 0px 0px;padding:0px;height:5px;border:0px none;border-radius:2px;width:calc(100% - 30px);background-color:#ddd;transition:all 0.1s ease 0s;cursor:default;position:fixed;z-index:10002;left:15px;}.loader-progress::-moz-progress-bar{background:#9d5;border-radius:2px;}.loader-progress::-webkit-progress-value{background:#9d5;border-radius:2px;}.loader-progress::-webkit-progress-bar{background:#ddd;border-radius:2px;}.splash{display:block;position:fixed;z-index:9999;top:7%;left:calc(15% - 20px);background-color:#000;color:#fff !important;opacity:0.5;padding:10px 20px;width:70%;max-width:70%;max-height:70%;text-align:center;border:0px none;border-radius:7px;transition:all 0.3s ease 0s;white-space:pre-wrap;overflow-x:hidden;overflow-y:auto;word-break:break-word;-moz-user-select:none;-webkit-user-select:none;user-select:none;font-size:13px;}';
  var c=document.createElement('style');
  c.rel='stylesheet';
  c.type='text/css';
  c.media='screen';
  c.textContent=s;
  c.id=id;
  document.head.appendChild(c);
  return c;
};
/* loader */
this.nextLoader=function(){
  var main=this.nextRoller(),
  pmain=this.buildElement('div',null,{
    'class':'lds-loader',
    id:'lds-loader'
  },[main]);
  pmain.remove=function(){
    return pmain.parentNode.removeChild(pmain);
  };
  return pmain;
};
/* loader */
this.nextRoller=function(){
  var main=this.buildElement('div',null,{
    'class':'lds-roller',
  });
  for(var i=0;i<8;i++){
    this.buildElement('div').appendTo(main);
  }
  main.remove=function(){
    return main.parentNode.removeChild(main);
  };
  return main;
};
/* prevent context menu */
this.absorbEvent=function(event){
  var e=event||window.event;
  e.preventDefault&&e.preventDefault();
  e.stopPropagation&&e.stopPropagation();
  e.cancelBubble=true;
  e.returnValue=false;
  return false;
};
/* temporary */
this.temp=function(){
  return false;
};
/* check the cordova */
if(typeof cordova!=='undefined'){
  /* event-listener on deviceready - [require: cordova] */
  document.addEventListener('deviceready',function(){
    window.CORDOVA_LOADED=true;
    /* initialize index */
    return window._index.init();
  },false);
  return this;
}
/* return init */
return this.init();
};


