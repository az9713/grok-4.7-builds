
function drawFilm(t){
  const P=Kit.PAL;
  Kit.rect(0,0,1280,720,'#1a1020',{stroke:false});
  Kit.rect(80,360,1120,200,'#c45a4a');
  Kit.rect(80,360,1120,16,P.white,{stroke:false});
  const x=240+ (t*40)%800;
  Kit.person(x,250,1.4,'#f2c14e');
  Kit.circle(x+80,300,22,'#e8e8ea');
  Kit.person(900,260,1.2,'#222');
  if(Math.floor(t*2)%4===0) Kit.circle(1040,180,10,P.white);
  const hx=400+ (t*30)%600, hy=200+Math.sin(t*3)*20;
  Kit.circle(hx,hy,18,'#d0d4dc');
  Kit.rect(0,560,1280,160,'#120814',{stroke:false});
}
