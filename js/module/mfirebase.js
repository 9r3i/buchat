
import {
  initializeApp,
} from "https://www.gstatic.com/firebasejs/9.6.3/firebase-app.js";
import {
  getAnalytics,
  setUserProperties,
} from "https://www.gstatic.com/firebasejs/9.6.3/firebase-analytics.js";
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/9.6.3/firebase-storage.js";
import {
  getDatabase,
  ref as dbRef,
  set as dbSet,
  get as dbGet,
  child as dbChild,
} from "https://www.gstatic.com/firebasejs/9.6.3/firebase-database.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.6.3/firebase-auth.js";
import { 
  getPerformance,
} from 'https://www.gstatic.com/firebasejs/9.6.3/firebase-performance.js';
import { 
  getMessaging,
  getToken,
  onMessage,
} from 'https://www.gstatic.com/firebasejs/9.6.3/firebase-messaging.js';
import { 
  getMessaging as getMessagingSW,
  onBackgroundMessage,
} from 'https://www.gstatic.com/firebasejs/9.6.3/firebase-messaging-sw.js';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
  where,
  getDocs,
  deleteDoc,
} from 'https://www.gstatic.com/firebasejs/9.6.3/firebase-firestore.js';

/* primitive way */
window.MFirebase=function(){
this.version='1.2.0';
/* resources */
const _mfirebase={
  initializeApp:initializeApp,
  getAnalytics:getAnalytics,
  setUserProperties:setUserProperties,
  getStorage:getStorage,
  getDatabase:getDatabase,
  getAuth:getAuth,
  getPerformance:getPerformance,
  getMessaging:getMessaging,
  getToken:getToken,
  onMessage:onMessage,
  onBackgroundMessage:onBackgroundMessage,
  getMessagingSW:getMessagingSW,
  getFirestore:getFirestore,
  firebaseApp:null,
  init:function(config){
    this.firebaseApp=this.initializeApp(config);
    return this.getAnalytics(this.firebaseApp);
  },
  user:null,
  Auth:null,
  DB:null,
  Storage:null,
  Firestore:null,
  Messaging:null,
};
/* firebase messaging */
_mfirebase.Messaging=function(){
this.resource={
  messaging:_mfirebase.getMessaging(_mfirebase.firebaseApp),
  messagingsw:_mfirebase.getMessagingSW(_mfirebase.firebaseApp),
  getToken:_mfirebase.getToken,
  onMessage:_mfirebase.onMessage,
  onBackgroundMessage:_mfirebase.onBackgroundMessage,
};
this.getToken=function(vapidKey,cb){
  cb=typeof cb==='function'?cb:function(){};
  this.resource.getToken(this.resource.messaging,{
    vapidKey:vapidKey
  }).then(r=>{
    return cb(r);
  }).catch(e=>{
    return cb(e);
  });
};
this.subscribe=function(token,topic,cb){
  cb=typeof cb==='function'?cb:function(){};
  this.resource.messaging.subscribeToTopic([token],topic).then(r=>{
    return cb(true,r);
  }).catch(e=>{
    return cb(false,e);
  });
};
this.unsubscribe=function(token,topic,cb){
  cb=typeof cb==='function'?cb:function(){};
  this.resource.messaging.unsubscribeFromTopic([token],topic).then(r=>{
    return cb(true,r);
  }).catch(e=>{
    return cb(false,e);
  });
};
this.onMessage=function(cb){
  cb=typeof cb==='function'?cb:function(){};
  this.resource.onMessage(this.resource.messaging,r=>{
    return cb(r);
  });
};
this.onBackgroundMessage=function(cb,title,body){
  cb=typeof cb==='function'?cb:function(){};
  this.resource.onBackgroundMessage(this.resource.messaging,r=>{
    self.registration.showNotification(title,{body:body});
    return cb(r,self);
  });
};
this.send=function(topic,title,body,cb){
  cb=typeof cb==='function'?cb:function(){};
  this.resource.messagingsw.send({
    notification:{
      title:title,
      body:body,
    },
    topic:topic,
  }).then(r=>{
    return cb(true,r);
  }).catch(e=>{
    return cb(false,e);
  });
};
};
/* firebase auth */
_mfirebase.Auth=function(){
this.resource={
  auth:_mfirebase.getAuth(_mfirebase.firebaseApp),
  createUser:createUserWithEmailAndPassword,
  signIn:signInWithEmailAndPassword,
  signOut:signOut,
  analytics:_mfirebase.getAnalytics(_mfirebase.firebaseApp),
  setUserProperties:setUserProperties,
};
this.createUser=function(email,password,cb){
  cb=typeof cb==='function'?cb:function(){};
  var auth=this.resource.auth;
  this.resource.createUser(auth,email,password).then(r=>{
    return cb(r);
  }).catch(e=>{
    return cb(e);
  });
};
this.updateUser=function(key,value){
  var anal=this.resource.analytics;
  return this.resource.setUserProperties(anal,{key:value});
};
this.signOut=function(cb){
  cb=typeof cb==='function'?cb:function(){};
  var auth=this.resource.auth;
  this.resource.signOut(auth).then(r=>{
    return cb(r);
  }).catch(e=>{
    return cb(e);
  });
};
this.signIn=function(email,password,cb){
  cb=typeof cb==='function'?cb:function(){};
  var auth=this.resource.auth;
  this.resource.signIn(auth,email,password).then(r=>{
    _mfirebase.user=r.user;
    return cb(r);
  }).catch(e=>{
    return cb(e);
  });
};
};
/* firebase database */
_mfirebase.DB=function(dbname){
this.dbname=typeof dbname==='string'
  &&dbname.match(/^[a-z0-9]+$/)
  ?dbname:'unknown';
this.resource={
  db:_mfirebase.getDatabase(_mfirebase.firebaseApp),
  ref:dbRef,
  set:dbSet,
  get:dbGet,
  child:dbChild,
};
this.set=function(k,v,cb){
  cb=typeof cb==='function'?cb:function(){};
  var ref=this.resource.ref(this.resource.db,this.dbname+'/'+k);
  this.resource.set(ref,JSON.stringify(v)).then(r=>{
    return cb(true,r);
  }).catch(e=>{
    return cb(false,e);
  });
};
this.get=function(k,cb){
  cb=typeof cb==='function'?cb:function(){};
  var ref=this.resource.ref(this.resource.db),
  loc=this.dbname+'/'+k,
  trap=this.resource.child(ref,loc);
  this.resource.get(trap).then(r=>{
    return cb(r.exists()?JSON.parse(r.val()):null);
  }).catch(e=>{
    return cb(null);
  });
};
};
/* firebase storage */
_mfirebase.Storage=function(path){
this.path=typeof path==='string'
  &&path.match(/^[a-z0-9]+$/)
  ?path:'unknown';
this.resource={
  storage:_mfirebase.getStorage(_mfirebase.firebaseApp),
  ref:ref,
  uploadString:uploadString,
  getDownloadURL:getDownloadURL,
};
this.set=function(f,c,cb,md,up){
  cb=typeof cb==='function'?cb:function(){};
  up=typeof up==='function'?up:function(){};
  md=typeof md==='object'&&md!==null?md:{};
  var ref=this.resource.ref(this.resource.storage,this.path+'/'+f);
  this.resource.uploadString(ref,c,'data_url',md).then(r=>{
    r.on('state_changed',e=>{
      return up({
        loaded:e.bytesTransferred,
        total:e.totalBytes,
        type:'upload',
      });
    },e=>{
      return false;
    });
    return cb(true,r);
  }).catch(e=>{
    return cb(false,e);
  });
};
this.get=function(f,cb){
  cb=typeof cb==='function'?cb:function(){};
  var ref=this.resource.ref(this.resource.storage,this.path+'/'+f);
  this.resource.getDownloadURL(ref).then(url=>{
    return cb(url);
  }).catch(e=>{
    return cb(false,e);
  });
};
};
/* firestore */
_mfirebase.Firestore=function(){
this.resource={
  store:_mfirebase.getFirestore(_mfirebase.firebaseApp),
  collection:collection,
  addDoc:addDoc,
  serverTimestamp:serverTimestamp,
  query:query,
  orderBy:orderBy,
  limit:limit,
  onSnapshot:onSnapshot,
  doc:doc,
  setDoc:setDoc,
  getDoc:getDoc,
  where:where,
  getDocs:getDocs,
  deleteDoc:deleteDoc,
};
this.save=async function(path,data){
  var store=this.resource.store,
  col=this.resource.collection(store,path),
  res=false;
  data.timestamp=this.resource.serverTimestamp();
  try{
    res=await this.resource.addDoc(col,data);
  }catch(e){}
  return res;
};
this.load=function(path,cb){
  cb=typeof cb==='function'?cb:function(){};
  var store=this.resource.store,
  col=this.resource.collection(store,path),
  order=this.resource.orderBy('timestamp','desc'),
  limit=this.resource.limit(30),
  query=this.resource.query(col,order,limit);
  this.resource.onSnapshot(query,function(r){
    var doc=r.docChanges(),x=[];
    for(var i in doc){
      x.push(doc[i].doc.data());
    }return cb(x);
  });
};
this.set=async function(path,key,data){
  var store=this.resource.store,
  col=this.resource.collection(store,path),
  rdoc=this.resource.doc(col,key),
  res=false;
  data.timestamp=this.resource.serverTimestamp();
  try{
    res=await this.resource.setDoc(rdoc,data);
  }catch(e){}
  return res;
};
this.get=async function(path,key){
  var store=this.resource.store,
  col=this.resource.collection(store,path),
  rdoc=this.resource.doc(col,key),
  res=false;
  try{
    res=await this.resource.getDoc(rdoc);
  }catch(e){}
  return res.exists()?res.data():false;
};
this.insert=async function(table,data){
  var store=this.resource.store,
  col=this.resource.collection(store,table),
  res=false;
  data.timestamp=this.resource.serverTimestamp();
  try{
    res=await this.resource.addDoc(col,data);
  }catch(e){}
  return res;
};
this.update=async function(table,key,data){
  var store=this.resource.store,
  col=this.resource.collection(store,table),
  rdoc=this.resource.doc(col,key),
  res=false;
  data.timestamp=this.resource.serverTimestamp();
  try{
    res=await this.resource.setDoc(rdoc,data);
  }catch(e){}
  return res;
};
this.delete=async function(table,key){
  var store=this.resource.store,
  rdoc=this.resource.doc(store,table,key),
  res=false;
  try{
    res=await this.resource.deleteDoc(rdoc);
  }catch(e){}
  return res;
};
this.select=async function(table,where,limit,order){
  where=Array.isArray(where)?where:[];
  var store=this.resource.store,
  col=this.resource.collection(store,table),
  wheres=[col],res=false,resx=[],query=null;
  for(var i in where){
    if(where[i].length!=3){continue;}
    wheres.push(this.resource.where.apply(null,where[i]));
  }
  if(typeof limit==='number'){
    wheres.push(this.resource.limit(limit));
  }
  if(Array.isArray(order)){
    wheres.push(this.resource.orderBy.apply(null,order));
  }
  query=this.resource.query.apply(null,wheres);
  try{
    res=await this.resource.getDocs(query);
  }catch(e){}
  res.forEach((doc)=>{
    resx.push({
      id:doc.id,
      ...doc.data(),
    });
  });
  return resx;
};
this.selectByKey=async function(table,key){
  var store=this.resource.store,
  col=this.resource.collection(store,table),
  rdoc=this.resource.doc(col,key),
  res=false;
  try{
    res=await this.resource.getDoc(rdoc);
  }catch(e){}
  return res.exists()?{
    id:res.id,
    ...res.data()
  }:false;
};
this.listening=function(table,key,cb){
  cb=typeof cb==='function'?cb:function(){};
  var store=this.resource.store,
  rdoc=this.resource.doc(store,table,key),
  inMeta={includeMetadataChanges:true};
  this.resource.onSnapshot(rdoc,inMeta,function(r){
    return cb({
      id:r.id,
      ...r.data(),
    });
  });
};
this.listeningWhere=function(table,where,cb,limit){
  cb=typeof cb==='function'?cb:function(){};
  var store=this.resource.store,
  col=this.resource.collection(store,table),
  wheres=this.resource.where.apply(null,where),
  limit=this.resource.limit(limit?limit:10),
  query=this.resource.query(col,wheres,limit);
  this.resource.onSnapshot(query,function(r){
    var res=[];
    r.forEach(function(c){
      res.push({
        id:c.id,
        ...c.data(),
      });
    });
    return cb(res);
  });
};
this.listeningTimestamp=function(table,cb,limit,direction){
  cb=typeof cb==='function'?cb:function(){};
  var store=this.resource.store,
  col=this.resource.collection(store,table),
  order=this.resource.orderBy('timestamp',direction?direction:'desc'),
  limit=this.resource.limit(limit?limit:10),
  query=this.resource.query(col,order,limit);
  this.resource.onSnapshot(query,function(r){
    var res=[];
    r.forEach(function(c){
      res.push({
        id:c.id,
        ...c.data(),
      });
    });
    return cb(res);
  });
};
};
/* return the object */
return _mfirebase;
}; /* end of exports */


