/* donate
 * ~ written to store, in app purchase
 * ~ cloned from storing
 * authored by 9r3i
 * https://github.com/9r3i
 * started at february 8th 2022
 * storing is started at december 14th 2021
 * @requires:
 *  - index.js and its dependencies
 *  - cordova-plugin-purchase
 *    -- github.com/j3k0/cordova-plugin-purchase/
 */
;function donate(prods){
this.version='1.0.0';
this.prods=Array.isArray(prods)?prods:[];
this.upper=null;
window._donate=this;
this.page=function(res){
  this.upper=res.buildElement('div');
  this.upper.appendTo(res.content);
  /* pre element */
  var resEl=res.buildElement('div',null,{'class':'each'},[
    res.buildElement('pre',null,{
      'class':'result-code',
      'id':'donate-put-time',
    }),
    res.buildElement('pre',null,{
      'class':'result-code',
      'id':'donate-put-result',
    }),
  ]);
  resEl.appendTo(res.content);
  this.put({
    type:'playstore',
    market:'android-playstore',
    error:false,
    status:'Loading...',
    products:{},
  });
  /* undefined store */
  if(!window.store){
    return this.put({
      type:'playstore',
      error:'store is not ready yet',
    });
  }
  /* register ans refresh, store by playstore */
  for(var i in this.prods){
    store.register({
      id:this.prods[i],
      alias:this.prods[i].replace(/^[a-z0-9]+\./,''),
      type:store.CONSUMABLE,
    });
  }
  /* set validator */
  store.validator='https://9r3i.web.id/api/ucheck/';
};
/* ========== start of none-inner methods ========== */
this.on=function(res){
  /* undefined store */
  if(!window.store){
    return _donate.put({
      type:'on',
      error:'store is not ready yet',
    });
  }
  _donate.put({
      type:'on',
      error:'store is ready now',
      products:_donate.prods,
  });
  /* store refresh */
  store.refresh();
  _donate.updated(res);
  /* store update */
  store.when(store.CONSUMABLE).updated(function(){
    return _donate.updated(res);
  });
  /* approved and verified */
  store.when(store.CONSUMABLE).approved(_donate.approved);
  store.when(store.CONSUMABLE).verified(_donate.verified);
  /* store error */
  _donate.errorHandler=store.error(_donate.errored);
};
this.off=function(){
  if(!window.store){
    return _donate.put({
      type:'off',
      error:'store is not ready yet',
    });
  }
  var methods=[
    _donate.errorHandler,
    _donate.errored,
    _donate.verified,
    _donate.approved,
    _donate.updated,
  ];
  for(var i in methods){
    store.off(methods[i]);
  }
};
this.updated=function(res){
  /* set buttons */
  var buttons={},products={},prod=0;
  _donate.upper.innerHTML='';
  for(var i in _donate.prods){
    var p=store.get(_donate.prods[i]);
    if(!p){
      res.buildElement('div',
        'Product "'+_donate.prods[i]+'" is not available.',{
        'class':'donate-section',
        'id':'section-'+_donate.prods[i],
      }).appendTo(_donate.upper); 
      continue;
    }
    products[p.id]=p;
    var id=_donate.prods[i],
    title=res.buildElement('div',null,{},[
      res.buildElement('strong',p.title)
    ]),
    desc=res.buildElement('div',null,{},[
      res.buildElement('p',p.description)
    ]),
    price=res.buildElement('div',null,{},[
      res.buildElement('em',p.price)
    ]),
    ket=res.buildElement('div',null,{},[
      res.buildElement('div','state: '+p.state),
      res.buildElement('div','transactionID: '
        +(p.transaction?p.transaction.id:'null')),
    ]);
    buttons[p.id]=res.buildElement('button',p.title+' for '+p.price,{
      'class':'button button-blue',
      'id':p.id,
      'data-id':p.id,
    });
    res.buildElement('div',null,{
      'class':'donate-section',
      'id':'section-'+p.id,
    },[
      title,
      price,
      desc,
      buttons[p.id],
      ket,
    ]).appendTo(_donate.upper); 
    buttons[p.id].disabled=!p.canPurchase?true:false;
    buttons[p.id].onclick=function(e){
      store.order(this.dataset.id);
    };
    /* approved report */
    if(p.state=='approved'||p.transaction!==null){
      buttons[p.id].dataset.text=buttons[p.id].innerText;
      buttons[p.id].innerText='Processing...';
      p.verify();
      p.finish();
      store.refresh();
      _index.splash('Thank you very much!');
      prod++;
    }else if(p.state=='verified'){
      p.finish();
      store.refresh();
    }
  }
  /* print output */
  _donate.put({
    type:'updated',
    active:prod,
  });
};
this.approved=function(p){
  p.verify();
};
this.verified=function(p){
  p.finish();
};
this.errored=function(e){
  return _donate.put({
    type:'error',
    error:e,
  });
};
/* ========== end of none-inner methods ========== */
this.put=function(o){
  var t=document.getElementById('donate-put-time');
  var c=document.getElementById('donate-put-result');
  if(t){t.innerText=(new Date).toString();}
  if(!c){return false;}
  c.innerText=_index.parse(o,3);
  return true;
};
this.init=function(){
  if(!window.store){return false;}
  return true;
};
this.temp=function(){
  return false;
};
this.init();
return this;
};


