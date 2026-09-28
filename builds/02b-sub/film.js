
function drawFilm(t){
  const P=Kit.PAL;
  Kit.rect(0,0,1280,720,'#0c141c',{stroke:false});
  Kit.rect(160,120,960,480,'#1a2833');
  Kit.circle(420,250,70,'#8a9280');
  const drip=200+(t*18)%160;
  Kit.line(420,180,420,drip,{color:'#9fd0e0',weight:2});
  Kit.person(780,240,1.5,'#243044');
  const bx=640+Math.sin(t*0.4)*80, by=460+Math.sin(t*0.7)*10;
  Kit.poly([[bx,by],[bx+40,by+16],[bx,by+28],[bx-10,by+14]], P.white);
  Kit.rect(0,560,1280,160,'#070b10',{stroke:false});
}
