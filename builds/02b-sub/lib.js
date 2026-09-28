
const Kit = (() => {
  const PAL = {
    ink:'#1c140e', paper:'#f4e6cc', skin:'#e7b48a', cloth:'#f7f3ea',
    wood:'#8a5a32', night:'#1a2238', warm:'#f2a35a', sea:'#1d3d55',
    red:'#c83a3a', yellow:'#f2c14e', white:'#f7f4ee'
  };
  const K = { PAL, t:0, boil:0, n:0 };
  K.begin = t => { K.t=t; K.boil=Math.floor(t*8); K.n=0; };
  function seed(){ randomSeed((K.n++*997 + K.boil*131) >>> 0); }
  function style(color, o={}){
    if (o.stroke===false) brush.noStroke();
    else brush.set('pen', o.ink||PAL.ink, o.weight||3);
    if (color) brush.wash(color, o.alpha==null?220:o.alpha); else brush.noWash();
    brush.noFill(); brush.noHatch();
  }
  K.poly = (pts,color,o={}) => { seed(); style(color,o); brush.polygon(pts); brush.noWash(); };
  K.rect = (x,y,w,h,color,o={}) => K.poly([[x,y],[x+w,y],[x+w,y+h],[x,y+h]], color, o);
  K.circle = (x,y,r,color,o={}) => { seed(); style(color,o); brush.circle(x,y,r); brush.noWash(); };
  K.line = (x1,y1,x2,y2,o={}) => { seed(); brush.set('pen', o.color||PAL.ink, o.weight||3); brush.line(x1,y1,x2,y2); };
  K.person = (x,y,scale,shirt) => {
    K.rect(x-16*scale,y,32*scale,46*scale,shirt);
    K.circle(x,y-10*scale,16*scale,PAL.skin);
    K.rect(x-18*scale,y+46*scale,12*scale,28*scale,PAL.ink);
    K.rect(x+6*scale,y+46*scale,12*scale,28*scale,PAL.ink);
  };
  return K;
})();
