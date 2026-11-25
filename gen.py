import json,re,unicodedata
# name|club|category|price|kit1|kit2|skin|hair|number
P="""Cristiano Ronaldo CR7|Real Madrid|realmadrid|29.99|#f5f5f5|#febe10|#e0ac82|#2a1a10|7
Jude Bellingham|Real Madrid|realmadrid|27.99|#f5f5f5|#febe10|#8d5a3b|#1b1b1b|5
Vinícius Jr.|Real Madrid|realmadrid|27.99|#f5f5f5|#00529f|#6b4129|#1b1b1b|7
Luka Modrić|Real Madrid|realmadrid|24.99|#f5f5f5|#febe10|#e8bf9b|#c9a35a|10
Sergio Ramos|Real Madrid|realmadrid|24.99|#f5f5f5|#febe10|#e0ac82|#2a1a10|4
Karim Benzema|Real Madrid|realmadrid|25.99|#f5f5f5|#febe10|#d9a77e|#1b1b1b|9
Rodrygo|Real Madrid|realmadrid|23.99|#f5f5f5|#febe10|#8d5a3b|#1b1b1b|11
Thibaut Courtois|Real Madrid|goalkeepers|26.99|#2e8b57|#111111|#e8bf9b|#4a3320|1
Lionel Messi|Barcelona|barcelona|29.99|#a50044|#004d98|#e0ac82|#4a3320|10
Lamine Yamal|Barcelona|barcelona|27.99|#a50044|#004d98|#8d5a3b|#1b1b1b|19
Robert Lewandowski|Barcelona|barcelona|25.99|#a50044|#004d98|#e8bf9b|#4a3320|9
Pedri|Barcelona|barcelona|23.99|#a50044|#004d98|#e0ac82|#2a1a10|8
Gavi|Barcelona|barcelona|22.99|#a50044|#004d98|#e0ac82|#2a1a10|6
Marc-André ter Stegen|Barcelona|goalkeepers|25.99|#f39c12|#111111|#e8bf9b|#c9a35a|1
Marcus Rashford|Manchester United|manutd|24.99|#da291c|#fbe122|#6b4129|#1b1b1b|10
Bruno Fernandes|Manchester United|manutd|24.99|#da291c|#fbe122|#e0ac82|#2a1a10|8
Casemiro|Manchester United|manutd|22.99|#da291c|#fbe122|#d9a77e|#1b1b1b|18
Erling Haaland|Manchester City|mancity|29.99|#6cabdd|#1c2c5b|#f0cfb0|#e5c071|9
Kevin De Bruyne|Manchester City|mancity|27.99|#6cabdd|#1c2c5b|#f0cfb0|#c46a3a|17
Phil Foden|Manchester City|mancity|25.99|#6cabdd|#1c2c5b|#f0cfb0|#e5c071|47
Rodri|Manchester City|mancity|24.99|#6cabdd|#1c2c5b|#e0ac82|#2a1a10|16
Kylian Mbappé|PSG|psg|29.99|#004170|#da291c|#6b4129|#1b1b1b|7
Neymar Jr.|PSG|psg|28.99|#004170|#da291c|#c68a62|#1b1b1b|10
Ousmane Dembélé|PSG|psg|24.99|#004170|#da291c|#8d5a3b|#1b1b1b|10
Mohamed Salah|Liverpool|liverpool|28.99|#c8102e|#f6eb61|#a9724d|#1b1b1b|11
Virgil van Dijk|Liverpool|liverpool|25.99|#c8102e|#f6eb61|#8d5a3b|#1b1b1b|4
Trent Alexander-Arnold|Liverpool|liverpool|23.99|#c8102e|#f6eb61|#e0ac82|#2a1a10|66
Alisson Becker|Liverpool|goalkeepers|25.99|#7d3cff|#111111|#d9a77e|#1b1b1b|1
Harry Kane|Bayern Munich|bayern|28.99|#dc052d|#0066b2|#f0cfb0|#6b4a2a|9
Jamal Musiala|Bayern Munich|bayern|25.99|#dc052d|#0066b2|#8d5a3b|#1b1b1b|42
Manuel Neuer|Bayern Munich|goalkeepers|26.99|#1abc9c|#111111|#f0cfb0|#c9a35a|1
Bukayo Saka|Arsenal|arsenal|25.99|#ef0107|#ffffff|#6b4129|#1b1b1b|7
Martin Ødegaard|Arsenal|arsenal|24.99|#ef0107|#ffffff|#f0cfb0|#c9a35a|8
Declan Rice|Arsenal|arsenal|23.99|#ef0107|#ffffff|#f0cfb0|#2a1a10|41
Cole Palmer|Chelsea|chelsea|25.99|#034694|#ffffff|#a9724d|#1b1b1b|20
Enzo Fernández|Chelsea|chelsea|22.99|#034694|#ffffff|#d9a77e|#1b1b1b|8
Son Heung-min|South Korea|national|25.99|#c60c30|#003478|#e8bf9b|#1b1b1b|7
Christian Pulisic|USA|national|23.99|#ffffff|#1c2c5b|#f0cfb0|#2a1a10|10
Pelé|Brazil|legends|34.99|#fedf00|#009c3b|#6b4129|#1b1b1b|10
Diego Maradona|Argentina|legends|34.99|#75aadb|#ffffff|#d9a77e|#1b1b1b|10
Ronaldinho|Brazil|legends|32.99|#fedf00|#009c3b|#8d5a3b|#1b1b1b|10
Zinedine Zidane|France|legends|32.99|#1c3f94|#ffffff|#d9a77e|#1b1b1b|10
David Beckham|England|legends|32.99|#ffffff|#c8102e|#f0cfb0|#c9a35a|7
Ronaldo Nazário|Brazil|legends|32.99|#fedf00|#009c3b|#d9a77e|#1b1b1b|9
Zlatan Ibrahimović|AC Milan|legends|31.99|#fb090b|#111111|#d9a77e|#2a1a10|11
Thierry Henry|Arsenal|legends|31.99|#ef0107|#ffffff|#8d5a3b|#1b1b1b|14
Johan Cruyff|Netherlands|legends|31.99|#ff6600|#ffffff|#f0cfb0|#6b4a2a|14
Paolo Maldini|AC Milan|legends|31.99|#fb090b|#111111|#e8bf9b|#2a1a10|3
Kaká|AC Milan|legends|30.99|#fb090b|#111111|#d9a77e|#2a1a10|22
Andrés Iniesta|Barcelona|legends|30.99|#a50044|#004d98|#f0cfb0|#6b4a2a|8
Xavi Hernández|Barcelona|legends|30.99|#a50044|#004d98|#e0ac82|#2a1a10|6
Francesco Totti|AS Roma|legends|30.99|#8e1f2f|#f0bc42|#e0ac82|#2a1a10|10
Steven Gerrard|Liverpool|legends|30.99|#c8102e|#f6eb61|#f0cfb0|#c9a35a|8
Eric Cantona|Manchester United|legends|31.99|#da291c|#fbe122|#e8bf9b|#2a1a10|7
Didier Drogba|Chelsea|legends|30.99|#034694|#ffffff|#4a2c1a|#1b1b1b|11
Frank Lampard|Chelsea|legends|29.99|#034694|#ffffff|#f0cfb0|#2a1a10|8
Gianluigi Buffon|Juventus|goalkeepers|29.99|#111111|#ffffff|#e8bf9b|#2a1a10|1
Iker Casillas|Real Madrid|goalkeepers|29.99|#f1c40f|#111111|#e0ac82|#2a1a10|1
Lionel Messi World Cup 2022 Edition|Argentina|special|44.99|#75aadb|#ffffff|#e0ac82|#4a3320|10
Cristiano Ronaldo Euro 2016 Edition|Portugal|special|44.99|#c8102e|#046a38|#e0ac82|#2a1a10|7
Kylian Mbappé World Cup 2018 Edition|France|special|42.99|#1c3f94|#ffffff|#6b4129|#1b1b1b|10
Pelé Golden Edition|Brazil|special|59.99|#d4af37|#009c3b|#6b4129|#1b1b1b|10"""
def slug(s):
  s=unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower()
  return re.sub(r'[^a-z0-9]+','-',s).strip('-')
