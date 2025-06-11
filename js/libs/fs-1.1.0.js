/* fs.js - version 1.1.0
 , ~ file system
 , authored by 9r3i
 , https://github.com/9r3i
 , started august 11th 2017
 , this class is require: cordova-plugin-file */
;function fs(){
this.version='1.1.0';
this.on=false;
if(typeof cordova==='undefined'||!cordova.file||!window.resolveLocalFileSystemURL){
  this.on=false;return false;
}this.on=true;
window.fsopen=window.fsopen||window.resolveLocalFileSystemURL;
this.iapp=cordova.file.applicationStorageDirectory;
this.iappfiles=cordova.file.dataDirectory;
this.iappcache=cordova.file.cacheDirectory;
this.xapp=cordova.file.externalApplicationStorageDirectory;
this.xappfiles=cordova.file.externalDataDirectory;
this.xappcache=cordova.file.externalCacheDirectory;
this.xroot=cordova.file.externalRootDirectory;
this.asset=cordova.file.applicationDirectory;
this.movedir=function(dnf,tn,cb,er){
  var dx=this.parseDNF(dnf);
  var tx=this.parseDNF(tn);
  var ttx=this.parseDNF(tx.dn);
  this.open(dx.dn,function(diro){
    window.fsopen(ttx.dn,function(dirt){
      diro.getDirectory(dx.fn,{create:false},function(dr){
        dirt.getDirectory(ttx.fn,{create:false},function(dt){
          dr.moveTo(dt,tx.fn,cb,er);
        },er);
      },er);
    },er);
  },er);
};
this.copydir=function(dnf,tn,cb,er){
  var dx=this.parseDNF(dnf);
  var tx=this.parseDNF(tn);
  var ttx=this.parseDNF(tx.dn);
  this.open(dx.dn,function(diro){
    window.fsopen(ttx.dn,function(dirt){
      diro.getDirectory(dx.fn,{create:false},function(dr){
        dirt.getDirectory(ttx.fn,{create:false},function(dt){
          dr.copyTo(dt,tx.fn,cb,er);
        },er);
      },er);
    },er);
  },er);
};
this.move=function(dnf,tn,cb,er){
  var dx=this.parseDNF(dnf);
  var tx=this.parseDNF(tn);
  var ttx=this.parseDNF(tx.dn);
  this.open(dx.dn,function(diro){
    window.fsopen(ttx.dn,function(dirt){
      diro.getFile(dx.fn,{create:false},function(dr){
        dirt.getDirectory(ttx.fn,{create:false},function(dt){
          dr.moveTo(dt,tx.fn,cb,er);
        },er);
      },er);
    },er);
  },er);
};
this.copy=function(dnf,tn,cb,er){
  var dx=this.parseDNF(dnf);
  var tx=this.parseDNF(tn);
  var ttx=this.parseDNF(tx.dn);
  this.open(dx.dn,function(diro){
    window.fsopen(ttx.dn,function(dirt){
      diro.getFile(dx.fn,{create:false},function(dr){
        dirt.getDirectory(ttx.fn,{create:false},function(dt){
          dr.copyTo(dt,tx.fn,cb,er);
        },er);
      },er);
    },er);
  },er);
};
this.read=function(dnf,s,l,cb,er){
  var dx=this.parseDNF(dnf);
  s=s?s:0;
  this.open(dx.dn,function(diro){
    diro.getFile(dx.fn,{create:false},function(r){
      r.file(function(d){
        l=l?Math.min((l+s),d.size):d.size;
        var FR=new FileReader();
        FR.onloadend=function(e){
          if(typeof cb=='function'){return cb(this.result,d);}
        };FR.readAsBinaryString(d.slice(s,l)); /* FR.readAsText(d.slice(s,l)); */
      },er);
    },er);
  },er);
};
this.readAsArrayBuffer=function(dnf,cb,er){
  var dx=this.parseDNF(dnf);
  this.open(dx.dn,function(diro){
    diro.getFile(dx.fn,{create:false},function(r){
      r.file(function(d){
        var FR=new FileReader();
        FR.onloadend=function(e){
          if(typeof cb=='function'){return cb(this.result,d);}
        };FR.readAsArrayBuffer(d);
      },er);
    },er);
  },er);
};
this.delete=function(dnf,cb,er){
  var dx=this.parseDNF(dnf);
  this.open(dx.dn,function(diro){
    diro.getFile(dx.fn,{create:false},function(fr){
      fr.remove(cb,er);
    },er);
  },er);
};
this.write=function(dnf,con,pos,cb,er){
  var dx=this.parseDNF(dnf);
  this.open(dx.dn,function(diro){
    diro.getFile(dx.fn,{create:(pos==0?true:false)},function(r){
      r.createWriter(function(FW){
        pos=pos?pos:0;
        pos=pos=='end'?FW.length:parseInt(pos);
        pos=pos<0?FW.length-pos:pos;
        FW.seek(pos);
        var blob=new Blob([con.toString()],{type:'text/plain'});
        FW.write(blob);
        if(typeof cb=='function'){return cb(blob.size);}
      },er);
    },er);
  },er);
};
this.dir=function(dn,cb,er){
  this.open(dn,function(diro){
    var DR=diro.createReader();
    DR.readEntries(cb,er);
  },er);
};
this.mkdir=function(dnf,cb,er){
  var dx=this.parseDNF(dnf);
  this.open(dx.dn,function(diro){
    diro.getDirectory(dx.fn,{create:true},cb,er);
  },er);
};
this.rmdir=function(dnf,cb,er){
  var dx=this.parseDNF(dnf);
  this.open(dx.dn,function(diro){
    diro.getDirectory(dx.fn,{create:false},function(r){
      r.remove(cb,er);
    },er);
  },er);
};
this.rmdirx=function(dnf,cb,er){
  var dx=this.parseDNF(dnf);
  this.open(dx.dn,function(diro){
    diro.getDirectory(dx.fn,{create:false},function(r){
      r.removeRecursively(cb,er);
    },er);
  },er);
};
this.open=function(dn,cb,er){
  window.resolveLocalFileSystemURL(dn,cb,er);
};
this.parseDNF=function(dnf){
  if(typeof dnf!=='string'){return;}
  if(dnf.match(/\/$/)){dnf=dnf.replace(/\/$/,'');}
  return {
    dn:dnf.replace(/[^\/]+$/ig,''),
    fn:dnf.match(/[^\/]+$/ig)[0],
    origin:dnf
  };
};
this.error=function(e){
  console.log(e);
};
this.temp=function(){
  return false;
};};
