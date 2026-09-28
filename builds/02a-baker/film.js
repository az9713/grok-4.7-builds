
function drawFilm(t){
  const P=Kit.PAL;
  Kit.rect(0,0,1280,720,P.night,{stroke:false});
  Kit.rect(80,80,1120,520,'#2a211c');
  Kit.rect(140,140,420,300,'#f6e2b8');
  const glow=140+Math.sin(t)*8;
  Kit.rect(180,glow+40,80,70,P.warm,{stroke:false});
  Kit.person(360,250,1.3,'#f7f3ea');
  Kit.rect(300,470,160,70,'#c9843a');
  const rise=Math.min(46,(t/40)*46);
  Kit.rect(330,500-rise,100,20+rise,'#e6c07a');
  Kit.circle(520,430,18,'#6a6a6a');
  Kit.line(500,430,470,450,{weight:2});
  if(t>30){
    const x=700+((t-30)*8)%500;
    Kit.circle(x,520,16,P.yellow);
    Kit.rect(x-30,500,70,16,'#223');
  }
  Kit.rect(0,560,1280,160,'#14110e',{stroke:false});
}