def svg(c1,c2,sk,hr,no):
  return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><radialGradient id="g" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#fbf8f2"/><stop offset="1" stop-color="#e7d8c5"/></radialGradient><linearGradient id="s" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#000" stop-opacity=".15"/></linearGradient></defs><rect width="400" height="400" fill="url(#g)"/><ellipse cx="200" cy="352" rx="100" ry="16" fill="#000" opacity=".18"/><rect x="120" y="335" width="160" height="16" rx="8" fill="#8b6b4a"/><rect x="165" y="270" width="26" height="62" rx="12" fill="{sk}"/><rect x="209" y="270" width="26" height="62" rx="12" fill="{sk}"/><rect x="158" y="318" width="40" height="18" rx="9" fill="#171717"/><rect x="202" y="318" width="40" height="18" rx="9" fill="#171717"/><rect x="150" y="245" width="100" height="45" rx="14" fill="{c2}"/><rect x="140" y="160" width="120" height="110" rx="34" fill="{c1}"/><rect x="140" y="160" width="120" height="110" rx="34" fill="url(#s)"/><rect x="100" y="172" width="34" height="70" rx="17" fill="{c1}"/><rect x="266" y="172" width="34" height="70" rx="17" fill="{c1}"/><circle cx="117" cy="246" r="14" fill="{sk}"/><circle cx="283" cy="246" r="14" fill="{sk}"/><text x="200" y="232" font-family="Arial,sans-serif" font-weight="900" font-size="46" text-anchor="middle" fill="{c2}" stroke="#0003" stroke-width="1">{no}</text><circle cx="200" cy="112" r="62" fill="{sk}"/><path d="M138 108a62 62 0 0 1 124 0c-20-22-104-22-124 0z" fill="{hr}"/><circle cx="178" cy="122" r="7" fill="#171717"/><circle cx="222" cy="122" r="7" fill="#171717"/><path d="M182 145q18 14 36 0" stroke="#171717" stroke-width="4" fill="none" stroke-linecap="round"/></svg>'''
out=[];seen=set()
for i,l in enumerate(P.split('\n'),1):
  n,club,cat,pr,c1,c2,sk,hr,no=l.split('|')
  s=slug(n);assert s not in seen;seen.add(s)
  open(f'assets/products/{s}.svg','w').write(svg(c1,c2,sk,hr,no))
  player=re.sub(r' (World Cup|Euro|Golden).*$','',n)
  out.append(dict(id=i,name=n,player=player,club=club,category=cat,image=f'assets/products/{s}.svg',price=float(pr),stock=(i*7)%18+3,height=12+i%4,material='Polymer clay',rating=round(4.2+(i*3%8)/10,1),isNew=i%7==0,isBest=i%5==0,sold=(i*37)%500+50))
open('products.js','w').write('const PRODUCTS='+json.dumps(out,ensure_ascii=False)+';\nif(typeof module!=="undefined")module.exports=PRODUCTS;\n')
print(len(out))
