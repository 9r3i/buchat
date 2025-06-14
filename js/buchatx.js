/* bucahtx.js
 * ~ written to build mobile apps
 * authored by 9r3i
 * https://github.com/9r3i
 * started at december 9th 2021
 * @requires:
 *  - mfirebase.js as module
 *  - index.js and its dependencies
 *  - 
 */
;function buchatx(){
this.version='1.0.0';
window._buchatx=this;
this.token=null;
this.fcm=null;
this.tokens={};
this.init=function(){
  var id='app-background',
      bgurl=localStorage.getItem(id);
  if(!bgurl){
    localStorage.setItem(id,'images/galaxy-stars.jpg');
  }
  /* prepare firebase cloud messaging */
  this.fcm=this.fcmInit();
};
this.chat=function(res){
  if(!res.query.id){
    window.history.go(-1);
    return setTimeout(function(){
      return window.location.assign('#friends');
    },0xff);
    return;
  }
  _buchatx.getToken();
  var pre=res.buildElement('pre'),
  tbody=res.buildElement('tbody'),
  table=res.buildElement('table',null,{
    'class':'chat-table',
    cellspacing:'0px'
  },[tbody]),
  sender=res.buildElement('div',null,{
    'class':'chat-sender',
  },[table]),
  input=res.buildElement('input',null,{
    'class':'chat-input',
    placeholder:'Insert message here'
  }),
  form=res.buildElement('div',null,{
    'class':'chat-form',
  },[input]),
  pro=res.buildElement('div'),
  room=res.buildElement('div',null,{
    'class':'chat-room',
    id:'room-'+_index.user.id
  },[pro]),
  loader=_index.nextLoader(),
  db=new _index.mfb.Firestore,
  chatids=[
    _index.user.id+res.query.id,
    res.query.id+_index.user.id,
  ];
  loader.appendTo(res.content);
  room.pro=pro;
  db.selectByKey('users',res.query.id).then(ru=>{
    loader.remove();
    sender.appendTo(res.content);
    room.appendTo(res.content);
    form.appendTo(res.content);
    var tr=_buchatx.tableRowFriend(
      ru.id,
      ru.name,
      ru.timestamp,
      true
    );
    tr.appendTo(tbody);
    sender.name=tr.name;
    sender.time=tr.time;
    sender.img=tr.img;
    sender.loader=tr.loader;
    sender.id=ru.id;
    _buchatx.chatUpdate(chatids,room,sender);
  });
  _buchatx.selectToken(res.query.id,r=>{
    if(r.token){
      _buchatx.tokens[res.query.id]=r.token;
    }
  });
  input.onkeyup=function(e){
    if(e.keyCode!=13||this.value==''){return false;}
    var val=this.value;
    this.value='';
    _buchatx.sendChat(res.query.id,val);
    if(_buchatx.tokens.hasOwnProperty(res.query.id)){
      var to=_buchatx.tokens[res.query.id];
      _buchatx.sendNotification(to,_index.user.name,val);
    }
  };
  input.onfocus=function(){
    setTimeout(function(){
      room.scrollTo({
        top:room.pro.offsetHeight,
        left:0,
        behavior:'smooth',
      });
    },0xff);
  };
  _buchatx.bgSet();
};
this.chatUpdate=function(chatids,room,sender){
  this.listeningChat(chatids,function(r){
    _buchatx.chatRoom(r,room);
  });
  var db=new _index.mfb.Firestore;
  db.selectByKey('users',sender.id).then(ru=>{
    var theroom=document.getElementById('room-'+_index.user.id),
    online=document.getElementById('online-'+ru.id);
    if(!ru){
      if(theroom){
        _buchatx.chatUpdate(chatids,room,sender);
      }return;
    }
    if(ru.name!=sender.name.innerText){
      sender.name.innerText=ru.name;
    }
    var tmp=parseFloat(ru.timestamp.seconds
      +'.'+ru.timestamp.nanoseconds)*1000,
    tm=(new Date(Math.ceil(tmp))).toString().substr(0,25),
    isOnline=(new Date).getTime()-(new Date(Math.ceil(tmp))).getTime()<60000;
    sender.time.dataset.time=tm;
    if(isOnline){
      if(!online){
        online=_index.buildElement('div',null,{
          'class':'chat-sender-online',
          id:'online-'+ru.id,
        });
        sender.time.innerText='Online';
        sender.time.insertBefore(online,sender.time.firstChild);
      }
    }else{
      sender.time.innerText=tm;
      if(online){
        online.parentNode.removeChild(online);
      }
    }
    if(theroom){
      _buchatx.chatUpdate(chatids,room,sender);
    }
  });
};
this.chatRoom=function(r,room){
  var rx={},rs=[],ro=0,
  build=_index.buildElement;
  r.forEach(function(c){
    var data=c.data(),
    tmp=parseFloat(data.timestamp.seconds
      +'.'+data.timestamp.nanoseconds)*1000,
    tm=(new Date(Math.ceil(tmp))).toString().substr(0,25),
    key=parseInt(data.timestamp.seconds+''+data.timestamp.nanoseconds,10);
    rx[key]={
      id:c.id,
      tm:tm,
      ...data,
    };
    rs.push(key);
  });
  rs.sort();
  for(var i in rs){
    var k=rs[i],
    dt=rx[k],
    bs=build('span',dt.tm.substr(16,5),{
      'class':'chat-'+(dt.from==_index.user.id?'own':'other')
    }),
    bi=build('div',dt.message,{
      'class':'chat-text-'
        +(dt.from==_index.user.id?'own chat-own':'other chat-other')
    }),
    bc=build('div',null,{
      'class':'chat-container'+(dt.from==_index.user.id?' chat-own':'')
    },[bi]),
    bw=build('div',null,{
      'class':'chat-wrapper',
      id:dt.id,
    },[bc,bs]),
    bz=document.getElementById(dt.id);
    if(!bz){
      ro++;
      bw.appendTo(room.pro);
    }
  }
  if(ro>0){
    room.scrollTo({
      top:room.pro.offsetHeight,
      left:0,
      behavior:'smooth',
    });
    var sound=new Audio('audio/receive.mp3');
    sound.play();
  }
};
this.addFriend=function(res){
  var input=res.buildElement('input',null,{
    'class':'edit-input',
    placeholder:'Insert your friend\'s email here'
  }),
  td=res.buildElement('td',null,{
    'class':'td-full'
  },[input]),
  tr=res.buildElement('tr',null,{},[td]),
  tbody=res.buildElement('tbody',null,{},[tr]),
  table=res.buildElement('table',null,{
    'class':'friend-table',
    cellspacing:'0px'
  },[tbody]),
  friends=res.buildElement('div',null,{
    'class':'friends',
  },[table]),
  loader=_index.nextLoader(),
  db=new _index.mfb.Firestore,
  user=_index.user;
  loader.appendTo(res.content);
  db.selectByKey('users',user.id).then(ru=>{
    loader.remove();
    user=ru;
    _index.user=user;
    _index.userData(user);
    friends.appendTo(res.content);
    input.onkeyup=function(e){
      if(e.keyCode!=13){return false;}
      if(this.value==user.email){
        this.value='';
        return _index.splash('Email is yours.');
      }
      if(!_index.isValidEmail(this.value)){
        return _index.splash('Error: Email is not valid.');
      }
      loader.appendTo(res.content);
      friends.style.display='none';
      db.select('users',[['email','==',this.value]]).then(function(r){
        loader.remove();
        friends.style.display='block';
        input.value='';
        if(r.length<1){
          return _index.splash('Notice: Email is not registered.');
        }
        var friend=r[0];
        if(user.friends.indexOf(friend.id)>=0){
          return _index.splash('Email is already in your friendlist.');
        }
        user.friends.push(friend.id);
        db.update('users',user.id,user);
        _index.user=user;
        _index.userData(user);
        _index.splash('Email is added.');
        window.history.go(-1);
      });
    };
  });
};
this.friends=function(res){
  _buchatx.getToken();
  var tbody=res.buildElement('tbody'),
  table=res.buildElement('table',null,{
    'class':'friend-table',
    cellspacing:'0px'
  },[tbody]),
  add=res.buildElement('button','Add Friend',{
    'class':'button button-blue',
  }),
  addSpace=res.buildElement('div',null,{
    'class':'background-view-update'
  },[add]),
  friends=res.buildElement('div',null,{
    'class':'friends',
  },[addSpace,table]),
  loader=_index.nextLoader(),
  db=new _index.mfb.Firestore,
  user=_index.user;
  loader.appendTo(res.content);
  add.onclick=function(){
    return window.location.assign('#addfriend');
  };
  db.selectByKey('users',user.id).then(ru=>{
    user=ru;
    _index.user=user;
    _index.userData(user);
    if(ru.friends.length<1){
      loader.remove();
      friends.appendTo(res.content);
      return _index.splash('You have no friend yet.');
    }
    db.listeningWhere('users',[
      'id','in',ru.friends
    ],function(r){
      loader.remove();
      friends.appendTo(res.content);
      tbody.innerHTML='';
      for(var i in r){
        _buchatx.tableRowFriend(
          r[i].id,
          r[i].name,
          r[i].timestamp
        ).appendTo(tbody);
      }
    });
  });
};
this.background=function(res){
  var bgText=res.buildElement('div',null,{
    'class':'background-picture-text',
    'data-text':'Update Bakcground'
  }),
  bgInput=res.buildElement('input',null,{
    'class':'background-picture-input',
    type:'file',
    accept:'image/*',
  }),
  bgProfile=res.buildElement('div',null,{
    'class':'background-view-update',
  },[bgText,bgInput]),
  bgImage=res.buildElement('img',null,{
    'class':'background-view-image',
  }),
  bgView=res.buildElement('div',null,{
    'class':'background-view',
  },[bgImage]),
  id='app-background',
  url=localStorage.getItem(id);
  bgView.appendTo(res.content);
  bgProfile.appendTo(res.content);
  if(url){bgImage.src=url;}
  bgInput.onchange=function(e){
    var fr=new FileReader;
    fr.onloadend=function(e){
      localStorage.setItem(id,e.target.result);
      _index.bgSet();
      window.history.go(-1);
      return _index.splash('Background has been updated.');
    };fr.readAsDataURL(this.files[0]);
  };
};
this.profile=function(res){
  var tbody=res.buildElement('tbody'),
  table=res.buildElement('table',null,{
    'class':'profile-table',
    cellspacing:'0px'
  },[tbody]),
  img=res.buildElement('img'),
  loader=_index.nextRoller(),
  photo=res.buildElement('div',null,{
    'class':'profile-photo'
  },[loader]),
  profile=res.buildElement('div',null,{
    'class':'profile',
  },[photo,table]),
  camera=res.buildElement('div',null,{
    'class':'profile-camera'
  }),
  cameraInput=res.buildElement('input',null,{
    'class':'profile-camera-input',
    type:'file',
    accept:'image/*',
  }),
  db=new _index.mfb.Firestore,
  storage=new _index.mfb.Storage('pictures'),
  user=_index.user;
  profile.appendTo(res.content);
  storage.get(user.id+'.png',photoURL=>{
    img.src=photoURL;
    img.onload=function(){
      loader.remove();
      img.appendTo(photo);
      camera.appendTo(photo);
      cameraInput.appendTo(photo);
    };
    img.onerror=function(){
      loader.remove();
      img.appendTo(photo);
      camera.appendTo(photo);
      cameraInput.appendTo(photo);
      this.src='images/user-male.png';
    };
  });
  cameraInput.onchange=function(e){
    var file=this.files[0],
    imgx=new Image;
    imgx.onload=function(){
      var ratio=imgx.width>imgx.height
               ?imgx.height/imgx.width
               :imgx.width/imgx.height,
          iw=imgx.width>imgx.height?ratio*imgx.width:imgx.width,
          ih=imgx.height>imgx.width?ratio*imgx.height:imgx.height,
          sx=imgx.width>imgx.height
            ?(imgx.width-imgx.height)/2:0,
          sy=imgx.height>imgx.width
            ?(imgx.height-imgx.width)/2:0;
      var canvas=res.buildElement('canvas',null,{
        width:200,
        height:200,
      }),
      ctx=canvas.getContext('2d');
      ctx.drawImage(imgx,sx,sy,iw,ih,0,0,200,200);
      var base64ImageData=canvas.toDataURL();
      /* start to upload */
      cameraInput.disabled=true;
      camera.style.display='none';
      img.style.display='none';
      loader.appendTo(photo);
      storage.set(user.id+'.png',base64ImageData,function(r){
        storage.get(user.id+'.png',photoURL=>{
          loader.remove();
          cameraInput.disabled=false;
          camera.style.display='block';
          img.style.display='block';
          if(!photoURL){return false;}
          img.src=photoURL;
          img.onload=function(){
          };
          img.onerror=function(){
            this.src='images/user-male.png';
          };
        });
      });
    };imgx.src=URL.createObjectURL(file);
  };
  _buchatx.tableRowProfile('Email',user.email).appendTo(tbody);
  db.selectByKey('users',user.id).then(ru=>{
    var name=_buchatx.tableRowProfile('Name',user.name,true);
    user=ru;
    _index.user=user;
    _index.userData(user);
    name.appendTo(tbody);
    name.input.onchange=function(e){
      user.name=this.value;
      db.update('users',user.id,user).then(function(r){
        _index.user=user;
        _index.userData(user);
        return _index.splash('Your name has been saved.');
      });
    };
  });
};
this.tableRowProfile=function(key,value,edit){
  var build=_index.buildElement,
  input=build('input',null,{
    'class':'edit-input',
    type:'text',
    placeholder:'Insert '+key,
    value:value,
  }),
  tdKey=build('td',key),
  tdValue=build('td',edit?null:value,{},edit?[input]:null),
  tr=build('tr',null,{
    
  },[tdKey,tdValue]);
  tr.input=input;
  return tr;
};
this.tableRowFriend=function(id,name,timestamp,fourty){
  var build=_index.buildElement,
  tmp=parseFloat(timestamp.seconds+'.'+timestamp.nanoseconds)*1000,
  tm=(new Date(tmp)).toString().substr(0,25),
  loader=fourty?this.loaderFourty():_index.nextRoller(),
  img=build('img',null,{
    'data-id':id,
  }),
  tdKey=build('td',null,{},[loader]),
  tname=build('div',name),
  ttime=build('div',tm,{
    'data-time':tm
  }),
  tdValue=build('td',null,{},[tname,ttime]),
  tr=build('tr',null,{
    'data-id':id,
    'data-name':name,
    'data-time':tm
  },[tdKey,tdValue]),
  storage=new _index.mfb.Storage('pictures');
  img.loader=loader;
  storage.get(id+'.png',function(url){
    img.src=url;
    img.onload=function(e){
      var pr=this.loader.parentNode;
      this.loader.remove();
      this.appendTo(pr);
    };
  });
  tr.onclick=function(e){
    window.location.assign('#chat?id='+this.dataset.id);
  };
  tr.name=tname;
  tr.time=ttime;
  tr.loader=loader;
  tr.img=img;
  return tr;
};
this.sendChat=function(to,message){
  var db=new _index.mfb.Firestore,
  data={
    from:_index.user.id,
    to:to,
    chatid:_index.user.id+to,
    message:message,
    read:false,
  };
  return db.insert('chat',data);
};
this.listeningChat=function(chatids,cb){
  cb=typeof cb==='function'?cb:function(){};
  var db=new _index.mfb.Firestore,
  store=db.resource.store,
  col=db.resource.collection(store,'chat'),
  whereChat=db.resource.where('chatid','in',chatids),
  query=db.resource.query(col,whereChat),
  user=_index.user;
  db.update('users',user.id,user);
  return db.resource.onSnapshot(query,cb);
};
/* cloud messaging */
this.getToken=function(cb){
  cb=typeof cb==='function'?cb:function(){};
  if(this.fcm.fake){
    return cb(false);
  }
  this.fcm.subscribe(_index.user.id);
  this.fcm.getToken().then(token=>{
    _buchatx.token=token;
    _buchatx.saveToken(token);
    return cb(token);
  });
  this.fcm.onTokenRefresh(()=>{
    return _buchatx.getToken();
  });
  this.fcm.createChannel({
    id:"channel."+_index.user.id,
    name:"Channel_"+_index.user.id,
    importance:4
  });
  this.fcm.onMessage(r=>{
    
  });
  this.fcm.onBackgroundMessage(r=>{
    
  });
  this.fcm.requestPermission({forceShow:true}).then(function(){
    
  });
};
this.selectToken=function(uid,cb){
  cb=typeof cb==='function'?cb:function(){};
  var db=new _index.mfb.Firestore;
  db.selectByKey('token',uid).then(cb);
};
this.saveToken=function(token){
  var db=new _index.mfb.Firestore;
  db.update('token',_index.user.id,{
    uid:_index.user.id,
    token:token,
  });
};
this.sendNotification=function(to,title,body,cb){
  cb=typeof cb==='function'?cb:function(){};
  var url='https://fcm.googleapis.com/fcm/send',
  key='AAAAME_5tzA:APA91bEaFJ13Z9mP9ZIl1m7I2RqhzeyNFp9BZ3dRR3P2Ckz-7FT61xekAYLDFz7FVpZdvi0YMQfetVZCgcEqRagCk0nIXlsJ_1T376OLtIkyF4Ix_PigbZWtVuhSPyazl3ExfcWQvlH_',
  data={
    to:to,
    notification:{
      title:title,
      body:body,
    }
  },
  header={
    Authorization:'key='+key
  };
  return this.post(url,cb,data,true,header);
};
/* stream method -- json
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
  hd['Content-type']='application/json';
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
  xhr.send(JSON.stringify(dt));
  return xhr;
};
/* fcm init */
this.fcmInit=function(){
  var def={
    "subscribe" : "[function]",
    "unsubscribe" : "[function]",
    "onTokenRefresh" : "[function]",
    "onMessage" : "[function]",
    "onBackgroundMessage" : "[function]",
    "clearNotifications" : "[function]",
    "deleteToken" : "[function]",
    "getToken" : "[function]",
    "setBadge" : "[function]",
    "getBadge" : "[function]",
    "requestPermission" : "[function]",
    "findChannel" : "[function]",
    "listChannels" : "[function]",
    "createChannel" : "[function]",
    "deleteChannel" : "[function]"
  };
  if(typeof cordova==='object'&&cordova!=='null'
    &&typeof cordova.plugins==='object'&&cordova.plugins!==null
    &&typeof cordova.plugins.firebase==='object'
    &&cordova.plugins.firebase!==null
    &&typeof cordova.plugins.firebase.messaging==='object'
    &&cordova.plugins.firebase.messaging!==null){
    return cordova.plugins.firebase.messaging;
  }
  for(var ki in def){
    def[ki]=function(){};
  }
  def.fake=true;
  return def;
};
/* set background image */
this.bgSet=function(){
  var id='app-background',
      s=document.getElementById(id+'-chat'),
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
  s.textContent=".chat-room{background-image:url('"+bgurl+"');}";
  return true;
};
this.loaderFourty=function(){
  var build=_index.buildElement,
  main=build('div',null,{
    'class':'lds-ripple',
  },[build('div'),build('div')]);
  return main;
};
/* temp */
return this.init();
};


