function buchatx(ui,args){
this.version='1.0.0';
window._buchatx=this;
this.init=function(ui,args){
  _mobile.loadStyleFile('apps/installer/installer.css');
  /* prepare dialog ui */
  this.ui=ui;
  var url='https://sabunjelly.com/buchat/index.html',
  loader=this.loader(),
  frame=ui.iframe(url);
  frame.onload=function(e){
    loader.remove();
  };
  frame.onerror=function(e){
    loader.remove();
    ui.body.innerText='Error: Failed to load.';
  };
};
this.close=function(){
  return this.ui.close();
};
/* loader */
this.loader=function(){
  var main=this.ui.buildElement('div',null,{
    'class':'lds-roller',
  }),
  pmain=this.ui.buildElement('div',null,{
    'class':'installer-loader',
    id:'installer-loader'
  },[main]);
  for(var i=0;i<8;i++){
    this.ui.buildElement('div').appendTo(main);
  }
  pmain.remove=function(){
    return pmain.parentNode.removeChild(pmain);
  };
  pmain.appendTo(this.ui.body);
  return pmain;
};
}