'use strict';
// İlk deneme: koridor + 1 kapı + 1 oda (1 fotoğraf, 1 şarkı)

const ODA1 = {
  foto: 'foto/oda1-1.jpg',
  yazi: 'Buzda ikimiz',
  sarki: 'muzik/kupa-kizi.mp3'
};

const SURUS_AKTIF = false;   // koltuk ve uzaktan sürüş şimdilik kapalı (İREM parkuru odasında yeniden kullanılacak)
const KAPILAR_ACIK = false;   // hazırlık sırasında true yapılırsa tüm kapılar açık başlar (kontrol hızlı olsun). false: kapılar normal çalışır
const canvas = document.getElementById('sahne');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
const sahne = new THREE.Scene();
const ZEMIN = 0x0b0a0f;
sahne.background = new THREE.Color(ZEMIN);
sahne.fog = new THREE.FogExp2(ZEMIN, 0.024);
const kamera = new THREE.PerspectiveCamera(70, 1, 0.05, 60);
kamera.rotation.order = 'YXZ';

function boyutla() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  kamera.aspect = w / h;
  kamera.fov = w / h < 1 ? 78 : 66;
  kamera.updateProjectionMatrix();
}
window.addEventListener('resize', boyutla);
boyutla();

// ---------- Düzen ----------
const KOR_X = 1.5, KOR_BAS = 4, KAPI_Z = -16, ODA_SON = -27, ODA_X = 5.5, YUKSEK = 3, ODA_Y = 4;

sahne.add(new THREE.AmbientLight(0x45354c, 0.5));

const matZemin = new THREE.MeshPhongMaterial({ specular: 0x110d08, shininess: 6,  color: 0x2b1d17 });
const matDuvar = new THREE.MeshPhongMaterial({ specular: 0x110d08, shininess: 6,  color: 0x5a4636 });
const matOda = new THREE.MeshPhongMaterial({ specular: 0x110d08, shininess: 6,  color: 0x362f3d });

function kutu(w, h, d, mat, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  sahne.add(m);
  return m;
}

// koridor
const korUzun = KOR_BAS - KAPI_Z;
const korOrta = (KOR_BAS + KAPI_Z) / 2;
kutu(KOR_X * 2, 0.1, korUzun, matZemin, 0, -0.05, korOrta);
kutu(KOR_X * 2, 0.1, korUzun, matDuvar, 0, YUKSEK + 0.05, korOrta);
kutu(0.1, YUKSEK, korUzun, matDuvar, -KOR_X - 0.05, YUKSEK / 2, korOrta);
kutu(0.1, YUKSEK, korUzun, matDuvar, KOR_X + 0.05, YUKSEK / 2, korOrta);
kutu(KOR_X * 2, YUKSEK, 0.1, matDuvar, 0, YUKSEK / 2, KOR_BAS + 0.05);

// kapı duvarı (ortada 1.6 genişliğinde, 2.5 yüksekliğinde boşluk)
const AC_GEN = 1.6, AC_YUK = 2.5;
const yanGen = KOR_X - AC_GEN / 2;
kutu(yanGen, YUKSEK, 0.1, matDuvar, -(AC_GEN / 2 + yanGen / 2), YUKSEK / 2, KAPI_Z);
kutu(yanGen, YUKSEK, 0.1, matDuvar, AC_GEN / 2 + yanGen / 2, YUKSEK / 2, KAPI_Z);
kutu(AC_GEN, YUKSEK - AC_YUK, 0.1, matDuvar, 0, AC_YUK + (YUKSEK - AC_YUK) / 2, KAPI_Z);

// kapı kasası ve kanat
const matKasa = new THREE.MeshPhongMaterial({ specular: 0x110d08, shininess: 6,  color: 0xb08a4f });
kutu(0.08, AC_YUK, 0.16, matKasa, -AC_GEN / 2, AC_YUK / 2, KAPI_Z);
kutu(0.08, AC_YUK, 0.16, matKasa, AC_GEN / 2, AC_YUK / 2, KAPI_Z);
kutu(AC_GEN + 0.08, 0.08, 0.16, matKasa, 0, AC_YUK, KAPI_Z);
const kapiMenteşe = new THREE.Group();
kapiMenteşe.position.set(-AC_GEN / 2, 0, KAPI_Z);
const kanat = new THREE.Mesh(new THREE.BoxGeometry(AC_GEN - 0.02, AC_YUK - 0.02, 0.06),
  new THREE.MeshPhongMaterial({ specular: 0x110d08, shininess: 6,  color: 0x7a4a2a }));
kanat.position.set(AC_GEN / 2, AC_YUK / 2, 0);
kapiMenteşe.add(kanat);
const kol = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), new THREE.MeshPhongMaterial({ specular: 0x110d08, shininess: 6,  color: 0xd9b56b }));
kol.position.set(AC_GEN - 0.15, 1.05, 0.06);
kapiMenteşe.add(kol);
// kapı süsü ve yazısı
(function kapiYazisi() {
  const W = 1024, H = 1580;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  const kalp = (cx, cy, b) => {
    x.beginPath();
    x.moveTo(cx, cy + b * 0.5);
    x.bezierCurveTo(cx - b * 0.15, cy + b * 0.35, cx - b * 0.6, cy + b * 0.05, cx - b * 0.6, cy - b * 0.22);
    x.bezierCurveTo(cx - b * 0.6, cy - b * 0.5, cx - b * 0.2, cy - b * 0.62, cx, cy - b * 0.3);
    x.bezierCurveTo(cx + b * 0.2, cy - b * 0.62, cx + b * 0.6, cy - b * 0.5, cx + b * 0.6, cy - b * 0.22);
    x.bezierCurveTo(cx + b * 0.6, cy + b * 0.05, cx + b * 0.15, cy + b * 0.35, cx, cy + b * 0.5);
    x.closePath();
  };
  const ayirac = (y, gen) => {
    x.beginPath(); x.moveTo(W / 2 - gen, y); x.lineTo(W / 2 - 40, y);
    x.moveTo(W / 2 + 40, y); x.lineTo(W / 2 + gen, y); x.stroke();
    x.fillStyle = '#e0556f'; kalp(W / 2, y, 44); x.fill();
  };
  function ciz() {
    x.clearRect(0, 0, W, H);
    const altin = x.createLinearGradient(0, 0, W, H);
    altin.addColorStop(0, '#fff3cf'); altin.addColorStop(0.45, '#d9a94f'); altin.addColorStop(1, '#f7e2a6');
    x.shadowColor = 'rgba(0,0,0,.55)'; x.shadowBlur = 14; x.shadowOffsetY = 3;
    // çift çerçeve
    x.strokeStyle = altin; x.lineWidth = 6;
    x.beginPath(); x.roundRect ? x.roundRect(36, 36, W - 72, H - 72, 46) : x.rect(36, 36, W - 72, H - 72); x.stroke();
    x.lineWidth = 2.5;
    x.beginPath(); x.roundRect ? x.roundRect(64, 64, W - 128, H - 128, 30) : x.rect(64, 64, W - 128, H - 128); x.stroke();
    // köşe kalpleri
    x.fillStyle = '#e0556f';
    [[104, 104], [W - 104, 104], [104, H - 104], [W - 104, H - 104]].forEach(p => { kalp(p[0], p[1], 38); x.fill(); });
    // üst süs
    x.strokeStyle = altin; x.lineWidth = 3;
    ayirac(340, 260);
    // yazı
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = altin;
    const yaz = (t, y, bas, enCok) => {
      let b = bas;
      x.font = b + 'px "Great Vibes", "Snell Roundhand", "Brush Script MT", cursive';
      while (x.measureText(t).width > enCok && b > 40) { b -= 4; x.font = b + 'px "Great Vibes", "Snell Roundhand", "Brush Script MT", cursive'; }
      x.fillText(t, W / 2, y);
    };
    yaz('Gülüm', 205, 200, 700);
    yaz('Her şey', 560, 260, 780);
    yaz('burada', 790, 260, 780);
    yaz('başladı', 1020, 260, 780);
    // alt süs ve baş harfler
    x.strokeStyle = altin; x.lineWidth = 3;
    ayirac(1190, 260);
    yaz('İ  &  M', 1340, 130, 600);
    tex.needsUpdate = true;
  }
  ciz();
  if (document.fonts && document.fonts.load) {
    document.fonts.load('100px "Great Vibes"', 'Her şey burada başladı İ').then(ciz).catch(() => {});
  }
  const p = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.3 * H / W),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, fog: false }));
  p.position.set(AC_GEN / 2, 1.2, 0.035);
  kapiMenteşe.add(p);
})();
sahne.add(kapiMenteşe);

// oda
const odaUzun = KAPI_Z - ODA_SON;
const odaOrta = (KAPI_Z + ODA_SON) / 2;
const YANSIMA = false; // zemindeki ışık yansımaları (kapalı)
const BUZ = true; // false yapılırsa eski koyu zemine ve normal yürümeye döner
function buzDokusu() {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 512, 512);
  g.addColorStop(0, '#e4f0fa'); g.addColorStop(0.5, '#cfe2f1'); g.addColorStop(1, '#e9f3fb');
  x.fillStyle = g; x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 90; i++) {   // patenlerin bıraktığı ince çizgiler
    x.strokeStyle = Math.random() < 0.5 ? 'rgba(255,255,255,.8)' : 'rgba(90,135,180,.45)';
    x.lineWidth = 0.9 + Math.random() * 1.6;
    x.beginPath();
    const x0 = Math.random() * 512, y0 = Math.random() * 512;
    x.moveTo(x0, y0);
    x.quadraticCurveTo(x0 + (Math.random() - 0.5) * 260, y0 + (Math.random() - 0.5) * 260, x0 + (Math.random() - 0.5) * 380, y0 + (Math.random() - 0.5) * 380);
    x.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); t.anisotropy = 4;
  return t;
}
const zeminMat = BUZ
  ? new THREE.MeshPhongMaterial({ color: 0x4a6278, emissive: 0x0e1c28, map: buzDokusu(), specular: 0x000000, shininess: 5 })
  : new THREE.MeshPhongMaterial({ specular: 0x110d08, shininess: 6, color: 0x1d1723 });
kutu(ODA_X * 2, 0.1, odaUzun, zeminMat, 0, -0.05, odaOrta);
// yansıma parıltıları için ortak yumuşak ışık dokusu
function radyalDoku(r, g, b) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d');
  const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',1)'); gr.addColorStop(0.45, 'rgba(' + r + ',' + g + ',' + b + ',.4)'); gr.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)');
  x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}
const sicakDoku = radyalDoku(255, 190, 110), soguDoku = radyalDoku(190, 220, 255);
function zeminParilti(doku, x, z, gen, derin, op) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(gen, derin),
    new THREE.MeshBasicMaterial({ map: doku, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  m.rotation.x = -Math.PI / 2; m.position.set(x, 0.022, z);
  sahne.add(m);
  return m;
}
kutu(ODA_X * 2, 0.1, odaUzun, matOda, 0, ODA_Y + 0.05, odaOrta);
kutu(0.1, ODA_Y, odaUzun, matOda, -ODA_X - 0.05, ODA_Y / 2, odaOrta);
// sağ duvar: sonraki odanın kapısı için boşluklu
kutu(0.1, ODA_Y, 7.65, matOda, ODA_X + 0.05, ODA_Y / 2, -23.175);
kutu(0.1, ODA_Y, 2.05, matOda, ODA_X + 0.05, ODA_Y / 2, -17.025);
kutu(0.1, ODA_Y - 2.45, 1.3, matOda, ODA_X + 0.05, 2.45 + (ODA_Y - 2.45) / 2, -18.7);
kutu(ODA_X * 2, ODA_Y, 0.1, matOda, 0, ODA_Y / 2, ODA_SON - 0.05);
// kapı hizasındaki oda duvarı (koridor genişliği dışı)
kutu(ODA_X - KOR_X, ODA_Y, 0.1, matOda, -(KOR_X + (ODA_X - KOR_X) / 2), ODA_Y / 2, KAPI_Z - 0.06);
kutu(ODA_X - KOR_X, ODA_Y, 0.1, matOda, KOR_X + (ODA_X - KOR_X) / 2, ODA_Y / 2, KAPI_Z - 0.06);
kutu(KOR_X * 2, ODA_Y - YUKSEK, 0.1, matOda, 0, YUKSEK + (ODA_Y - YUKSEK) / 2, KAPI_Z - 0.06);
// ---------- İkinci oda: kısa hol + sade, sıcak oda ----------
const HOL_Z = -18.7, HOL_SON = 8.0, ODA2_X1 = 17.5, ODA2_Z0 = -23.6, ODA2_Z1 = -13.8, ODA2_Y = 3.2;
const matZemin2 = new THREE.MeshPhongMaterial({ color: 0x6f5238, specular: 0x000000, shininess: 4 });
const matDuvar2 = new THREE.MeshPhongMaterial({ color: 0xcdb99a, specular: 0x000000, shininess: 4 });
const matTavan2 = new THREE.MeshPhongMaterial({ color: 0xe3d6bd, specular: 0x000000, shininess: 4 });
// hol
kutu(HOL_SON - ODA_X, 0.1, 1.6, matZemin2, (ODA_X + HOL_SON) / 2, -0.05, HOL_Z);
kutu(HOL_SON - ODA_X, 0.1, 1.6, matTavan2, (ODA_X + HOL_SON) / 2, 3.05, HOL_Z);
[-1, 1].forEach(y => kutu(HOL_SON - ODA_X, 3.1, 0.1, matDuvar2, (ODA_X + HOL_SON) / 2, 1.5, HOL_Z + y * 0.85));
// oda
const o2w = ODA2_X1 - HOL_SON, o2d = ODA2_Z1 - ODA2_Z0, o2cx = (HOL_SON + ODA2_X1) / 2, o2cz = (ODA2_Z0 + ODA2_Z1) / 2;
kutu(o2w, 0.1, o2d, matZemin2, o2cx, -0.05, o2cz);
kutu(o2w, 0.1, o2d, matTavan2, o2cx, ODA2_Y + 0.05, o2cz);
kutu(o2w, ODA2_Y, 0.1, matDuvar2, o2cx, ODA2_Y / 2, ODA2_Z0 - 0.05);
// kuzey duvar: gül kapısı için boşluklu (x 9.35 – 10.65)
kutu(9.35 - HOL_SON, ODA2_Y, 0.1, matDuvar2, (HOL_SON + 9.35) / 2, ODA2_Y / 2, ODA2_Z1 + 0.05);
kutu(ODA2_X1 - 10.65, ODA2_Y, 0.1, matDuvar2, (10.65 + ODA2_X1) / 2, ODA2_Y / 2, ODA2_Z1 + 0.05);
kutu(1.3, ODA2_Y - 2.45, 0.1, matDuvar2, 10.0, 2.45 + (ODA2_Y - 2.45) / 2, ODA2_Z1 + 0.05);
kutu(0.1, ODA2_Y, o2d, matDuvar2, ODA2_X1 + 0.05, ODA2_Y / 2, o2cz);
// batı duvarı (holün açıldığı yer boş)
kutu(0.1, ODA2_Y, (HOL_Z - 0.8) - ODA2_Z0, matDuvar2, HOL_SON - 0.05, ODA2_Y / 2, (ODA2_Z0 + HOL_Z - 0.8) / 2);
kutu(0.1, ODA2_Y, ODA2_Z1 - (HOL_Z + 0.8), matDuvar2, HOL_SON - 0.05, ODA2_Y / 2, (ODA2_Z1 + HOL_Z + 0.8) / 2);
const isik2 = new THREE.PointLight(0xffd9a0, 1.1, 16, 1.5);
isik2.position.set(o2cx, 2.7, o2cz);
sahne.add(isik2);
// karşı duvarda yan yana iki çocukluk fotoğrafı (yaklaştıkça netleşir)
const cocukFoto = [];
function cocukFotoGuncelle() {
  cocukFoto.forEach(f => {
    const uz = Math.hypot(kon.x - f.px, kon.z - (f.pz !== undefined ? f.pz : f.z)), md = f.m || [11, 3.8];
    const yak = yumusak(md[0], md[1], uz), mn = f.min || 0.12, p = mn + (1 - mn) * yak;
    f.net.material.color.setRGB(p, p, p);
    f.bul.material.color.setRGB(p, p, p);
    f.bul.material.opacity = 1 - yumusak(md[0] * 0.73, md[1] * 1.1, uz);
  });
}
(function cocuklukFotolari() {
  const FY = 1.6, FH = 2.1, BOSLUK = 0.5;
  const liste = [{ dosya: 'foto/cocuk1.jpg', oran: 1254 / 939 }, { dosya: 'foto/cocuk2.jpg', oran: 720 / 1280 }];
  const toplam = liste.reduce((t, f) => t + f.oran * FH, 0) + BOSLUK;
  let z = o2cz - toplam / 2;   // sol uçtan (−z) başla; +x'e bakınca sol = −z
  const cerMat = new THREE.MeshPhongMaterial({ color: 0x5a3b22, specular: 0x000000, shininess: 4 });
  liste.forEach(f => {
    const gen = f.oran * FH, zc = z + gen / 2;
    const cer = new THREE.Mesh(new THREE.BoxGeometry(0.06, FH + 0.24, gen + 0.24), cerMat);
    cer.position.set(ODA2_X1 - 0.03, FY, zc);
    sahne.add(cer);
    new THREE.TextureLoader().load(f.dosya, tex => {
      tex.anisotropy = 4;
      const img = tex.image;
      const c = document.createElement('canvas');   // bulanık sürüm
      c.width = 18; c.height = Math.max(8, Math.round(18 / f.oran));
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      const bulTex = new THREE.CanvasTexture(c);
      bulTex.magFilter = THREE.LinearFilter; bulTex.minFilter = THREE.LinearFilter;
      const net = new THREE.Mesh(new THREE.PlaneGeometry(gen, FH), new THREE.MeshBasicMaterial({ map: tex, color: 0x1f1f1f, fog: false }));
      net.position.set(ODA2_X1 - 0.065, FY, zc);
      net.rotation.y = -Math.PI / 2;     // yüzü odaya (−x) bakar
      sahne.add(net);
      const bul = new THREE.Mesh(new THREE.PlaneGeometry(gen, FH), new THREE.MeshBasicMaterial({ map: bulTex, color: 0x1f1f1f, transparent: true, fog: false }));
      bul.position.set(ODA2_X1 - 0.067, FY, zc);
      bul.rotation.y = -Math.PI / 2;
      sahne.add(bul);
      cocukFoto.push({ net, bul, z: zc, px: ODA2_X1 - 0.065, pz: zc });
    });
    z += gen + BOSLUK;
  });
})();
// tavandan sarkan, sürekli renk değiştiren ampul
const ampul = { cam: null, parilti: null };
(function ampulKur() {
  const g = new THREE.Group();
  g.position.set(o2cx, 0, o2cz);
  const kordon = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.7, 6), new THREE.MeshBasicMaterial({ color: 0x1a1612 }));
  kordon.position.y = ODA2_Y - 0.35; g.add(kordon);
  const duy = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.12, 12), new THREE.MeshPhongMaterial({ color: 0x8c8c94, specular: 0xffffff, shininess: 60 }));
  duy.position.y = ODA2_Y - 0.76; g.add(duy);
  const cam = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 16), new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false }));
  cam.scale.set(1, 1.2, 1); cam.position.y = ODA2_Y - 0.95; g.add(cam);
  const parilti = new THREE.Sprite(new THREE.SpriteMaterial({ map: radyalDoku(255, 255, 255), transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  parilti.scale.set(1.6, 1.6, 1); parilti.position.y = ODA2_Y - 0.95; g.add(parilti);
  sahne.add(g);
  ampul.cam = cam; ampul.parilti = parilti;
})();
const ampulRenk = new THREE.Color();
function ampulGuncelle(t) {
  const ton = (t * 0.2) % 1;                    // renkler sırayla akar
  ampulRenk.setHSL(ton, 0.95, 0.55);
  isik2.color.copy(ampulRenk);
  isik2.intensity = 1.5 + 0.2 * Math.sin(t * 3);
  ampul.cam.material.color.setHSL(ton, 0.7, 0.75);
  ampul.parilti.material.color.copy(ampulRenk);
  ampul.parilti.material.opacity = 0.5 + 0.15 * Math.sin(t * 2.2);
}
// yan duvarlarda şimdiki fotoğraflar: solda Mehmetnur, sağda İrem (yaklaşınca netleşir)
function duvarFotoEkle(dosya, oran, px, pz, yon) {   // yon: 'sol' (z=ODA2_Z0 duvarı) ya da 'sag' (z=ODA2_Z1 duvarı)
  const FH = 2.1, FY = 1.6, gen = oran * FH, sol = yon === 'sol';
  const duvarZ = sol ? ODA2_Z0 : ODA2_Z1, ic = sol ? 1 : -1;     // odaya doğru yön
  const cer = new THREE.Mesh(new THREE.BoxGeometry(gen + 0.24, FH + 0.24, 0.06),
    new THREE.MeshPhongMaterial({ color: 0x5a3b22, specular: 0x000000, shininess: 4 }));
  cer.position.set(px, FY, duvarZ + ic * 0.03);
  sahne.add(cer);
  new THREE.TextureLoader().load(dosya, tex => {
    tex.anisotropy = 4;
    const c = document.createElement('canvas');
    c.width = 18; c.height = Math.max(8, Math.round(18 / oran));
    c.getContext('2d').drawImage(tex.image, 0, 0, c.width, c.height);
    const bulTex = new THREE.CanvasTexture(c);
    bulTex.magFilter = THREE.LinearFilter; bulTex.minFilter = THREE.LinearFilter;
    const z0 = duvarZ + ic * 0.065;
    const net = new THREE.Mesh(new THREE.PlaneGeometry(gen, FH), new THREE.MeshBasicMaterial({ map: tex, color: 0x1f1f1f, fog: false }));
    net.position.set(px, FY, z0); net.rotation.y = sol ? 0 : Math.PI;
    sahne.add(net);
    const bul = new THREE.Mesh(new THREE.PlaneGeometry(gen, FH), new THREE.MeshBasicMaterial({ map: bulTex, color: 0x1f1f1f, transparent: true, fog: false }));
    bul.position.set(px, FY, z0 + ic * 0.002); bul.rotation.y = sol ? 0 : Math.PI;
    sahne.add(bul);
    cocukFoto.push({ net, bul, z: z0, px, pz: z0 });
  });
}
duvarFotoEkle('foto/mehmetnur.jpg', 1006 / 1267, 13.4, 0, 'sol');
duvarFotoEkle('foto/irem.jpg', 720 / 1280, 13.4, 0, 'sag');

// kapıdan fotoğraflara giden, hafifçe yanıp sönen duvar okları
const sahisOklar = [];
function sahisOk(x, z, rotY, ters, k) {
  const mat = new THREE.MeshBasicMaterial({ color: 0xe8b25f, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
  const ok = new THREE.Mesh(okGeo, mat);
  ok.scale.set(ters ? -0.7 : 0.7, 0.7, 1);
  ok.position.set(x, 1.5, z); ok.rotation.y = rotY;
  sahne.add(ok);
  sahisOklar.push({ mat, k });
}
function sahisOklariKur() {
  // çocukluk fotoğrafından şimdiki fotoğrafa giden oklar
  // Mehmetnur: karşı duvarda çocukluk fotoğrafının solundan köşeye, sonra sol duvarda şimdiki fotoğrafa
  [-21.55, -22.15, -22.75].forEach((z, n) => sahisOk(ODA2_X1 - 0.02, z, -Math.PI / 2, true, n));
  [16.9, 16.1, 15.3].forEach((x, n) => sahisOk(x, ODA2_Z0 + 0.02, 0, true, 3 + n));
  // İrem: çocukluk fotoğrafının sağından köşeye, sonra sağ duvarda şimdiki fotoğrafa
  [-15.9, -15.3, -14.7].forEach((z, n) => sahisOk(ODA2_X1 - 0.02, z, -Math.PI / 2, false, n));
  [16.9, 16.1, 15.3].forEach((x, n) => sahisOk(x, ODA2_Z1 - 0.02, Math.PI, false, 3 + n));
}
const vantilator = { bas: null, kanatlar: null, yazi: null };
// ---------- İkinci oda eşyaları: halı, ayaklı vantilatör, küçük dolap ----------
const ENGELLER2 = [
  { x: 12.5, z: -21.2, r: 0.4 },                                        // vantilatör (yatağın yanında)
  { x: 11.55, z: -23.1, r: 0.6 }, { x: 11.55, z: -22.45, r: 0.6 }, { x: 11.55, z: -21.8, r: 0.6 }   // yatak
];
(function oda2Esyalar() {
  // halı: İrem'in odasındaki krem zeminli, bordo-pembe gül demetli halı (2:1)
  const HW = 2048, HH = 1024, c = document.createElement('canvas'); c.width = HW; c.height = HH;
  const x = c.getContext('2d');
  let sdh = 5; const rh = () => { sdh = (sdh * 16807) % 2147483647; return (sdh - 1) / 2147483646; };
  x.fillStyle = '#efe6d1'; x.fillRect(0, 0, HW, HH);
  for (let i = 0; i < 30000; i++) { x.fillStyle = (rh() < 0.5 ? 'rgba(255,250,238,' : 'rgba(150,130,108,') + (0.03 + rh() * 0.05) + ')'; x.fillRect(rh() * HW, rh() * HH, 1 + rh() * 3, 1 + rh() * 2); }
  // silik kıvrımlı dal motifleri (güllerin arkasında)
  function dal(cx, cy, s, rot, ters) {
    x.save(); x.translate(cx, cy); x.rotate(rot); x.scale(s * (ters ? -1 : 1), s); x.strokeStyle = 'rgba(172,156,138,.6)'; x.lineWidth = 5; x.lineCap = 'round';
    x.beginPath(); x.moveTo(-70, 20); x.bezierCurveTo(-40, -50, 10, -50, 20, -5); x.bezierCurveTo(28, 25, -5, 35, -8, 10); x.bezierCurveTo(-10, -5, 8, -8, 10, 2); x.stroke();
    x.beginPath(); x.moveTo(20, -5); x.bezierCurveTo(50, -34, 84, -12, 92, 22); x.stroke();
    x.beginPath(); x.moveTo(-70, 20); x.bezierCurveTo(-90, 40, -110, 38, -118, 20); x.stroke(); x.restore();
  }
  for (let gx = 40; gx < HW; gx += 128) for (let gy = 40; gy < HH + 60; gy += 128) dal(gx + (rh() - 0.5) * 50, gy + (rh() - 0.5) * 50, 0.8 + rh() * 0.5, rh() * 6.28, rh() < 0.5);
  function yaprak(cx, cy, l, rot) {
    x.save(); x.translate(cx, cy); x.rotate(rot); x.fillStyle = '#74605a'; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(l * 0.4, -l * 0.34, l, 0); x.quadraticCurveTo(l * 0.4, l * 0.34, 0, 0); x.fill();
    x.fillStyle = 'rgba(150,128,116,.45)'; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(l * 0.4, -l * 0.34, l, 0); x.quadraticCurveTo(l * 0.45, -l * 0.04, 0, 0); x.fill();
    x.strokeStyle = 'rgba(40,28,24,.45)'; x.lineWidth = 3; x.beginPath(); x.moveTo(0, 0); x.lineTo(l * 0.85, 0); x.stroke(); x.restore();
  }
  function gul(cx, cy, r, rot) {
    x.save(); x.translate(cx, cy); x.rotate(rot);
    x.fillStyle = '#87304d'; x.beginPath(); x.arc(0, 0, r * 0.98, 0, 7); x.fill();
    const kat = (n, rad, rx, ry, c1, c2, of) => { for (let k = 0; k < n; k++) { x.save(); x.rotate(k * Math.PI * 2 / n + of); x.fillStyle = k % 2 ? c1 : c2; x.beginPath(); x.ellipse(r * rad, 0, r * rx, r * ry, 0, 0, 7); x.fill(); x.strokeStyle = 'rgba(95,22,52,.55)'; x.lineWidth = Math.max(1.5, r * 0.04); x.stroke(); x.restore(); } };
    kat(8, 0.56, 0.46, 0.38, '#b55673', '#c8728d', 0); kat(6, 0.34, 0.34, 0.28, '#cf8197', '#bd6480', 0.5); kat(4, 0.16, 0.22, 0.18, '#e0a4b6', '#d58fa4', 0.2);
    x.strokeStyle = '#8a3350'; x.lineWidth = Math.max(1.5, r * 0.05); x.beginPath(); x.arc(0, 0, r * 0.1, 0.4, 4.6); x.stroke();
    x.fillStyle = 'rgba(255,225,232,.28)'; x.beginPath(); x.ellipse(-r * 0.2, -r * 0.25, r * 0.3, r * 0.16, -0.6, 0, 7); x.fill(); x.restore();
  }
  function demet(cx, cy, rot, s) {
    x.save(); x.translate(cx, cy); x.rotate(rot); x.scale(s, s);
    [[-30, -40, 92, -2.5], [40, -45, 88, -0.6], [-55, 40, 86, 2.7], [62, 38, 84, 0.5], [0, -60, 78, -1.6], [-10, 62, 80, 1.6], [-80, -5, 72, 3.1], [86, 0, 72, 0]].forEach(l => yaprak(l[0], l[1], l[2], l[3]));
    gul(-46, -6, 54, 0.4); gul(42, 10, 56, -0.3);
    [[-92, -52, 15], [88, -44, 14], [-66, 70, 14], [84, 66, 17], [4, -78, 13]].forEach(b => gul(b[0], b[1], b[2], rh() * 6));
    x.restore();
  }
  for (let i = 0; i < 8; i++) {
    const bx = 128 + i * 256, ys = i % 2 ? [0, 256, 512, 768, 1024] : [128, 384, 640, 896];
    ys.forEach(by => demet(bx + (rh() - 0.5) * 16, by + (rh() - 0.5) * 16, (i % 2 ? 0.25 : -0.25) + (rh() - 0.5) * 0.3, 0.86 + rh() * 0.08));
  }
  // kenar dikişi
  x.strokeStyle = '#d6c9b0'; x.lineWidth = 10; x.strokeRect(5, 5, HW - 10, HH - 10); x.strokeStyle = 'rgba(190,174,150,.8)'; x.lineWidth = 3; x.strokeRect(16, 16, HW - 32, HH - 32);
  const doku = new THREE.CanvasTexture(c); doku.anisotropy = 8;
  const hali = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 2.8), new THREE.MeshLambertMaterial({ map: doku }));
  hali.rotation.x = -Math.PI / 2; hali.position.set(o2cx + 0.1, 0.012, o2cz);
  sahne.add(hali);

  // küçük dolap (sol duvarın dibinde)
  const ahsap = new THREE.MeshPhongMaterial({ color: 0x7b5636, specular: 0x221a12, shininess: 14 });
  const koyu = new THREE.MeshPhongMaterial({ color: 0x4a3220, specular: 0x000000, shininess: 4 });
  const altin = new THREE.MeshPhongMaterial({ color: 0xd4af37, specular: 0xffffff, shininess: 70, emissive: 0x2a2008 });
  // (eski küçük dolap kaldırıldı: yerine İrem'in büyük dolabı geldi)

  // ayaklı vantilatör
  const plastik = new THREE.MeshPhongMaterial({ color: 0xe9e4d8, specular: 0xffffff, shininess: 40 });
  const metal = new THREE.MeshPhongMaterial({ color: 0xaab0b8, specular: 0xffffff, shininess: 80 });
  const fan = new THREE.Group(); fan.position.set(12.5, 0, -21.2); sahne.add(fan);
  const taban = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.05, 20), plastik); taban.position.y = 0.025; fan.add(taban);
  const direk = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.026, 1.12, 10), metal); direk.position.y = 0.6; fan.add(direk);
  const bas = new THREE.Group(); bas.position.y = 1.2; fan.add(bas);
  const motor = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 10), plastik); motor.scale.set(1, 1, 1.3); motor.position.z = -0.05; bas.add(motor);
  const kafes = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.012, 8, 40), metal); kafes.position.z = 0.1; bas.add(kafes);
  const kafes2 = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.008, 8, 30), metal); kafes2.position.z = 0.1; bas.add(kafes2);
  const kanatlar = new THREE.Group(); kanatlar.position.z = 0.07; bas.add(kanatlar);
  for (let i = 0; i < 3; i++) {
    const kn = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.26, 0.012), new THREE.MeshPhongMaterial({ color: 0x8fc4e8, specular: 0xffffff, shininess: 50, transparent: true, opacity: 0.85 }));
    kn.position.y = 0.15; kn.rotation.y = 0.25;
    const g = new THREE.Group(); g.rotation.z = i * (Math.PI * 2 / 3); g.add(kn); kanatlar.add(g);
  }
  for (let i = 0; i < 8; i++) {   // kafes telleri
    const tel = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.6, 0.006), metal);
    tel.position.z = 0.1; tel.rotation.z = i * Math.PI / 8; bas.add(tel);
  }
  vantilator.bas = bas; vantilator.kanatlar = kanatlar;
  // direğin yan tarafına dikey, yaklaşınca beliren isim
  const kc = document.createElement('canvas'); kc.width = 96; kc.height = 640;
  const kx = kc.getContext('2d');
  kx.translate(48, 320); kx.rotate(-Math.PI / 2);
  kx.textAlign = 'center'; kx.textBaseline = 'middle';
  kx.font = 'bold 64px Georgia, "Times New Roman", serif';
  kx.shadowColor = 'rgba(255,214,120,.9)'; kx.shadowBlur = 14;
  kx.fillStyle = '#ffe9b0'; kx.fillText('Kıvanç', 0, 0);
  const yazi = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.6),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(kc), transparent: true, opacity: 0, depthWrite: false, fog: false }));
  yazi.position.set(0.034, 0.62, 0); yazi.rotation.y = Math.PI / 2;
  fan.add(yazi);
  const yazi2 = yazi.clone(); yazi2.material = yazi.material;   // direğin öbür yüzü
  yazi2.position.set(-0.034, 0.62, 0); yazi2.rotation.y = -Math.PI / 2;
  fan.add(yazi2);
  vantilator.yazi = yazi;

  // yatak: sol duvara başucu dayalı, dolap ile fotoğraf arasında
  const bAhsap = new THREE.MeshPhongMaterial({ color: 0x6b4a30, specular: 0x221a12, shininess: 14 });
  const sert = (w, h, d, mat, px, py, pz) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(px, py, pz); sahne.add(m); return m; };
  const BX = 11.55, BZ0 = -23.6;   // başucu duvarda
  sert(1.0, 0.06, 0.06, bAhsap, BX, 0.78, BZ0 + 0.03);                       // başlık üst
  sert(1.0, 0.8, 0.06, bAhsap, BX, 0.4, BZ0 + 0.03);                          // başlık
  sert(1.0, 0.24, 2.0, bAhsap, BX, 0.22, BZ0 + 1.0);                          // karkas
  const sMat = new THREE.MeshPhongMaterial({ color: 0xf1ece0, specular: 0x000000, shininess: 4 });
  const bMat = new THREE.MeshPhongMaterial({ color: 0x3d5a8c, specular: 0x000000, shininess: 4 });
  sert(0.94, 0.2, 1.94, sMat, BX, 0.44, BZ0 + 1.0);                            // yatak
  sert(0.96, 0.23, 1.25, bMat, BX, 0.455, BZ0 + 1.34);                          // battaniye
  sert(0.96, 0.04, 0.12, sMat, BX, 0.58, BZ0 + 0.72);                           // battaniye kıvrımı
  [-0.22, 0.22].forEach(d => {                                                  // iki yastık
    const y = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10), sMat);
    y.scale.set(1.1, 0.45, 0.9); y.position.set(BX + d, 0.6, BZ0 + 0.45); sahne.add(y);
  });

})();
// ---------- İkinci oda: İrem'in çalışma masası (batı duvarı, kuzey köşe) ve Kapadokya çerçevesi ----------
const MASA = { x: 8.3, z: -21.9, wx: 0, wz: 0, fy: 0 };
(function masaKur() {
  const g = new THREE.Group(); g.position.set(MASA.x, 0, MASA.z); g.rotation.y = Math.PI / 2; sahne.add(g);   // yerel +z odaya, yerel +x kuzeye (dünya −z) bakar
  const M = (renk, kar) => new THREE.MeshPhongMaterial({ color: renk, specular: 0x111111, shininess: kar || 8 });
  const kayin = M(0xd9a56a, 10), krem = M(0xf1e6d0), ceviz = M(0x6b4527, 16), gumus = M(0xc8c8cc, 70), siyah = M(0x1b1b1f, 20), beyaz = M(0xf4f4f2, 20);
  const kt = (w, h, d, mat, x, y, z, ust) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); (ust || g).add(m); return m; };
  // masa: üst tabla, sol yan panel, sağda çekmeceli gövde
  kt(1.2, 0.03, 0.6, kayin, 0, 0.735, 0);
  kt(0.03, 0.72, 0.58, kayin, -0.58, 0.36, 0);
  kt(0.42, 0.7, 0.56, kayin, 0.4, 0.35, 0);
  kt(1.2, 0.4, 0.02, kayin, 0, 0.5, -0.29);                       // arka panel
  kt(0.36, 0.13, 0.02, krem, 0.4, 0.66, 0.285); kt(0.3, 0.015, 0.025, kayin, 0.4, 0.66, 0.285);   // çekmece önü
  kt(0.17, 0.014, 0.03, gumus, 0.4, 0.665, 0.3);                  // kulp
  // açık raf: kitaplar, dosyalar
  const kitapR = [0xb3282d, 0x2f6e4f, 0xefe4c9, 0xc9482f, 0x23353f, 0xd9b96a, 0x8f1f2a, 0x3d7a5a, 0xe2d6bd, 0xa3262c];
  kitapR.forEach((c, i) => kt(0.028, 0.2 + (i % 3) * 0.02, 0.2, M(c), 0.255 + i * 0.03, 0.12 + (i % 3) * 0.01, 0.15));
  kt(0.13, 0.28, 0.2, M(0xe7742c), 0.56 - 0.04, 0.17, 0.1);        // turuncu dosya / poşet
  kt(0.15, 0.02, 0.18, beyaz, 0.4, 0.32, 0.12);                     // bant ve kağıt yığını
  const bant = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.012, 6, 14), M(0xcfb88d)); bant.rotation.x = Math.PI / 2; bant.position.set(0.4, 0.345, 0.14); g.add(bant);
  // masanın üstü: dizüstü bilgisayar, kağıtlar, kulaklık, yeşil kitap, kaplumbağa
  kt(0.36, 0.014, 0.26, siyah, 0.12, 0.757, 0.0); kt(0.3, 0.004, 0.2, M(0xe8e1d4), 0.12, 0.766, 0.0);
  kt(0.26, 0.003, 0.2, beyaz, -0.3, 0.752, 0.05); kt(0.2, 0.003, 0.16, M(0xefe9dc), -0.2, 0.755, 0.1);
  [[0x3a7bd5, -0.34, 0.06], [0x5aa0e8, -0.28, 0.1], [0x2f5f9e, -0.25, 0.04], [0x88b8e6, -0.35, 0.13]].forEach(f => kt(0.06, 0.002, 0.045, M(f[0]), f[1], 0.758, f[2]));   // basılı küçük fotoğraflar
  const kulak = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.008, 6, 16, Math.PI), siyah); kulak.rotation.set(0, 0, 0); kulak.position.set(-0.05, 0.82, 0.12); g.add(kulak);
  [-0.06, 0.06].forEach(d => { const k = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.025, 12), siyah); k.rotation.z = Math.PI / 2; k.position.set(-0.05 + d, 0.765, 0.12); g.add(k); });
  // yan sehpa (kıvrımlı ayaklı), yazıcı ve çöp kovası
  const sx = 0.98, sz = 0.05, sy = 0.5;
  kt(0.42, 0.03, 0.4, ceviz, sx, sy, sz); kt(0.36, 0.02, 0.34, ceviz, sx, 0.2, sz);
  [[-0.17, -0.16], [0.17, -0.16], [-0.17, 0.16], [0.17, 0.16]].forEach(p => { const a = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.026, sy, 6), ceviz); a.position.set(sx + p[0], sy / 2, sz + p[1]); g.add(a); });
  kt(0.4, 0.15, 0.3, beyaz, sx, sy + 0.09, sz); kt(0.34, 0.03, 0.2, M(0xd9dad8), sx - 0.02, sy + 0.18, sz - 0.02);
  kt(0.07, 0.1, 0.07, beyaz, sx + 0.17, sy + 0.09, sz + 0.1);
  [0x1f1f22, 0x2c7fd6, 0xd93a7c, 0xe5c21a].forEach((c, i) => kt(0.012, 0.05, 0.004, M(c), sx + 0.147 + i * 0.016, sy + 0.1, sz + 0.137));
  kt(0.28, 0.01, 0.01, M(0x9a9a9e), sx - 0.02, sy + 0.1, sz + 0.152);
  const kova = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.27, 14), M(0xeceeee, 30)); kova.position.set(sx + 0.02, 0.135, sz + 0.02); g.add(kova);
  const kapak = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.02, 14), beyaz); kapak.position.set(sx + 0.02, 0.28, sz + 0.02); g.add(kapak);
  // yeşil kitap + örgü kaplumbağa
  kt(0.2, 0.022, 0.15, M(0x2e8a5a), 0.5, 0.758, -0.12);
  const kab = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 7), M(0xc6a03a)); kab.scale.set(1, 0.65, 1.1); kab.position.set(0.5, 0.8, -0.12); g.add(kab);
  const kgov = new THREE.Mesh(new THREE.SphereGeometry(0.052, 10, 7), M(0x3ea96b)); kgov.scale.set(1.05, 0.45, 1.15); kgov.position.set(0.5, 0.783, -0.12); g.add(kgov);
  const kbas = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), M(0x3ea96b)); kbas.position.set(0.5, 0.79, -0.06); g.add(kbas);
  // sandalye: koyu ceviz, krem kumaş minder, ince çubuklu sırt (masadan biraz çekilmiş)
  const sd = new THREE.Group(); sd.position.set(-0.22, 0, 0.74); sd.rotation.y = Math.PI + 0.3; g.add(sd);
  kt(0.42, 0.045, 0.4, M(0xeadfc8), 0, 0.46, 0, sd); kt(0.44, 0.03, 0.42, ceviz, 0, 0.43, 0, sd);
  [[-0.19, -0.18], [0.19, -0.18], [-0.19, 0.18], [0.19, 0.18]].forEach(p => kt(0.035, 0.43, 0.035, ceviz, p[0], 0.215, p[1], sd));
  [-0.19, 0.19].forEach(d => kt(0.035, 0.46, 0.035, ceviz, d, 0.68, 0.19, sd));
  kt(0.42, 0.06, 0.04, ceviz, 0, 0.93, 0.19, sd);
  [-0.09, -0.03, 0.03, 0.09].forEach(d => kt(0.018, 0.34, 0.015, ceviz, d, 0.7, 0.19, sd));
  // yerde mavi şişme top
  const top = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), M(0x4a90c8, 40)); top.scale.set(1, 0.85, 1); top.position.set(-1.0, 0.1, 0.28); g.add(top);

  // Kapadokya çerçevesi: masanın güney ucunda, odaya doğru hafif dönük
  const FW = 0.3, FH = 0.4, ORAN = 1180 / 1900, WH = FH * 0.715, WW = WH * ORAN;
  const cg = new THREE.Group(); cg.scale.setScalar(1.45); cg.position.set(-0.36, 0.75 + FH * 1.45 / 2 * Math.cos(0.12), -0.1); cg.rotation.set(-0.12, -0.38, 0); g.add(cg);
  const fc = document.createElement('canvas'); fc.width = 600; fc.height = 800; const fx = fc.getContext('2d'), fd = new THREE.CanvasTexture(fc); fd.anisotropy = 4;
  const KR = '#efdca8';
  function ciz(fn, cx, cy, sc, ters, dn) { fx.save(); fx.translate(cx, cy); fx.scale(ters ? -sc : sc, sc); if (dn) fx.rotate(dn); fx.fillStyle = KR; fx.strokeStyle = KR; fx.lineCap = 'round'; fn(); fx.restore(); }
  const deve = () => { fx.beginPath(); fx.ellipse(-2, 0, 30, 11, 0, 0, 7); fx.fill(); fx.beginPath(); fx.arc(-14, -9, 9, Math.PI, 0); fx.arc(8, -9, 9, Math.PI, 0); fx.fill();
    fx.lineWidth = 7; fx.beginPath(); fx.moveTo(24, -2); fx.quadraticCurveTo(36, -14, 38, -30); fx.stroke(); fx.beginPath(); fx.ellipse(43, -32, 9, 5, -0.3, 0, 7); fx.fill();
    fx.lineWidth = 5; [-24, -14, 12, 22].forEach(x => { fx.beginPath(); fx.moveTo(x, 6); fx.lineTo(x + (x > 0 ? 2 : -2), 34); fx.stroke(); }); fx.lineWidth = 3; fx.beginPath(); fx.moveTo(-30, -2); fx.quadraticCurveTo(-38, 6, -36, 16); fx.stroke(); };
  const at = () => { fx.beginPath(); fx.ellipse(0, 0, 27, 12, -0.1, 0, 7); fx.fill(); fx.lineWidth = 8; fx.beginPath(); fx.moveTo(20, -6); fx.quadraticCurveTo(32, -16, 34, -32); fx.stroke(); fx.beginPath(); fx.ellipse(40, -34, 11, 5, 0.5, 0, 7); fx.fill();
    fx.lineWidth = 5; [[-20, 6, -34, 24], [-12, 8, -16, 32], [14, 8, 30, 20], [22, 4, 38, 10]].forEach(l => { fx.beginPath(); fx.moveTo(l[0], l[1]); fx.lineTo(l[2], l[3]); fx.stroke(); }); fx.lineWidth = 4; fx.beginPath(); fx.moveTo(-26, -4); fx.quadraticCurveTo(-42, -2, -44, 14); fx.stroke(); };
  const atv = () => { fx.beginPath(); fx.roundRect ? fx.roundRect(-26, -12, 52, 17, 5) : fx.rect(-26, -12, 52, 17); fx.fill(); fx.fillRect(-14, -20, 22, 9); fx.lineWidth = 4; fx.beginPath(); fx.moveTo(14, -12); fx.lineTo(20, -24); fx.moveTo(14, -24); fx.lineTo(26, -24); fx.stroke();
    [-26, 26].forEach(x => { fx.beginPath(); fx.arc(x, 10, 15, 0, 7); fx.fill(); fx.fillStyle = '#6a4326'; fx.beginPath(); fx.arc(x, 10, 6, 0, 7); fx.fill(); fx.fillStyle = KR; }); };
  function cerceveCiz() {
    fx.fillStyle = '#6a4326'; fx.fillRect(0, 0, 600, 800);
    for (let i = 0; i < 420; i++) { fx.fillStyle = 'rgba(' + (i % 2 ? '35,20,8' : '150,100,60') + ',' + (0.05 + Math.random() * 0.12) + ')'; fx.fillRect(Math.random() * 600, 0, 1 + Math.random() * 2, 800); }
    fx.fillStyle = '#efdca8'; fx.textAlign = 'center'; fx.textBaseline = 'middle'; fx.font = 'italic bold 62px "Trebuchet MS", Verdana, sans-serif'; fx.fillText('Cappadocia', 300, 78);
    const dx = (600 - 2 * 123 - (600 - 2 * 123)) / 2; ciz(at, 64, 238, 0.95, false, -0.5); ciz(at, 536, 238, 0.95, true, -0.5); ciz(atv, 62, 440, 0.95); ciz(atv, 538, 440, 0.95); ciz(deve, 62, 628, 0.95); ciz(deve, 538, 628, 0.95);
    fx.font = 'italic 46px "Great Vibes", cursive'; fx.fillText('Türkiye', 300, 748);
    fx.fillStyle = '#1f1a16'; fx.fillRect(123 - 4, 128 - 4, 354 + 8, 572 + 8);
    fd.needsUpdate = true;
  }
  cerceveCiz(); if (document.fonts && document.fonts.load) document.fonts.load('46px "Great Vibes"', 'Türkiye').then(cerceveCiz).catch(() => {});
  const koyuK = new THREE.MeshPhongMaterial({ color: 0x4f321b, shininess: 10 });
  const cer = new THREE.Mesh(new THREE.BoxGeometry(FW, FH, 0.014), [koyuK, koyuK, koyuK, koyuK, new THREE.MeshPhongMaterial({ map: fd, shininess: 14, specular: 0x222222 }), koyuK]); cg.add(cer);
  const ayak = new THREE.Mesh(new THREE.BoxGeometry(0.05, FH * 0.8, 0.012), koyuK); ayak.position.set(0, -0.02, -0.06); ayak.rotation.x = 0.55; cg.add(ayak);
  const net = new THREE.Mesh(new THREE.PlaneGeometry(WW, WH), new THREE.MeshBasicMaterial({ color: 0x555555 })); net.position.set(0, FH * (0.5 - (0.16 + 0.715 / 2) ) * 1, 0.0085); cg.add(net);
  // yer tutucu: foto gelene kadar gökyüzü mavisi
  const pk = document.createElement('canvas'); pk.width = 8; pk.height = 12; const pkx = pk.getContext('2d'); pkx.fillStyle = '#2a7bd6'; pkx.fillRect(0, 0, 8, 12); net.material.map = new THREE.CanvasTexture(pk);
  const kayit = { net, bul: { material: { color: new THREE.Color(), opacity: 1 } }, px: 0, pz: 0, m: [6, 3] };
  cocukFoto.push(kayit);
  g.updateMatrixWorld(true); const wp = new THREE.Vector3(); cg.getWorldPosition(wp); kayit.px = wp.x; kayit.pz = wp.z; MASA.wx = wp.x; MASA.wz = wp.z; MASA.fy = wp.y;
  new THREE.TextureLoader().load('foto/kapadokya.jpg', tex => {
    tex.anisotropy = 8; net.material.map = tex; net.material.needsUpdate = true;
    const bc = document.createElement('canvas'); bc.width = 14; bc.height = Math.round(14 / ORAN); bc.getContext('2d').drawImage(tex.image, 0, 0, bc.width, bc.height);
    const bt = new THREE.CanvasTexture(bc); bt.magFilter = THREE.LinearFilter; bt.minFilter = THREE.LinearFilter;
    const bul = new THREE.Mesh(new THREE.PlaneGeometry(WW, WH), new THREE.MeshBasicMaterial({ map: bt, color: 0x333333, transparent: true })); bul.position.copy(net.position); bul.position.z += 0.0012; cg.add(bul); kayit.bul = bul;
  }, undefined, () => {});
  // çarpışma: masa, sehpa, sandalye
  const dn = (lx, lz, r) => { ENGELLER2.push({ x: MASA.x + lz, z: MASA.z - lx, r }); };
  [-0.45, 0, 0.45].forEach(l => dn(l, 0.15, 0.4)); dn(0.98, 0.05, 0.38); dn(-0.22, 0.74, 0.32);
})();

// ---------- İkinci oda: İrem'in büyük dolabı (kuzey duvarda, masanın yanında) ----------
const DOLAP = { x: 9.2, z: -23.6, W: 0.95, H: 1.95, D: 0.5, kx: 0, kz: 0 };
(function dolapKur() {
  const g = new THREE.Group(); g.position.set(DOLAP.x, 0, DOLAP.z + DOLAP.D / 2); sahne.add(g);   // arka yüz duvarda, ön yüz +z'ye bakar
  const M = (renk, kar) => new THREE.MeshPhongMaterial({ color: renk, specular: 0x111111, shininess: kar || 8 });
  const kt = (w, h, d, mat, x, y, z, ust) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); (ust || g).add(m); return m; };
  const loader = new THREE.TextureLoader();
  const mese = loader.load('foto/dolap-mese.jpg'); mese.wrapS = mese.wrapT = THREE.RepeatWrapping; mese.anisotropy = 4;
  const govdeM = new THREE.MeshPhongMaterial({ map: mese, shininess: 10, specular: 0x1a1a1a });
  const beyaz = M(0xf2f1ec, 30), altin = new THREE.MeshPhongMaterial({ color: 0xd8b25a, shininess: 90, specular: 0xfff1c0, emissive: 0x2a1f06 });
  const W = DOLAP.W, H = DOLAP.H, D = DOLAP.D, KY = 0.12, CY = 0.5, DH = H - KY - CY;   // ayak, çekmece bölümü, kapı bölümü
  // iskelet
  kt(W, DH, D, govdeM, 0, KY + CY + DH / 2, 0);                          // kapıların arkası
  kt(W, CY, D, govdeM, 0, KY + CY / 2, 0);                               // çekmece gövdesi
  kt(W + 0.02, 0.025, D + 0.02, govdeM, 0, H + 0.0125, 0);               // tepe
  // beyaz konik ayaklar
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(p => { const a = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.02, KY, 8), beyaz); a.position.set(p[0] * (W / 2 - 0.07), KY / 2, p[1] * (D / 2 - 0.07)); g.add(a); });
  // çekmeceler
  [0, 1].forEach(k => { const y = KY + 0.125 + k * 0.25; kt(W - 0.02, 0.235, 0.02, govdeM, 0, y, D / 2 + 0.006); const kl = kt(0.17, 0.028, 0.03, beyaz, 0, y + 0.02, D / 2 + 0.03); [-0.095, 0.095].forEach(dx => kt(0.022, 0.022, 0.03, altin, dx, y + 0.02, D / 2 + 0.03)); });
  // kapılar: gerçek fotoğraflı dokular (netleşme bulanık→net)
  const kapiH = DH - 0.02, kapiW = W / 2 - 0.012, kkY = KY + CY + DH / 2;
  const KAPI_HOT = { sol: [['lake',54,64,176,186,'dolap-v-goluk.jpg'],['bus',176,70,296,188,'dolap-v-otobus.jpg'],['gece',300,92,436,190,'dolap-v-gece.jpg'],['kart',250,10,440,165,'dolap-v-sirik.jpg']],
    sag: [['iyiki',80,125,174,201,'dolap-v-iyiki.jpg'],['cizim',132,818,280,946,'dolap-v-cizim.jpg'],['pres',104,466,350,787,'dolap-v-pres.jpg'],['gul',344,241,443,503,'dolap-v-gul.jpg'],['serit',190,256,313,463,'dolap-v-serit.jpg'],['okul',166,190,332,308,'dolap-v-okul.jpg']] };
  DOLAP.kapilar = [];
  const cerceveT = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); x.strokeStyle = '#ffd98a'; x.lineWidth = 7; x.strokeRect(5, 5, 54, 54); x.shadowColor = '#ffcf6a'; x.shadowBlur = 8; x.strokeRect(5, 5, 54, 54); return new THREE.CanvasTexture(c); })();
  function kapi(dosya, x, kenarX, hotAd) {
    const net = new THREE.Mesh(new THREE.PlaneGeometry(kapiW, kapiH), new THREE.MeshBasicMaterial({ color: 0x777777 })); net.position.set(x, kkY, D / 2 + 0.002); g.add(net);
    const kayit = { net, bul: { material: { color: new THREE.Color(), opacity: 1 } }, px: 0, pz: 0, m: [7, 3.2], min: 0.55 };
    cocukFoto.push(kayit);
    const hot = KAPI_HOT[hotAd], KW = 480, KH = 1344, isik = [];
    hot.forEach(h => { const m = new THREE.Mesh(new THREE.PlaneGeometry((h[3] - h[1]) / KW * kapiW + 0.012, (h[4] - h[2]) / KH * kapiH + 0.012), new THREE.MeshBasicMaterial({ map: cerceveT, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
      m.position.set(x + ((h[1] + h[3]) / 2 / KW - 0.5) * kapiW, kkY + (0.5 - (h[2] + h[4]) / 2 / KH) * kapiH, D / 2 + 0.004); g.add(m); isik.push(m); });
    DOLAP.kapilar.push({ net, hot, KW, KH, isik });
    loader.load(dosya, tex => {
      tex.anisotropy = 8; net.material.map = tex; net.material.needsUpdate = true;
      const bc = document.createElement('canvas'); bc.width = 30; bc.height = 84; bc.getContext('2d').drawImage(tex.image, 0, 0, 30, 84);
      const bt = new THREE.CanvasTexture(bc); bt.magFilter = THREE.LinearFilter; bt.minFilter = THREE.LinearFilter;
      const bul = new THREE.Mesh(new THREE.PlaneGeometry(kapiW, kapiH), new THREE.MeshBasicMaterial({ map: bt, color: 0x555555, transparent: true })); bul.position.copy(net.position); bul.position.z += 0.001; g.add(bul); kayit.bul = bul;
    }, undefined, () => {});
    // kulp: beyaz porselen, altın uçlu
    const kl = kt(0.026, 0.19, 0.026, beyaz, kenarX, kkY - 0.05, D / 2 + 0.03); [-0.1, 0.1].forEach(dy => kt(0.034, 0.03, 0.03, altin, kenarX, kkY - 0.05 + dy, D / 2 + 0.03));
    return kayit;
  }
  const ks = kapi('foto/dolap-sol.jpg', -W / 4, -0.05, 'sol'), kg = kapi('foto/dolap-sag.jpg', W / 4, 0.05, 'sag');
  g.updateMatrixWorld(true); const wp = new THREE.Vector3(); g.getWorldPosition(wp);
  ks.px = kg.px = DOLAP.x; ks.pz = kg.pz = DOLAP.z + D + 0.4; DOLAP.kx = DOLAP.x; DOLAP.kz = DOLAP.z + D + 0.5;
  // dolabın üstü: Scrabble, çanta, su şişeli poşet, top, oyuncaklar, kutular, origami çiçekler
  const U = H + 0.03, ust = new THREE.Group(); ust.position.set(0, U, 0); g.add(ust);
  const sc = document.createElement('canvas'); sc.width = 256; sc.height = 128; const sx = sc.getContext('2d'); sx.fillStyle = '#1f6f66'; sx.fillRect(0, 0, 256, 128); sx.fillStyle = '#e8e2cf'; sx.font = 'bold 30px sans-serif'; sx.textAlign = 'center'; sx.fillText('S C R A B B L E', 128, 76);
  const scrabble = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.07, 0.2), [M(0x1f6f66), M(0x1f6f66), new THREE.MeshPhongMaterial({ map: new THREE.CanvasTexture(sc) }), M(0x17554f), M(0x1f6f66), M(0x1f6f66)]); scrabble.position.set(-0.28, 0.035, -0.06); ust.add(scrabble);
  kt(0.26, 0.12, 0.17, M(0x1d2733), -0.22, 0.13, -0.08, ust);                                                // lacivert kılıf/çanta
  const poset = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, shininess: 80 })); poset.position.set(-0.08, 0.24, -0.08); poset.scale.set(1, 1.5, 1); ust.add(poset);
  const sise = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 10), M(0x6aa8e0, 60)); sise.position.set(-0.08, 0.22, -0.08); ust.add(sise);
  const top = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), M(0xf5f5f2, 40)); top.position.set(0.0, 0.055, 0.02); ust.add(top);
  [[0.0, 0.1, 0.12, 0x45c7b0], [0.045, 0.13, 0.05, 0x45c7b0]].forEach(c => { const o = new THREE.Mesh(new THREE.SphereGeometry(c[2] * 0.5, 8, 6), M(c[3], 40)); o.position.set(c[0] + 0.08, c[1], 0.08); ust.add(o); });   // kaktüs oyuncak
  const kedi = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), M(0xe8c9a8)); kedi.position.set(0.0, 0.04, 0.1); ust.add(kedi);   // küçük figür
  kt(0.14, 0.2, 0.1, M(0x5a1f26), 0.15, 0.1, -0.1, ust); kt(0.12, 0.03, 0.09, altin, 0.15, 0.17, -0.1 + 0.0, ust);   // BABİL kutusu
  kt(0.17, 0.17, 0.12, M(0xe8a0b8), 0.34, 0.085, -0.04, ust);                                               // pembe kutu
  kt(0.14, 0.04, 0.1, M(0xe5b81a), 0.27, 0.02, 0.1, ust); kt(0.1, 0.06, 0.07, M(0x151517), 0.35, 0.03, 0.12, ust);   // puzzle kutuları
  [-0.04, 0.12].forEach((dx, i) => { const og = new THREE.Group(); og.position.set(dx + 0.12, 0.0, 0.18); og.rotation.y = i * 0.6; ust.add(og);
    const cic = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.1, 4), M(0xf8f8fb, 14)); cic.rotation.x = Math.PI; cic.position.y = 0.14; og.add(cic);
    const sap = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.1, 6), M(0xeeeeee)); sap.position.y = 0.06; og.add(sap);
    if (i) { for (let k = 0; k < 7; k++) { const kb = new THREE.Mesh(new THREE.SphereGeometry(0.01, 5, 4), M(0xe7d3ae)); const a = k / 7; kb.position.set(0.04 * Math.cos(a * 5), 0.19 - a * 0.12, 0.04 * Math.sin(a * 5)); og.add(kb); } } });
  // çarpışma: dolabın önü
  [-0.34, 0, 0.34].forEach(dx => ENGELLER2.push({ x: DOLAP.x + dx, z: DOLAP.z + 0.22, r: 0.4 }));
})();
// ---------- İkinci oda: İrem'in klasik çekmeceli komodini (güney duvarı, doğu tarafı) ----------
const KOMODIN = { x: 15.7, z: -13.8, W: 0.98, H: 0.82, D: 0.5 };
(function komodinKur() {
  const g = new THREE.Group(); g.position.set(KOMODIN.x, 0, KOMODIN.z - KOMODIN.D / 2); g.rotation.y = Math.PI; sahne.add(g);   // arka yüz güney duvarda, ön yüz kuzeye (odaya) bakar
  const W = KOMODIN.W, H = KOMODIN.H, D = KOMODIN.D;
  const M = (renk, kar, spec) => new THREE.MeshPhongMaterial({ color: renk, shininess: kar || 8, specular: spec || 0x111111 });
  const kt = (w, h, d, mat, x, y, z, ust) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); (ust || g).add(m); return m; };
  const rh = (() => { let s = 21; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })();
  // --- ön yüz dokusu (klasik ceviz, kaplama paneller, siyah çiçekler, altın tutamaklar) ---
  const CW = 1100, CH = 860, c = document.createElement('canvas'); c.width = CW; c.height = CH; const x = c.getContext('2d');
  function odun(x0, y0, w, h, renk, cizgi) { x.fillStyle = renk; x.fillRect(x0, y0, w, h); for (let i = 0; i < w / 3; i++) { x.fillStyle = 'rgba(' + (rh() < 0.5 ? '25,12,6' : '170,110,60') + ',' + (0.04 + rh() * 0.1) + ')'; x.fillRect(x0 + rh() * w, y0, 1 + rh() * 2, h); } }
  function kaplama(x0, y0, w, h) { const gr = x.createLinearGradient(x0, y0, x0 + w, y0 + h); gr.addColorStop(0, '#a27243'); gr.addColorStop(0.5, '#8a5a2c'); gr.addColorStop(1, '#966734'); x.fillStyle = gr; x.fillRect(x0, y0, w, h);
    for (let i = 0; i < 220; i++) { x.fillStyle = 'rgba(' + (rh() < 0.5 ? '70,38,14' : '210,160,90') + ',' + (0.06 + rh() * 0.14) + ')'; x.beginPath(); x.ellipse(x0 + rh() * w, y0 + rh() * h, 2 + rh() * 9, 1 + rh() * 3, rh() * 3, 0, 7); x.fill(); }
    x.strokeStyle = 'rgba(50,25,10,.7)'; x.lineWidth = 3; x.strokeRect(x0, y0, w, h); }
  function cicek(cx, cy, r) { x.fillStyle = '#16120f'; for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; x.beginPath(); x.arc(cx + Math.cos(a) * r * 0.62, cy + Math.sin(a) * r * 0.62, r * 0.42, 0, 7); x.fill(); } x.fillStyle = '#5a4a3a'; x.beginPath(); x.arc(cx, cy, r * 0.28, 0, 7); x.fill(); }
  function tutamak(cx, cy) { x.strokeStyle = '#d9b867'; x.lineWidth = 9; x.lineCap = 'round'; x.beginPath(); x.moveTo(cx - 50, cy - 6); x.quadraticCurveTo(cx, cy + 26, cx + 50, cy - 6); x.stroke(); x.fillStyle = '#e8cc86'; [-50, 50].forEach(d => { x.beginPath(); x.arc(cx + d, cy - 8, 9, 0, 7); x.fill(); }); x.strokeStyle = 'rgba(255,240,190,.6)'; x.lineWidth = 3; x.beginPath(); x.moveTo(cx - 40, cy); x.quadraticCurveTo(cx, cy + 18, cx + 40, cy); x.stroke(); }
  odun(0, 0, CW, CH, '#4a2a17');
  // üst çekmece bandı
  odun(30, 95, 1040, 160, '#3c2012'); odun(190, 100, 735, 150, '#4c2b17'); kaplama(260, 124, 590, 100);
  tutamak(310, 190); tutamak(780, 190);
  odun(36, 106, 140, 140, '#4a2a17'); kaplama(52, 122, 108, 108); cicek(106, 176, 40);
  odun(930, 106, 140, 140, '#4a2a17'); kaplama(946, 122, 108, 108); cicek(1000, 176, 40);
  x.fillStyle = '#f4f1ea'; x.beginPath(); x.moveTo(60, 120); x.lineTo(86, 112); x.lineTo(98, 134); x.lineTo(78, 156); x.lineTo(60, 142); x.fill();   // origami
  odun(0, 258, CW, 40, '#33190d');
  // yan sütunlar
  [[60, 120], [920, 120]].forEach(s0 => { odun(s0[0], 300, 130, 440, '#3d2113'); kaplama(s0[0] + 28, 380, 74, 310); x.fillStyle = '#1d140d'; x.fillRect(s0[0] - 6, 300, 142, 70); for (let k = 0; k < 6; k++) { x.strokeStyle = 'rgba(120,80,40,.5)'; x.lineWidth = 3; x.beginPath(); x.moveTo(s0[0] + 10 + k * 20, 366); x.quadraticCurveTo(s0[0] + 14 + k * 20, 324, s0[0] + 24 + k * 20, 310); x.stroke(); } });
  // kapılar
  [[200, 345], [550, 345]].forEach((d, i) => { odun(d[0], 300, d[1], 440, '#4a2a17'); const px = d[0] + 40, pw = d[1] - 80, sol = i === 0;
    const yol = (m, ofs) => { x.beginPath(); if (sol) { x.moveTo(px - ofs, 700 + ofs); x.lineTo(px - ofs, 460); x.quadraticCurveTo(px - ofs, 390 - ofs, px + 70, 390 - ofs); x.lineTo(px + pw + ofs, 390 - ofs); x.lineTo(px + pw + ofs, 700 + ofs); } else { x.moveTo(px - ofs, 700 + ofs); x.lineTo(px - ofs, 390 - ofs); x.lineTo(px + pw - 70, 390 - ofs); x.quadraticCurveTo(px + pw + ofs, 390 - ofs, px + pw + ofs, 460); x.lineTo(px + pw + ofs, 700 + ofs); } x.closePath(); };
    x.save(); yol(0, 0); x.clip(); kaplama(px, 380, pw, 330); x.restore();
    x.strokeStyle = 'rgba(45,22,10,.8)'; x.lineWidth = 6; yol(0, 12); x.stroke();
    cicek(d[0] + (i ? d[1] - 70 : 70), 345, 34); });
  x.fillStyle = '#d9b867'; x.beginPath(); x.arc(520, 360, 11, 0, 7); x.fill(); x.fillStyle = '#d9b867'; x.beginPath(); x.moveTo(540, 365); x.lineTo(565, 430); x.lineTo(552, 470); x.lineTo(530, 430); x.closePath(); x.fill();
  x.fillStyle = '#e6e8ee'; x.beginPath(); x.moveTo(556, 410); x.lineTo(566, 450); x.lineTo(550, 478); x.lineTo(540, 450); x.closePath(); x.fill();   // damla süs
  x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(545, 300, 3, 440);
  // kaide
  odun(0, 750, CW, 110, '#35190c'); x.fillStyle = '#2a1409'; x.fillRect(0, 750, 190, 110); x.fillRect(910, 750, 190, 110);
  const doku = new THREE.CanvasTexture(c); doku.anisotropy = 8;
  const koyu = M(0x3a1d0e, 20), ceviz = M(0x4a2514, 40, 0x553322), cila = M(0x4a2412, 90, 0xaa8866);
  // gövde (yan ve arka koyu ceviz), ön yüz dokulu
  const govde = new THREE.Mesh(new THREE.BoxGeometry(W, H - 0.06, D), [ceviz, ceviz, ceviz, ceviz, new THREE.MeshPhongMaterial({ map: doku, shininess: 30, specular: 0x332211 }), ceviz]);
  govde.position.set(0, (H - 0.06) / 2 - 0.0, 0); g.add(govde);
  // üst tabla: parlak cilalı, öne doğru hafif taşan
  kt(W + 0.06, 0.04, D + 0.07, cila, 0, H - 0.04 + 0.02 + 0.0, 0.015); kt(W + 0.03, 0.025, D + 0.04, koyu, 0, H - 0.075, 0.01);
  // kaide köşe ayakları (topuz)
  [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(p => { const a = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), koyu); a.scale.set(1, 0.7, 1); a.position.set(p[0] * (W / 2 - 0.07), 0.04, p[1] * (D / 2 - 0.07)); g.add(a); });
  // ---- üstündeki eşyalar ----
  const T = H + 0.0, ust = new THREE.Group(); ust.position.set(0, T, 0); g.add(ust);
  const cam = (renk, op) => new THREE.MeshPhongMaterial({ color: renk, transparent: true, opacity: op || 0.55, shininess: 100, specular: 0xffffff });
  const sise = (x0, z0, r, h, govdeM, kapM, pompa) => { const gb = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 12), govdeM); gb.position.set(x0, h / 2, z0); ust.add(gb); const kp = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.55, r * 0.6, 0.03, 10), kapM); kp.position.set(x0, h + 0.015, z0); ust.add(kp); if (pompa) { const pm = new THREE.Mesh(new THREE.BoxGeometry(r * 1.3, 0.025, r * 0.5), kapM); pm.position.set(x0 + r * 0.4, h + 0.045, z0); ust.add(pm); } return gb; };
  const beyazM = M(0xf4f4f2, 30), camM = cam(0xdfe9ee, 0.5);
  sise(-0.36, -0.14, 0.038, 0.22, beyazM, M(0x2f6fd0, 40), true);     // mavi pompalı losyon
  sise(-0.28, -0.17, 0.034, 0.2, beyazM, M(0xd13a30, 40), true);      // kırmızı pompalı
  sise(-0.43, -0.07, 0.038, 0.2, camM, M(0x1a1a1a, 40));              // siyah kapaklı şeffaf şişe
  sise(-0.4, 0.04, 0.026, 0.14, camM, M(0xc9ccd0, 70));               // küçük şişe
  sise(-0.2, 0.0, 0.04, 0.17, M(0xf6f6f6, 30), M(0x2a52b8, 40));     // deodorant (mavi kapak)
  sise(-0.12, 0.02, 0.04, 0.15, cam(0xf19a2a, 0.75), M(0xe3c26a, 70)); // turuncu parfüm
  sise(-0.04, 0.0, 0.037, 0.15, M(0xa8d98a, 20), M(0xcfe8b8, 20));     // açık yeşil deodorant
  sise(0.07, 0.07, 0.045, 0.19, cam(0xe4eef4, 0.45), M(0xdcdfe2, 40)); // büyük şeffaf şişe
  // lego tarzı pembe çiçek + beyaz saksı
  { const cg = new THREE.Group(); cg.position.set(-0.3, 0, 0.1); ust.add(cg);
    kt(0.1, 0.05, 0.08, M(0xe6ebe6, 20), 0, 0.025, 0, cg);
    [[0.0, 0.07, 0.0, 0x62b34f], [0.03, 0.09, 0.02, 0x7fc561]].forEach(l => { const y = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), M(l[3], 20)); y.scale.set(1.4, 0.3, 0.7); y.position.set(l[0], l[1], l[2]); cg.add(y); });
    for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, p = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.075, 0.008), M(k % 2 ? 0xf2b8cb : 0xe9a6bd, 20)); p.position.set(Math.sin(a) * 0.04, 0.17 + Math.cos(a) * 0.04, 0.0); p.rotation.z = -a; cg.add(p); }
    for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3, p = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.03, 0.01), M(k % 2 ? 0xa8dcc4 : 0xfff3d0, 20)); p.position.set(Math.sin(a) * 0.022, 0.17 + Math.cos(a) * 0.022, 0.006); p.rotation.z = -a; cg.add(p); }
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.12, 5), M(0x4a8a3a)); st.position.set(0, 0.1, -0.005); cg.add(st); }
  // mavi plastik sepet: makyaj fırçaları, kalemler
  { const sp = new THREE.Group(); sp.position.set(-0.17, 0, -0.1); ust.add(sp);
    const sm = M(0x8fa7c8, 20); kt(0.24, 0.012, 0.15, sm, 0, 0.006, 0, sp); [[-0.12, 0, 0.012, 0.15, 0.1], [0.12, 0, 0.012, 0.15, 0.1]].forEach(w => kt(w[2], 0.1, w[3], sm, w[0], 0.055, 0, sp)); [[-0.075, 0.24, 0.012], [0.075, 0.24, 0.012]].forEach(w => kt(w[1], 0.1, w[2], sm, 0, 0.055, w[0], sp));
    for (let k = 0; k < 10; k++) { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.14 + rh() * 0.05, 5), M([0x222222, 0xd9c2a8, 0xb45a6a, 0xe9c9b8, 0xe58a30][k % 5], 20)); t.position.set(-0.07 + rh() * 0.14, 0.1, -0.04 + rh() * 0.08); t.rotation.set((rh() - 0.5) * 0.4, 0, (rh() - 0.5) * 0.4); sp.add(t); } }
  // pamuk/ped paketleri (üzerleri boş), gri makyaj çantası
  kt(0.13, 0.15, 0.06, M(0xf1f4f6, 10), 0.0, 0.075, -0.15, ust); kt(0.14, 0.05, 0.1, M(0xf5f6f7, 10), 0.01, 0.025, -0.07, ust);
  { const cp = kt(0.16, 0.1, 0.09, M(0x3a3a40, 20), 0.15, 0.05, -0.1, ust); for (let k = 0; k < 4; k++) kt(0.015, 0.06, 0.012, M([0xffffff, 0xeaeaf5, 0xe6c0c0, 0xc0d8e6][k], 20), 0.11 + k * 0.025, 0.12, -0.1, ust); }
  // tuvalet kağıdı ve kağıt havlu
  { const tk = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.1, 16), M(0xf8f8f6, 10)); tk.position.set(0.13, 0.05, 0.08); ust.add(tk); const ik = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.101, 10), M(0x8a6a4c, 10)); ik.position.set(0.13, 0.05, 0.08); ust.add(ik);
    const kh = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.28, 16), M(0xf6f6f4, 10)); kh.position.set(0.37, 0.14, 0.0); ust.add(kh); }
  // çarpışma
  [-0.34, 0, 0.34].forEach(dx => ENGELLER2.push({ x: KOMODIN.x + dx, z: KOMODIN.z - 0.28, r: 0.38 }));
})();
// ---------- İkinci oda: yuvarlak ceviz sehpa (güneydoğu köşe): tablet, şarj aleti, gözlük, turuncu altlık ----------
const SEHPA = { x: 17.0, z: -14.3 };
(function sehpaKur() {
  const g = new THREE.Group(); g.position.set(SEHPA.x, 0, SEHPA.z); sahne.add(g);
  const M = (renk, kar, spec) => new THREE.MeshPhongMaterial({ color: renk, shininess: kar || 8, specular: spec || 0x111111 });
  const ceviz = M(0x3d1f10, 70, 0x886644), koyu = M(0x2e160a, 30);
  const tabla = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.03, 36), ceviz); tabla.position.y = 0.61; g.add(tabla);
  const kenar = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.017, 8, 40), ceviz); kenar.rotation.x = Math.PI / 2; kenar.position.y = 0.6; g.add(kenar);
  const alt = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.05, 30), koyu); alt.position.y = 0.565; g.add(alt);
  // üç kavisli ayak: üstten dışa taşıp aşağıda yuvarlak rafa iner
  for (let k = 0; k < 3; k++) {
    const a = k * Math.PI * 2 / 3 + 0.3, cx = Math.cos(a), cz = Math.sin(a);
    const pts = [[0.17, 0.55], [0.25, 0.42], [0.21, 0.26], [0.2, 0.13], [0.25, 0.01]].map(p => new THREE.Vector3(cx * p[0], p[1], cz * p[0]));
    const ayak = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.024, 8, false), ceviz); g.add(ayak);
  }
  const raf = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.025, 30), ceviz); raf.position.y = 0.16; g.add(raf);
  // üstündekiler
  const y0 = 0.625;
  const kt = (w, h, d, mat, x, y, z, ry) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); if (ry) m.rotation.y = ry; g.add(m); return m; };
  kt(0.27, 0.014, 0.2, M(0x5f7da3, 30), 0.03, y0 + 0.007, -0.1, 0.35);                 // mavi kılıflı tablet
  kt(0.25, 0.003, 0.18, M(0x2a3647, 20), 0.03, y0 + 0.016, -0.1, 0.35);
  kt(0.05, 0.05, 0.03, M(0xf5f5f3, 30), 0.05, y0 + 0.04, -0.13, 0.35);                 // beyaz şarj aleti
  const kablo = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[0.05, 0.02, -0.12], [-0.05, 0.01, 0.0], [-0.15, 0.01, 0.08], [-0.2, 0.01, 0.02], [-0.12, 0.01, -0.04], [0.0, 0.02, 0.06]].map(p => new THREE.Vector3(p[0], y0 + p[1], p[2]))), 30, 0.004, 5, false), M(0xf2f2f0, 20)); g.add(kablo);
  // siyah yuvarlak gözlük
  const cr = M(0x151515, 60); [-0.04, 0.04].forEach(d => { const t = new THREE.Mesh(new THREE.TorusGeometry(0.027, 0.0035, 6, 18), cr); t.rotation.x = Math.PI / 2; t.position.set(-0.2 + d, y0 + 0.004, -0.15); g.add(t); });
  kt(0.02, 0.003, 0.003, cr, -0.2, y0 + 0.005, -0.15); kt(0.003, 0.003, 0.07, cr, -0.15, y0 + 0.004, -0.185); kt(0.003, 0.003, 0.07, cr, -0.25, y0 + 0.004, -0.185);
  // turuncu altlık kart
  const oc = document.createElement('canvas'); oc.width = oc.height = 128; const ox = oc.getContext('2d'); ox.fillStyle = '#e9772f'; ox.fillRect(0, 0, 128, 128); ox.fillStyle = '#e9e1cd'; ox.fillRect(46, 20, 36, 28); ox.fillStyle = '#7a3f12'; for (let i = 0; i < 4; i++) ox.fillRect(24, 70 + i * 12, 80 - i * 10, 3);
  const alt2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.006, 0.1), [M(0xe9772f), M(0xe9772f), new THREE.MeshPhongMaterial({ map: new THREE.CanvasTexture(oc) }), M(0xc65f1c), M(0xe9772f), M(0xe9772f)]); alt2.position.set(-0.13, y0 + 0.003, 0.12); alt2.rotation.y = -0.45; g.add(alt2);
  ENGELLER2.push({ x: SEHPA.x, z: SEHPA.z, r: 0.34 });
})();
const fotoBtn = document.getElementById('fotoBtn'), fotoBak = document.getElementById('fotoBak');
const FOTO_NOKTA = [{ x: () => MASA.wx, z: () => MASA.wz, src: ['foto/kapadokya.jpg'] }];
let fotoYakin = -1;
function masaGuncelle() {
  let en = -1, ed = 2.6;
  FOTO_NOKTA.forEach((n, i) => { const d = Math.hypot(kon.x - n.x(), kon.z - n.z()); if (d < ed) { ed = d; en = i; } });
  fotoYakin = en;
  fotoBtn.classList.toggle('acik', en >= 0 && kon.x > ODA_X + 1 && kon.x < 12 && kon.z < ODA2_Z1 && !fotoBak.classList.contains('acik'));
}
fotoBtn.addEventListener('click', () => {
  if (fotoYakin < 0) return;
  const kutu = fotoBak.querySelector('.fg'); kutu.innerHTML = '';
  FOTO_NOKTA[fotoYakin].src.forEach(u => { const im = new Image(); im.src = u; im.alt = ''; kutu.appendChild(im); });
  fotoBak.classList.add('acik'); fotoAcildi = performance.now(); fotoBtn.classList.remove('acik');
});
let fotoAcildi = 0;
fotoBak.addEventListener('click', () => { if (performance.now() - fotoAcildi < 600) return; fotoBak.classList.remove('acik'); });   // dokunuşun ardından gelen sahte tık hemen kapatmasın
// dolabın kapısındaki fotoğraflara dokununca büyüt
let dolapDokun0 = null;
canvas.addEventListener('pointerdown', e => { dolapDokun0 = { x: e.clientX, y: e.clientY, t: performance.now() }; });
canvas.addEventListener('pointerup', e => {
  const d0 = dolapDokun0; dolapDokun0 = null;
  if (!d0 || Math.hypot(e.clientX - d0.x, e.clientY - d0.y) > 12 || performance.now() - d0.t > 500 || ey.aktif || !DOLAP.kapilar) return;
  if (Math.hypot(kon.x - DOLAP.kx, kon.z - DOLAP.kz) > 4.2 || fotoBak.classList.contains('acik')) return;
  const rc = new THREE.Raycaster(); rc.setFromCamera(new THREE.Vector2((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1), kamera);
  const hits = rc.intersectObjects(DOLAP.kapilar.map(k => k.net));
  if (!hits.length || !hits[0].uv) return;
  const k = DOLAP.kapilar.find(q => q.net === hits[0].object), px = hits[0].uv.x * k.KW, py = (1 - hits[0].uv.y) * k.KH;
  const h = k.hot.find(q => px >= q[1] && px <= q[3] && py >= q[2] && py <= q[4]); if (!h) return;
  const kutu = fotoBak.querySelector('.fg'); kutu.innerHTML = ''; const im = new Image(); im.src = 'foto/' + h[5]; im.alt = ''; kutu.appendChild(im);
  fotoBak.classList.add('acik'); fotoAcildi = performance.now(); fotoBtn.classList.remove('acik');
});
function dolapGuncelle(t) {
  if (!DOLAP.kapilar) return;
  const uz = Math.hypot(kon.x - DOLAP.kx, kon.z - DOLAP.kz), yak = uz < 3.6 && !fotoBak.classList.contains('acik');
  DOLAP.kapilar.forEach(k => k.isik.forEach((m, i) => { m.material.opacity = yak ? 0.25 + 0.3 * Math.sin(t * 3 + i * 1.3) * 0.5 + 0.15 : 0; }));
  if (yak && kon.x > ODA_X + 1) { const metin = 'Dolaptaki fotoğraflara dokun, büyüsün.'; if (yonKutu.textContent !== metin) yonKutu.textContent = metin; yonKutu.classList.add('acik'); }
}

function vantilatorGuncelle(t) {
  if (!vantilator.kanatlar) return;
  vantilator.kanatlar.rotation.z = t * 14;
  vantilator.bas.rotation.y = -2.16 + Math.sin(t * 0.5) * 0.4;   // yavaşça sağa sola döner
  const uz = Math.hypot(kon.x - 12.5, kon.z + 21.2);
  if (vantilator.yazi) vantilator.yazi.material.opacity = 0.95 * (1 - Math.min(1, Math.max(0, (uz - 1.6) / 1.6)));   // yaklaşınca belirir
}
function engelleriItele(nesne, yaricap, sek, liste) {   // nesne: {x,z} (+ vx,vz sekmesi için)
  (liste || ENGELLER2).forEach(o => {
    const dx = nesne.x - o.x, dz = nesne.z - o.z, d = Math.hypot(dx, dz), R = o.r + yaricap;
    if (d < R && d > 0.0001) {
      nesne.x = o.x + dx / d * R; nesne.z = o.z + dz / d * R;
      if (sek) { const v = nesne.vx * dx / d + nesne.vz * dz / d; if (v < 0) { nesne.vx -= 1.7 * v * dx / d; nesne.vz -= 1.7 * v * dz / d; } }
    }
  });
}
// ---------- Boyanacak gül kapısı (sonraki odaya geçiş) ----------
const K3 = { x: 10.0, z: ODA2_Z1, gen: 1.3, yuk: 2.35, acik: KAPILAR_ACIK, aci: 0, hinge: null, glow: null, kanat: null, doku: null, tuval: null, bolgeler: [], sonDokunus: 0, bitti: false };
const K3_PX = 512, K3_PY = 1024;
function k3Bolge(path, tur, mx, my) { K3.bolgeler.push({ path, tur, dolu: false, anim: 0, ax: mx, ay: my, renk: null }); }
(function gulKapisiKur() {
  const tuval = document.createElement('canvas'); tuval.width = K3_PX; tuval.height = K3_PY;
  K3.tuval = tuval; K3.doku = new THREE.CanvasTexture(tuval); K3.doku.anisotropy = 4;
  const P = (fn) => { const p = new Path2D(); fn(p); return p; };
  const elips = (cx, cy, rx, ry, rot) => P(p => p.ellipse(cx, cy, rx, ry, rot, 0, Math.PI * 2));
  const cx = 256, cy = 330;
  // çizim sırası: alttan üste (üstteki bölge dokunuşta önce yakalanır)
  // sap (hafif kıvrık)
  k3Bolge(P(p => { p.moveTo(244, 470); p.bezierCurveTo(236, 640, 270, 800, 250, 990); p.lineTo(278, 990); p.bezierCurveTo(296, 800, 262, 640, 272, 470); p.closePath(); }), 'yaprak', 258, 780);
  // yapraklar
  k3Bolge(P(p => { p.moveTo(250, 760); p.bezierCurveTo(200, 690, 120, 690, 80, 720); p.bezierCurveTo(120, 800, 210, 810, 250, 760); p.closePath(); }), 'yaprak', 160, 750);
  k3Bolge(P(p => { p.moveTo(268, 860); p.bezierCurveTo(320, 790, 400, 790, 440, 825); p.bezierCurveTo(400, 905, 310, 915, 268, 860); p.closePath(); }), 'yaprak', 350, 850);
  // çanak yaprakları (çiçeğin altı)
  k3Bolge(P(p => { p.moveTo(256, 486); p.bezierCurveTo(200, 480, 160, 440, 150, 420); p.bezierCurveTo(200, 430, 240, 450, 256, 486); p.closePath(); }), 'yaprak', 205, 455);
  k3Bolge(P(p => { p.moveTo(256, 486); p.bezierCurveTo(312, 480, 352, 440, 362, 420); p.bezierCurveTo(312, 430, 272, 450, 256, 486); p.closePath(); }), 'yaprak', 307, 455);
  // dış taç yaprakları (5)
  [-90, -18, 54, 126, 198].forEach(d => { const a = d * Math.PI / 180; k3Bolge(elips(cx + 105 * Math.cos(a), cy + 105 * Math.sin(a), 72, 118, a + Math.PI / 2), 'petal', cx + 130 * Math.cos(a), cy + 130 * Math.sin(a)); });
  // orta taç yaprakları (4)
  [-45, 45, 135, 225].forEach(d => { const a = d * Math.PI / 180; k3Bolge(elips(cx + 62 * Math.cos(a), cy + 62 * Math.sin(a), 52, 82, a + Math.PI / 2), 'petal', cx + 80 * Math.cos(a), cy + 80 * Math.sin(a)); });
  // iç tomurcuk
  k3Bolge(elips(cx - 14, cy - 8, 40, 56, -0.35), 'petal', cx - 14, cy - 8);
  k3Bolge(elips(cx + 22, cy + 10, 34, 48, 0.45), 'petal', cx + 22, cy + 10);
  const PETAL = ['#c8102e', '#d92b45', '#a60d26', '#e64a5f', '#b3122c', '#cf1b38'];
  const YAPRAK = ['#2e8b3d', '#3da34d', '#237a35'];
  let pi = 0, yi = 0;
  K3.bolgeler.forEach(b => { b.renk = b.tur === 'petal' ? PETAL[pi++ % PETAL.length] : YAPRAK[yi++ % YAPRAK.length]; });

  K3.ciz = function () {
    const x = tuval.getContext('2d');
    x.fillStyle = '#f6efe0'; x.fillRect(0, 0, K3_PX, K3_PY);
    x.lineJoin = 'round'; x.lineCap = 'round';
    K3.bolgeler.forEach(b => {
      if (b.dolu || b.anim > 0) {
        x.save(); x.clip(b.path);
        x.fillStyle = b.renk;
        if (b.dolu && b.anim >= 1) x.fillRect(0, 0, K3_PX, K3_PY);
        else { x.beginPath(); x.arc(b.ax, b.ay, 260 * b.anim, 0, Math.PI * 2); x.fill(); }
        x.restore();
      }
      x.strokeStyle = '#1b1517'; x.lineWidth = 5; x.stroke(b.path);
    });
    // süs çizgileri: taç yaprağı iç hatları, dikenler
    x.strokeStyle = '#1b1517'; x.lineWidth = 3;
    x.beginPath(); x.moveTo(cx - 10, cy - 40); x.quadraticCurveTo(cx + 30, cy - 10, cx + 5, cy + 30); x.stroke();
    [[250, 560, 226, 548], [272, 620, 296, 608], [248, 690, 224, 680]].forEach(t => { x.beginPath(); x.moveTo(t[0], t[1]); x.lineTo(t[2], t[3]); x.lineTo(t[0], t[1] + 14); x.stroke(); });
    K3.doku.needsUpdate = true;
  };
  K3.ciz();

  // kapı: duvarda, yüzü odaya (−z) bakar
  const g = new THREE.Group(); g.position.set(K3.x, 0, K3.z); g.rotation.y = Math.PI; sahne.add(g);
  const kasa = new THREE.MeshPhongMaterial({ color: 0xb08a4f, specular: 0xfff0c0, shininess: 40, emissive: 0x2a1c06 });
  [-1, 1].forEach(y => { const k = new THREE.Mesh(new THREE.BoxGeometry(0.08, K3.yuk + 0.1, 0.1), kasa); k.position.set(y * (K3.gen / 2 + 0.05), K3.yuk / 2, 0.05); g.add(k); });
  const ust = new THREE.Mesh(new THREE.BoxGeometry(K3.gen + 0.18, 0.1, 0.1), kasa); ust.position.set(0, K3.yuk + 0.05, 0.05); g.add(ust);
  // kapı açılınca görünen sıcak ışık
  const gc = document.createElement('canvas'); gc.width = 64; gc.height = 128;
  const gx = gc.getContext('2d'), gr = gx.createRadialGradient(32, 84, 4, 32, 84, 90);
  gr.addColorStop(0, 'rgba(255,236,190,1)'); gr.addColorStop(0.5, 'rgba(255,190,110,.9)'); gr.addColorStop(1, 'rgba(255,150,70,.6)');
  gx.fillStyle = gr; gx.fillRect(0, 0, 64, 128);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(K3.gen, K3.yuk), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(gc), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  glow.position.set(0, K3.yuk / 2, 0.03); g.add(glow); K3.glow = glow;
  const hinge = new THREE.Group(); hinge.position.set(-K3.gen / 2, 0, 0.06); g.add(hinge); K3.hinge = hinge;
  const kanat = new THREE.Mesh(new THREE.PlaneGeometry(K3.gen, K3.yuk), new THREE.MeshBasicMaterial({ map: K3.doku, color: 0xdcdcdc, fog: false, side: THREE.DoubleSide }));
  kanat.position.set(K3.gen / 2, K3.yuk / 2, 0); hinge.add(kanat); K3.kanat = kanat;

  // kapının üstünde duvarda yönerge
  const yc = document.createElement('canvas'); yc.width = 1536; yc.height = 224;
  const yx = yc.getContext('2d'); const yd = new THREE.CanvasTexture(yc);
  function yaziCiz() {
    yx.clearRect(0, 0, 1536, 224);
    yx.textAlign = 'center'; yx.textBaseline = 'middle';
    const t = 'Boyama kitapları yerine bu kapıyı boya';
    let b = 110; const f = () => b + 'px "Great Vibes", "Snell Roundhand", "Brush Script MT", cursive';
    yx.font = f(); while (yx.measureText(t).width > 1440 && b > 40) { b -= 4; yx.font = f(); }
    const gr2 = yx.createLinearGradient(0, 0, 1536, 0); gr2.addColorStop(0, '#fff3cf'); gr2.addColorStop(0.5, '#d9a94f'); gr2.addColorStop(1, '#f7e2a6');
    yx.shadowColor = 'rgba(0,0,0,.6)'; yx.shadowBlur = 10; yx.fillStyle = gr2; yx.fillText(t, 768, 112);
    yd.needsUpdate = true;
  }
  yaziCiz();
  if (document.fonts && document.fonts.load) document.fonts.load('100px "Great Vibes"', 'Boyama kitapları yerine bu kapıyı boya').then(yaziCiz).catch(() => {});
  const yazi = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6 * 224 / 1536), new THREE.MeshBasicMaterial({ map: yd, transparent: true, depthWrite: false, fog: false }));
  yazi.position.set(K3.x, 2.82, K3.z - 0.03); yazi.rotation.y = Math.PI; sahne.add(yazi);

  // kalem
  const kalem = new THREE.Group();
  const gv = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.2, 6), new THREE.MeshPhongMaterial({ color: 0xffd23f, specular: 0xffffff, shininess: 40 })); gv.position.y = 0.11; kalem.add(gv);
  const uc = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.035, 6), new THREE.MeshPhongMaterial({ color: 0xe8c79a })); uc.rotation.x = Math.PI; uc.position.y = -0.0175; kalem.add(uc);
  const ku = new THREE.Mesh(new THREE.ConeGeometry(0.0055, 0.014, 6), new THREE.MeshPhongMaterial({ color: 0x2b2b2b })); ku.rotation.x = Math.PI; ku.position.y = -0.042; kalem.add(ku);
  const si = new THREE.Mesh(new THREE.CylinderGeometry(0.0125, 0.0125, 0.03, 6), new THREE.MeshPhongMaterial({ color: 0xf08aa0 })); si.position.y = 0.225; kalem.add(si);
  kalem.rotation.z = 0.75; kalem.position.set(K3.x + 0.3, 1.0, K3.z - 0.12);
  sahne.add(kalem); K3.kalem = kalem; K3.kalemHedef = new THREE.Vector3(K3.x + 0.3, 1.0, K3.z - 0.12);
})();
function k3Dunya(px, py) {   // tuval noktası → dünya noktası
  return new THREE.Vector3(K3.x - (px / K3_PX - 0.5) * K3.gen, (1 - py / K3_PY) * K3.yuk, K3.z - 0.1);
}
function k3Boya(b, px, py) {
  if (b.dolu) return;
  b.dolu = true; b.anim = 0.001; b.ax = px; b.ay = py;
  K3.sonDokunus = performance.now();
  K3.kalemHedef.copy(k3Dunya(px, py)).add(new THREE.Vector3(0.05, 0.05, -0.03));
  const say = K3.bolgeler.filter(x => x.dolu).length;
  if (!K3.bitti && say >= Math.ceil(K3.bolgeler.length * 0.75)) {
    K3.bitti = true;
    setTimeout(() => { K3.acik = true; gicirti(1.5); kalpPatlat(); }, 700);
  }
}
function k3Dokun(cx, cy) {   // ekrana dokunuşu kapıya çevir
  if (!K3.kanat) return;
  const uz = Math.hypot(kon.x - K3.x, kon.z - K3.z);
  if (uz > 6 || K3.acik) return;
  const rc = new THREE.Raycaster();
  rc.setFromCamera(new THREE.Vector2((cx / window.innerWidth) * 2 - 1, -(cy / window.innerHeight) * 2 + 1), kamera);
  const h = rc.intersectObject(K3.kanat);
  if (!h.length || !h[0].uv) return;
  const px = h[0].uv.x * K3_PX, py = (1 - h[0].uv.y) * K3_PY;
  const x = K3.tuval.getContext('2d');
  for (let i = K3.bolgeler.length - 1; i >= 0; i--) {   // üstteki bölge önce
    if (x.isPointInPath(K3.bolgeler[i].path, px, py)) { k3Boya(K3.bolgeler[i], px, py); return; }
  }
}
let k3Dokun0 = null;
canvas.addEventListener('pointerdown', e => { k3Dokun0 = { x: e.clientX, y: e.clientY, t: performance.now() }; });
canvas.addEventListener('pointerup', e => {
  if (k3Dokun0 && Math.hypot(e.clientX - k3Dokun0.x, e.clientY - k3Dokun0.y) < 12 && performance.now() - k3Dokun0.t < 500) k3Dokun(e.clientX, e.clientY);
  k3Dokun0 = null;
});
let k3Onceki = 0;
function k3Guncelle(simdi) {
  const dt = Math.min(0.05, (simdi - (k3Onceki || simdi)) / 1000); k3Onceki = simdi;
  // boyama animasyonu
  let degisti = false;
  K3.bolgeler.forEach(b => { if (b.dolu && b.anim < 1) { b.anim = Math.min(1, b.anim + dt * 2.2); degisti = true; } });
  if (degisti) K3.ciz();
  // kalem: hedefe süzülür, yakındayken kendi de bir bölgeyi boyar (ipucu)
  const uz = Math.hypot(kon.x - K3.x, kon.z - K3.z);
  if (uz < 5 && !K3.yaklasti) { K3.yaklasti = true; K3.sonDokunus = simdi; }
  if (!K3.acik && K3.yaklasti && uz < 5 && simdi - K3.sonDokunus > 9000 && !K3.bitti) {
    const bos = K3.bolgeler.filter(b => !b.dolu && b.tur === 'petal');
    const liste = bos.length ? bos : K3.bolgeler.filter(b => !b.dolu);
    if (liste.length) { const b = liste[Math.floor(Math.random() * liste.length)]; k3Boya(b, b.ax, b.ay); }
  }
  const kal = K3.kalem;
  kal.position.lerp(K3.kalemHedef, Math.min(1, dt * 4));
  kal.position.y += Math.sin(simdi / 300) * 0.0008;
  kal.rotation.z = 0.75 + Math.sin(simdi / 120) * 0.05 * (simdi - K3.sonDokunus < 900 ? 1 : 0.2);
  // kapı açılması
  K3.aci += (((K3.acik && !K3.kapandi) ? -1.9 : 0) - K3.aci) * Math.min(1, dt * 1.6);
  K3.hinge.rotation.y = K3.aci;
  K3.glow.material.opacity = 0;
  if (K3.acik) kal.visible = false;
}
// paten rafı: girişte, holün kuzeyinde
const rafMat = new THREE.MeshPhongMaterial({ color: 0x8a6240, specular: 0x000000, shininess: 4 });
kutu(0.55, 0.06, 1.8, rafMat, HOL_SON + 0.3, 0.38, -16.4);
[[-0.75], [0.75]].forEach(k => kutu(0.5, 0.38, 0.06, rafMat, HOL_SON + 0.3, 0.19, -16.4 + k[0]));


// mumlar: koridorda ve odada, titreyen ışıklı
const mumlar = [];
const matMum = new THREE.MeshPhongMaterial({ color: 0xf1e4c8, specular: 0x000000 });
const matAlev = new THREE.MeshBasicMaterial({ color: 0xffb35a });
function mumYap(x, z, isikGuc, menzil) {
  const g = new THREE.Group();
  const govde = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.22, 10), matMum);
  govde.position.y = 0.11; g.add(govde);
  const alev = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), matAlev);
  alev.scale.set(1, 1.9, 1); alev.position.y = 0.26; g.add(alev);
  g.position.set(x, 0, z);
  sahne.add(g);
  let isik = null;
  if (isikGuc > 0) {
    isik = new THREE.PointLight(0xffa850, isikGuc, menzil, 1.6);
    isik.position.set(x, 0.5, z);
    sahne.add(isik);
  }
  mumlar.push({ alev, isik, guc: isikGuc, faz: Math.random() * 10 });
}
// duvar şamdanı: altın plaka, kol, kadeh, mum ve altında küçük gül-yaprak süsü
const matSamdan = new THREE.MeshPhongMaterial({ color: 0xc9a24a, specular: 0xfff0c0, shininess: 50, emissive: 0x2a1c06 });
const matSuYesil = new THREE.MeshPhongMaterial({ color: 0x2f5a2a, specular: 0x000000 });
const matSuGul = new THREE.MeshPhongMaterial({ color: 0xa3142a, specular: 0x331010, shininess: 14 });
function duvarMum(x, y, z, rotY, isikGuc, menzil, yansima) {
  const g = new THREE.Group();
  const plaka = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.015, 16), matSamdan);
  plaka.rotation.x = Math.PI / 2; plaka.position.z = 0.008; g.add(plaka);
  const kol = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.022, 0.11), matSamdan);
  kol.position.set(0, 0, 0.065); g.add(kol);
  const kadeh = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.035, 0.04, 12), matSamdan);
  kadeh.position.set(0, 0, 0.12); g.add(kadeh);
  const mum = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.034, 0.2, 10), matMum);
  mum.position.set(0, 0.12, 0.12); g.add(mum);
  const alev = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), matAlev);
  alev.scale.set(1, 1.9, 1); alev.position.set(0, 0.255, 0.12); g.add(alev);
  // altında sarkan küçük gül ve yaprak süsü
  [[-0.035, -0.1], [0.04, -0.115]].forEach(p => {
    const r = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), matSuGul);
    r.position.set(p[0], p[1], 0.05); g.add(r);
  });
  [[-0.06, -0.14, 0.7], [0.0, -0.17, 0], [0.06, -0.14, -0.7]].forEach(p => {
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), matSuYesil);
    l.scale.set(1, 0.14, 0.45); l.position.set(p[0], p[1], 0.045); l.rotation.z = p[2]; g.add(l);
  });
  g.position.set(x, y, z);
  g.rotation.y = rotY;
  sahne.add(g);
  let isik = null;
  if (isikGuc > 0) {
    isik = new THREE.PointLight(0xffa850, isikGuc, menzil, 1.6);
    isik.position.set(0, 0.3, 0.25);
    g.add(isik);
  }
  if (BUZ && YANSIMA && yansima) {
    const ref = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 1.1),
      new THREE.MeshBasicMaterial({ map: sicakDoku, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    ref.rotation.x = -Math.PI / 2; ref.position.set(0, -y + 0.022, 0.65);
    g.add(ref);
  }
  mumlar.push({ alev, isik, guc: isikGuc, faz: Math.random() * 10 });
}
// koridor: iki duvarda dönüşümlü
[[-1, 1.0, 2.0], [1, -2.0, 0], [-1, -5.0, 2.0], [1, -8.0, 0], [-1, -11.0, 2.0], [1, -14.0, 0]].forEach(k => {
  duvarMum(k[0] * KOR_X, 1.5, k[1], -k[0] * Math.PI / 2, k[2], 7);
});
// koridorun başı: uç duvarda
[-0.9, 0.9].forEach(x => duvarMum(x, 1.5, KOR_BAS, Math.PI, 0, 0));
// oda: fotoğraf duvarı
duvarMum(-1.6, 1.15, ODA_SON, 0, 0.5, 7, true);
duvarMum(1.6, 1.15, ODA_SON, 0, 0.5, 7, true);
[-3.0, 3.0, -4.6, 4.6].forEach(x => duvarMum(x, 1.15, ODA_SON, 0, 0, 0, true));
// oda: yan duvarlar (videoların iki yanında)
[-17.6, -18.9, -24.6, -25.7].forEach(z => {
  duvarMum(-ODA_X, 1.2, z, Math.PI / 2, 0, 0, true);
  if (z < -20) duvarMum(ODA_X, 1.2, z, -Math.PI / 2, 0, 0, true);
});
// oda: kapı tarafındaki duvar
[-4.0, -2.4, 2.4, 4.0].forEach(x => duvarMum(x, 1.5, KAPI_Z - 0.11, Math.PI, 0, 0, true));

// ---------- Duvar kalpleri ve kapıyı gösteren oklar ----------
const kalpSekil = new THREE.Shape();
kalpSekil.moveTo(0, -0.5);
kalpSekil.bezierCurveTo(-0.15, -0.35, -0.6, -0.05, -0.6, 0.22);
kalpSekil.bezierCurveTo(-0.6, 0.5, -0.2, 0.62, 0, 0.3);
kalpSekil.bezierCurveTo(0.2, 0.62, 0.6, 0.5, 0.6, 0.22);
kalpSekil.bezierCurveTo(0.6, -0.05, 0.15, -0.35, 0, -0.5);
const kalpGeo = new THREE.ExtrudeGeometry(kalpSekil, { depth: 0.04, bevelEnabled: false });
const okSekil = new THREE.Shape();
okSekil.moveTo(-0.3, -0.05); okSekil.lineTo(0.1, -0.05); okSekil.lineTo(0.1, -0.16);
okSekil.lineTo(0.38, 0); okSekil.lineTo(0.1, 0.16); okSekil.lineTo(0.1, 0.05); okSekil.lineTo(-0.3, 0.05);
const okGeo = new THREE.ExtrudeGeometry(okSekil, { depth: 0.03, bevelEnabled: false });
sahisOklariKur();
const matKalp = new THREE.MeshBasicMaterial({ color: 0xd22a4a });
const matOk = new THREE.MeshBasicMaterial({ color: 0xe8b25f, side: THREE.DoubleSide });
const oklar = [];

[[-1, 1], [1, -1]].forEach(([yon, ters]) => {
  const duvarX = yon * (KOR_X - 0.01);
  const donus = -yon * Math.PI / 2;
  [1.0, -2.0, -5.0, -8.0, -11.0, -14.0].forEach((z, i) => {
    const kalp = new THREE.Mesh(kalpGeo, matKalp);
    const b = i % 2 === 0 ? 0.3 : 0.22;
    kalp.scale.set(b, b, 1);
    kalp.position.set(duvarX, 2.15 - (i % 2) * 0.15, z + (yon > 0 ? 0 : 0.6));
    kalp.rotation.y = donus;
    sahne.add(kalp);
  });
  [2.5, -0.5, -3.5, -6.5, -9.5, -12.5].forEach(z => {
    const ok = new THREE.Mesh(okGeo, matOk);
    ok.scale.set(ters * 1.2, 1.2, 1);
    ok.position.set(duvarX, 1.35, z);
    ok.rotation.y = donus;
    sahne.add(ok);
    oklar.push(ok);
  });
});
// kapının üstünde aşağı bakan ok
const kapiOku = new THREE.Mesh(okGeo, matOk);
kapiOku.scale.set(0.6, 0.6, 1);
kapiOku.rotation.z = -Math.PI / 2;
kapiOku.position.set(0, AC_YUK + 0.28, KAPI_Z + 0.06);
sahne.add(kapiOku);

// ---------- Gül yaprakları ve güller ----------
(function gulleriSer() {
  const yapraklar = [];
  const rast = (a, b) => a + Math.random() * (b - a);
  for (let i = 0; i < 280; i++) {
    // ortada yoğun, kenarlara doğru seyrek; kapıya doğru biraz daha çok
    const x = (Math.random() + Math.random() + Math.random() - 1.5) * 0.95;
    yapraklar.push([x, rast(KOR_BAS - 0.6, KAPI_Z + 0.3)]);
  }
  for (let i = 0; i < 50; i++) {
    const x = (Math.random() + Math.random() - 1) * 1.8;
    yapraklar.push([x, rast(KAPI_Z - 0.4, ODA_SON + 3.5)]);
  }
  const geo = new THREE.SphereGeometry(0.055, 8, 6);
  geo.scale(1, 0.14, 0.72);
  const mat = new THREE.MeshPhongMaterial({ specular: 0x110d08, shininess: 6,  color: 0xffffff });
  const grup = new THREE.InstancedMesh(geo, mat, yapraklar.length);
  const d = new THREE.Object3D(), renk = new THREE.Color();
  const tonlar = [0x8a0f1f, 0xa3142a, 0xb81d35, 0x6e0b18, 0xc42a43];
  yapraklar.forEach((p, i) => {
    const b = rast(0.8, 1.5);
    d.position.set(p[0], 0.012 + Math.random() * 0.01, p[1]);
    d.rotation.set(rast(-0.25, 0.25), rast(0, Math.PI * 2), rast(-0.25, 0.25));
    d.scale.set(b, b, b);
    d.updateMatrix();
    grup.setMatrixAt(i, d.matrix);
    renk.setHex(tonlar[Math.floor(Math.random() * tonlar.length)]);
    grup.setColorAt(i, renk);
  });
  grup.instanceMatrix.needsUpdate = true;
  grup.instanceColor.needsUpdate = true;
  sahne.add(grup);

  // yerde yatan güller: spiral dizilmiş kıvrık taç yapraklı
  function yaprakGeo(W, H, kıvrık) {
    const nu = 7, nv = 9, pos = [], idx = [];
    for (let a = 0; a <= nu; a++) {
      const u = a / nu;
      const f = Math.pow(u, 0.4) * Math.sqrt(Math.max(0, 1 - Math.pow(u, 4)));
      for (let b = 0; b <= nv; b++) {
        const v = (b / nv) * 2 - 1;
        const x = v * W * f;
        pos.push(x, u * H, -x * x * 7 + H * 0.35 * u * u * kıvrık);
      }
    }
    for (let a = 0; a < nu; a++) for (let b = 0; b < nv; b++) {
      const p = a * (nv + 1) + b;
      idx.push(p, p + 1, p + nv + 1, p + 1, p + nv + 2, p + nv + 1);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }
  function gulYap(tonlar) {
    const g = new THREE.Group();
    const matlar = tonlar.map(c => new THREE.MeshPhongMaterial({ color: c, specular: 0x220a0a, shininess: 18, side: THREE.DoubleSide }));
    const N = 20;
    for (let k = 0; k < N; k++) {
      const t = k / (N - 1);
      const W = 0.026 + 0.034 * t, H = 0.06 + 0.04 * t;
      const p = new THREE.Mesh(yaprakGeo(W, H, t), matlar[Math.min(matlar.length - 1, Math.floor(t * matlar.length))]);
      const yer = new THREE.Group();
      p.position.z = 0.008 + 0.04 * t;
      p.rotation.x = 0.04 + 1.0 * t * t + 0.1 * t;
      yer.add(p);
      yer.rotation.y = k * 2.39996;
      yer.position.y = 0.02 * (1 - t);
      g.add(yer);
    }
    const sap = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.012, 0.5, 6),
      new THREE.MeshPhongMaterial({ color: 0x2f5a2a, specular: 0x000000 }));
    sap.position.y = -0.25;
    g.add(sap);
    const yaprak = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6),
      new THREE.MeshPhongMaterial({ color: 0x356b30, specular: 0x000000 }));
    yaprak.scale.set(1, 0.12, 0.45); yaprak.position.set(0.04, -0.2, 0); yaprak.rotation.z = 0.4;
    g.add(yaprak);
    return g;
  }
  const gulTipleri = [
    gulYap([0x4d0610, 0x6e0b18, 0x8a0f1f, 0xa3142a]),
    gulYap([0x5a0814, 0x7a0f20, 0x9b1328, 0xb81d35]),
    gulYap([0x430510, 0x620a17, 0x80101f, 0x9a1426])
  ];
  const konumlar = [[-1.1, 2.4], [1.15, 0.6], [-1.2, -2.8], [1.05, -5.0], [-1.0, -7.2],
    [1.2, -9.4], [-1.15, -11.6], [1.0, -13.4], [-0.9, -14.9], [0.7, -15.2],
    [-1.9, -25.4], [1.9, -25.6], [-4.7, -24.0], [4.7, -23.6], [-4.6, -19.5], [4.6, -19.8], [-1.0, -24.3], [1.1, -24.0]];
  konumlar.forEach((k, i) => {
    const g = gulTipleri[i % gulTipleri.length].clone();
    const kok = new THREE.Group();
    g.rotation.z = -1.2;
    g.position.y = 0.17;
    kok.add(g);
    kok.position.set(k[0], 0, k[1]);
    kok.rotation.y = rast(0, Math.PI * 2);
    sahne.add(kok);
  });
})();

// fotoğrafın iki yanında, yan duvardaki videolara yönlendiren, dışa doğru akan oklar
const yanOklar = [];
[-1, 1].forEach(yon => {
  [1.95, 2.55, 3.15, 3.75, 4.35].forEach((x, k) => {
    const mat = new THREE.MeshBasicMaterial({ color: 0xe8b25f, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
    const ok = new THREE.Mesh(okGeo, mat);
    ok.scale.set(yon * 0.7, 0.7, 1);
    ok.position.set(yon * x, 1.9, ODA_SON + 0.04);
    sahne.add(ok);
    yanOklar.push({ mat, k, yon });
  });
  // devamı: yan duvarda köşeden videoya doğru
  [-26.3, -25.6, -24.9, -24.2].forEach((z, n) => {
    const mat = new THREE.MeshBasicMaterial({ color: 0xe8b25f, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
    const ok = new THREE.Mesh(okGeo, mat);
    ok.scale.set(yon < 0 ? -0.7 : 0.7, 0.7, 1);
    ok.position.set(yon * (ODA_X - 0.01), 1.9, z);
    ok.rotation.y = -yon * Math.PI / 2;
    sahne.add(ok);
    yanOklar.push({ mat, k: 5 + n, yon });
  });
});

// ---------- Tabloların yanından dökülen gül yaprakları ----------
const DOK_YER = [
  { x: -1.5, z: ODA_SON + 0.4, gx: 0.45, gz: 0.25 }, { x: 1.5, z: ODA_SON + 0.4, gx: 0.45, gz: 0.25 },
  { x: -5.05, z: -23.8, gx: 0.3, gz: 0.4 }, { x: -5.05, z: -19.4, gx: 0.3, gz: 0.4 },
  { x: 5.05, z: -23.0, gx: 0.3, gz: 0.4 }, { x: 5.05, z: -20.2, gx: 0.3, gz: 0.4 }
];
const DOK_N = 150;
const dokGeo = new THREE.SphereGeometry(0.06, 8, 6);
dokGeo.scale(1, 0.14, 0.72);
const dokGrup = new THREE.InstancedMesh(dokGeo, new THREE.MeshLambertMaterial({ color: 0xffffff }), DOK_N);
const dokDurum = [];
(function dokKur() {
  const tonlar = [0x8a0f1f, 0xa3142a, 0xb81d35, 0x6e0b18, 0xc42a43], renk = new THREE.Color();
  for (let i = 0; i < DOK_N; i++) {
    renk.setHex(tonlar[i % tonlar.length]);
    dokGrup.setColorAt(i, renk);
    const d = { e: DOK_YER[i % DOK_YER.length], ph: Math.random() * 6.28, hiz: 0.35 + Math.random() * 0.25,
      x: 0, y: 0, z: 0, rx: Math.random() * 6, ry: Math.random() * 6, rz: Math.random() * 6, bekle: 0, bek: 6 + Math.random() * 8 };
    dokDoğur(d, Math.random() < 0.35 ? 0 : Math.random() * 3.7);
    dokDurum.push(d);
  }
  dokGrup.instanceColor.needsUpdate = true;
})();
function dokDoğur(d, y) {
  d.x = d.e.x + (Math.random() - 0.5) * d.e.gx;
  d.z = d.e.z + (Math.random() - 0.5) * d.e.gz;
  d.y = y; d.bekle = 0;
}
sahne.add(dokGrup);
const dokNesne = new THREE.Object3D();
function yaprakDok(dt, t) {
  for (let i = 0; i < DOK_N; i++) {
    const d = dokDurum[i];
    if (d.y > 0.014) {
      d.y -= d.hiz * dt;
      d.x += Math.sin(t * 1.3 + d.ph) * 0.16 * dt;
      d.z += Math.cos(t * 1.1 + d.ph) * 0.1 * dt;
      d.rx += dt * 1.4; d.ry += dt * 0.8; d.rz += dt * 1.1;
      if (d.y <= 0.014) { d.y = 0.014; d.rx = Math.random() * 0.3; d.rz = Math.random() * 0.3; }
    } else {
      d.bekle += dt;
      if (d.bekle > d.bek) dokDoğur(d, 3.7);
    }
    dokNesne.position.set(d.x, d.y, d.z);
    dokNesne.rotation.set(d.rx, d.ry, d.rz);
    dokNesne.updateMatrix();
    dokGrup.setMatrixAt(i, dokNesne.matrix);
  }
  dokGrup.instanceMatrix.needsUpdate = true;
}

// ---------- Fotoğraf ----------
const FOTO_Z = ODA_SON + 0.045, FOTO_Y = 1.9, FOTO_YUK = 3;
let fotoNet = null, fotoBulanik = null, fotoIsik = null, fotoYansima = null;
const odaIsik = new THREE.PointLight(0xfff0dc, 0, 16, 2);
odaIsik.position.set(0, 3.5, ODA_SON + 3);
sahne.add(odaIsik);

new THREE.TextureLoader().load(ODA1.foto, tex => {
  const img = tex.image;
  const oran = img.width / img.height;
  const gen = FOTO_YUK * oran;
  tex.anisotropy = 4;

  // bulanık sürüm: küçük çizilip büyütülür
  const c = document.createElement('canvas');
  c.width = 18; c.height = Math.max(8, Math.round(18 / oran));
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  const bulTex = new THREE.CanvasTexture(c);
  bulTex.magFilter = THREE.LinearFilter; bulTex.minFilter = THREE.LinearFilter;

  kutu(gen + 0.24, FOTO_YUK + 0.24, 0.06, new THREE.MeshPhongMaterial({ specular: 0x110d08, shininess: 6,  color: 0x1a1210 }), 0, FOTO_Y, ODA_SON - 0.0 + 0.0);
  fotoNet = new THREE.Mesh(new THREE.PlaneGeometry(gen, FOTO_YUK),
    new THREE.MeshBasicMaterial({ map: tex, color: 0x1f1f1f, fog: false }));
  fotoNet.position.set(0, FOTO_Y, FOTO_Z);
  sahne.add(fotoNet);
  fotoBulanik = new THREE.Mesh(new THREE.PlaneGeometry(gen, FOTO_YUK),
    new THREE.MeshBasicMaterial({ map: bulTex, color: 0x1f1f1f, transparent: true, fog: false }));
  fotoBulanik.position.set(0, FOTO_Y, FOTO_Z + 0.004);
  sahne.add(fotoBulanik);
  if (BUZ && YANSIMA) {
    const rc = document.createElement('canvas'); rc.width = 128; rc.height = Math.max(64, Math.round(128 / oran));
    const rx = rc.getContext('2d');
    rx.drawImage(img, 0, 0, rc.width, rc.height);
    rx.globalCompositeOperation = 'destination-in';
    const rg = rx.createLinearGradient(0, rc.height, 0, 0);
    rg.addColorStop(0, 'rgba(0,0,0,.9)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
    rx.fillStyle = rg; rx.fillRect(0, 0, rc.width, rc.height);
    const yansima = new THREE.Mesh(new THREE.PlaneGeometry(gen, 1.8),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(rc), transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    yansima.rotation.x = -Math.PI / 2; yansima.scale.y = -1;
    yansima.position.set(0, 0.026, FOTO_Z + 0.9);
    sahne.add(yansima);
    fotoYansima = yansima;
  }
});

// ---------- Duvar videoları (sol ve sağ) ----------
const videolar = [];
function videoEkrani(kaynak, sol, z, y, gen, yuk) {
  const yon = sol ? -1 : 1;
  const v = document.createElement('video');
  v.src = kaynak;
  v.muted = true; v.loop = true; v.playsInline = true;
  v.setAttribute('playsinline', ''); v.setAttribute('muted', '');
  v.preload = 'auto';
  v.addEventListener('loadeddata', () => { if (v.paused) v.currentTime = 0.1; });
  const tex = new THREE.VideoTexture(v);
  tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter; tex.generateMipmaps = false;
  const ekran = new THREE.Mesh(new THREE.PlaneGeometry(gen, yuk), new THREE.MeshBasicMaterial({ map: tex, fog: false, color: 0x4d4d4d }));
  ekran.position.set(yon * (ODA_X - 0.07), y, z);
  ekran.rotation.y = -yon * Math.PI / 2;
  sahne.add(ekran);
  const cerceve = new THREE.Mesh(new THREE.BoxGeometry(0.06, yuk + 0.24, gen + 0.24),
    new THREE.MeshPhongMaterial({ color: 0x1a1210, specular: 0x000000 }));
  cerceve.position.set(yon * (ODA_X - 0.035), y, z);
  sahne.add(cerceve);
  const isik = { intensity: 0 };   // (gerçek ışık kaldırıldı: telefonu yoruyordu)
  let refl = null;
  if (BUZ && YANSIMA) refl = zeminParilti(soguDoku, yon * (ODA_X - 0.9), z, 1.5, gen + 0.8, 0.1);
  videolar.push({ v, isik, ekran, refl, x: ekran.position.x, z, oynuyor: false, parlak: 0.3, izle: 0 });
}
videoEkrani('video/pist.mp4', true, -21.6, 1.9, 3.2, 1.8);
videoEkrani('video/yan.mp4', false, -21.6, 1.85, 2.6 * 478 / 850, 2.6);

function videoGuncelle(icerde, dt) {
  videolar.forEach(o => {
    const uz = Math.hypot(kon.x - o.x, kon.z - o.z);
    const dx = o.x - kon.x, dz = o.z - kon.z;
    const bak = (-Math.sin(kon.yaw) * dx - Math.cos(kon.yaw) * dz) / (uz || 1);
    const bakiyor = bak > (o.oynuyor ? 0.25 : 0.5);
    const olsun = icerde && uz < 10 && bakiyor;
    if (olsun !== o.oynuyor) {
      o.oynuyor = olsun;
      if (olsun) { const p = o.v.play(); if (p && p.catch) p.catch(() => {}); }
      else o.v.pause();
    }
    if (o.oynuyor && o.parlak > 0.6) o.izle += dt;
    const hedefP = olsun ? 1 : (icerde ? 0.3 : 0);
    o.parlak += (hedefP - o.parlak) * Math.min(1, dt * 3);
    o.ekran.material.color.setRGB(o.parlak, o.parlak, o.parlak);
    o.isik.intensity = 0.55 * o.parlak;
    if (o.refl) o.refl.material.opacity = 0.06 + 0.4 * o.parlak;
  });
}

// ---------- Kapı sorusu: "Mehmetnur kaç kere kayıp düştü?" ----------
const SORU = {
  metin: 'Mehmetnur kaç kere kayıp düştü?',
  secenekler: ['4', '5', '6', 'Çok'],
  dogru: 'Çok',
  yanlis: {
    '4': 'Yok canım, daha fazla. Bir daha dene 😄',
    '5': 'Hayır hayır, saymayı bırakmıştım...',
    '6': 'Yaklaşmadı bile. Buz biliyor 🙈'
  },
  ipucu: 'İpucu: Sayamayacağın kadar.',
  dogruMesaj: 'Bildin! Çok! Kapı açılıyor...'
};
const KAPI2_X = ODA_X, KAPI2_Z = -18.7;
const kapi2 = { hinge: null, glow: null, isik: null, aci: KAPILAR_ACIK ? -1.9 : 0, acik: KAPILAR_ACIK };
let soruCozuldu = false, yanlisSayi = 0;

// kapının yanındaki küçük "kilitli" plakası
const plakaCan = document.createElement('canvas');
plakaCan.width = 512; plakaCan.height = 384;
const plakaDoku = new THREE.CanvasTexture(plakaCan);
function plakaCiz() {
  const x = plakaCan.getContext('2d'), W = 512, H = 384;
  x.fillStyle = '#1b1517'; x.fillRect(0, 0, W, H);
  const altin = x.createLinearGradient(0, 0, W, H);
  altin.addColorStop(0, '#fff3cf'); altin.addColorStop(0.5, '#d9a94f'); altin.addColorStop(1, '#f7e2a6');
  x.strokeStyle = altin; x.lineWidth = 6; x.strokeRect(14, 14, W - 28, H - 28);
  x.lineWidth = 2; x.strokeRect(30, 30, W - 60, H - 60);
  x.fillStyle = altin; x.strokeStyle = altin; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = '100px "Great Vibes", "Snell Roundhand", "Brush Script MT", cursive';
  x.fillText((soruCozuldu || KAPILAR_ACIK) ? 'Açık' : 'Kilitli', W / 2, 270);
  // kilit
  x.lineWidth = 12;
  x.beginPath();
  if (soruCozuldu || KAPILAR_ACIK) { x.arc(W / 2 + 18, 112, 38, Math.PI, 0); x.moveTo(W / 2 + 56, 112); x.lineTo(W / 2 + 56, 90); }
  else x.arc(W / 2, 112, 38, Math.PI, 0);
  x.stroke();
  x.fillRect(W / 2 - 56, 112, 112, 78);
  x.fillStyle = '#1b1517'; x.beginPath(); x.arc(W / 2, 148, 11, 0, Math.PI * 2); x.fill();
  plakaDoku.needsUpdate = true;
}
plakaCiz();
if (document.fonts && document.fonts.load) document.fonts.load('100px "Great Vibes"', 'Kilitli Açık').then(plakaCiz).catch(() => {});
const plaka = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.465), new THREE.MeshBasicMaterial({ map: plakaDoku, color: 0xb0b0b0, fog: false }));
plaka.position.set(ODA_X - 0.03, 1.5, -17.25);
plaka.rotation.y = -Math.PI / 2;
sahne.add(plaka);

const soruKart = document.getElementById('soru'), soruBaslik = document.getElementById('soruBaslik'),
  soruSec = document.getElementById('soruSec'), soruMesaj = document.getElementById('soruMesaj');
let soruGorunur = false, soruBitisZ = 0;
soruBaslik.textContent = SORU.metin;
SORU.secenekler.forEach(sc => {
  const b = document.createElement('button');
  b.textContent = sc;
  b.addEventListener('click', () => {
    if (soruCozuldu) return;
    if (sc === SORU.dogru) {
      soruCozuldu = true;
      soruMesaj.textContent = SORU.dogruMesaj;
      soruMesaj.className = 'dogru';
      soruSec.style.display = 'none';
      plakaCiz();
      kalpPatlat();
      kapi2.acik = true;
      gicirti(1.6);
      soruBitisZ = performance.now() + 5000;
    } else {
      yanlisSayi++;
      soruMesaj.textContent = (SORU.yanlis[sc] || 'Bir daha dene.') + (yanlisSayi >= 2 ? ' ' + SORU.ipucu : '');
      soruMesaj.className = 'yanlis';
      b.classList.add('sal');
      b.classList.add('solgun');
      setTimeout(() => b.classList.remove('sal'), 400);
    }
  });
  soruSec.appendChild(b);
});
function kalpPatlat() {
  for (let k = 0; k < 18; k++) {
    const h = document.createElement('span');
    h.className = 'ucankalp'; h.textContent = '♥';
    h.style.left = (10 + Math.random() * 80) + '%';
    h.style.animationDelay = (Math.random() * 0.8) + 's';
    h.style.fontSize = (22 + Math.random() * 30) + 'px';
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 4000);
  }
}
function soruGuncelle(icerde) {
  const dx = KAPI2_X - kon.x, dz = KAPI2_Z - kon.z, uz = Math.hypot(dx, dz);
  const bak = (-Math.sin(kon.yaw) * dx - Math.cos(kon.yaw) * dz) / (uz || 1);
  let goster = icerde && uz < 3.4 && bak > (soruGorunur ? 0.2 : 0.45);
  if (soruCozuldu && performance.now() > soruBitisZ) goster = false;
  if (goster !== soruGorunur) { soruGorunur = goster; soruKart.classList.toggle('acik', goster); }
}

// ---------- Yönerge: odadaki sıra ----------
let asama = 0, asamaT = 0, yonYazilan = -1, yonZaman = 0;
const yonKutu = document.getElementById('yonerge');
const ASAMA_YAZI = ['Karşıdaki fotoğrafa yaklaş.', 'Şimdi solundaki videoya bak.', 'Arkandaki videoya bak.',
  'Kapıya git. Bir sorum var.', 'Kapı açıldı.'];
const FOTO_SURE = 15, SOL_VIDEO_SURE = 35, SAG_VIDEO_SURE = 15;
function videoBasaSar(o) { if (o.izle < 1) { try { o.v.currentTime = 0; } catch (e) {} } }
function yonergeGuncelle(icerde, dt, fotoUz) {
  if (!icerde) { yonKutu.classList.remove('acik'); yonYazilan = -1; return; }
  if (!patenGiyildi) {
    if (yonYazilan !== -2) {
      yonYazilan = -2;
      yonKutu.textContent = 'Buz patenlerini giy: üzerlerine yürü.';
      yonZaman = performance.now();
      yonKutu.classList.add('acik'); elGoster('yuru');
    }
    if (elSu === 'yuru' && performance.now() - yonZaman > 6000) elGoster(null);
    return;
  }
  if (asama === 0 && fotoUz < 5.5) { asamaT += dt; if (asamaT >= FOTO_SURE) { asama = 1; videoBasaSar(videolar[0]); } }
  if (asama === 1 && videolar[0].izle >= SOL_VIDEO_SURE) { asama = 2; videoBasaSar(videolar[1]); }
  if (asama === 2 && videolar[1].izle >= SAG_VIDEO_SURE) asama = 3;
  if (asama < 4 && soruCozuldu) asama = 4;
  const simdi = performance.now();
  if (asama !== yonYazilan) {
    yonYazilan = asama; yonZaman = simdi;
    yonKutu.textContent = ASAMA_YAZI[asama];
    yonKutu.classList.add('acik');
    if (asama === 1) { otoBak(videolar[0].x, videolar[0].z); elGoster('bak-sol'); }
    else if (asama === 2) { otoBak(videolar[1].x, videolar[1].z); elGoster('bak-sag'); }
    else if (asama === 3) { otoBak(KAPI2_X, KAPI2_Z); elGoster('yuru'); }
    else elGoster(null);
  }
  // yazı bir süre kalır, izlerken ekranda hiçbir şey yazmaz
  let gizle = false;
  if (asama === 0 && asamaT > 3) gizle = true;
  if ((asama === 1 || asama === 2) && simdi - yonZaman > 6000) gizle = true;
  if (asama === 3 && soruGorunur) gizle = true;
  if (asama === 4 && simdi - yonZaman > 5000) gizle = true;
  yonKutu.classList.toggle('acik', !gizle);
  if (gizle && (asama === 1 || asama === 2)) elGoster(null);
  if (asama === 3 && elSu === 'yuru' && simdi - yonZaman > 7000) elGoster(null);
  if (asama === 4 && elSu) elGoster(null);
  if (elSu === 'bak' && sonBakZaman >= yonZaman) elGoster(null);
  // yazı uzun süre ekranda kalıp bakma olmadıysa küçük el hatırlatması
  if (!gizle && ogr >= OGR_BITTI && simdi - yonZaman > 12000 && sonBakZaman < yonZaman) elGoster('bak');
}

// ---------- Kapıdan her tabloya giden, zeminde silik yanıp sönen oklar ----------
const zeminOklar = [];
function zeminYolu(bx, bz, sx, sz, adet) {
  const dx = sx - bx, dz = sz - bz, uz = Math.hypot(dx, dz);
  const phi = Math.atan2(-dz / uz, dx / uz);
  for (let k = 0; k < adet; k++) {
    const t = adet === 1 ? 0 : k / (adet - 1);
    const mat = new THREE.MeshBasicMaterial({ color: 0xe8b25f, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
    const ok = new THREE.Mesh(okGeo, mat);
    ok.rotation.x = -Math.PI / 2;
    ok.scale.set(0.55, 0.55, 1);
    const grup = new THREE.Group();
    grup.add(ok);
    grup.position.set(bx + dx * t, 0.045, bz + dz * t);
    grup.rotation.y = phi;
    sahne.add(grup);
    zeminOklar.push({ mat, k });
  }
}

// ---------- Koridorda yürüme sesi (yumuşak ahşap adım) ----------
let adimBirik = 0, adimTek = false, adimSon = -1;
const adimTamponlar = [];
function adimlariYukle() {
  if (!sesBagl || adimTamponlar.length) return;
  for (let i = 1; i <= 6; i++) {
    fetch('ses/adim' + i + '.mp3').then(r => r.arrayBuffer())
      .then(ab => new Promise((ok, hata) => sesBagl.decodeAudioData(ab, ok, hata)))
      .then(buf => adimTamponlar.push(buf)).catch(() => {});
  }
}
function adimSentez() {   // dosya yüklenemezse yedek
  try {
    const c = sesBagl, t = c.currentTime;
    adimTek = !adimTek;
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(adimTek ? 118 : 100, t); o.frequency.exponentialRampToValueAtTime(52, t + 0.1);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.11, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + 0.15);
  } catch (e) {}
}
function adimSesi() {
  try {
    if (!sesBagl) return;
    if (!adimTamponlar.length) { adimSentez(); return; }
    let k;
    do { k = Math.floor(Math.random() * adimTamponlar.length); } while (k === adimSon && adimTamponlar.length > 1);
    adimSon = k;
    const c = sesBagl, kay = c.createBufferSource(), g = c.createGain();
    kay.buffer = adimTamponlar[k];
    kay.playbackRate.value = 0.94 + Math.random() * 0.12;
    g.gain.value = 0.55 + Math.random() * 0.15;
    kay.connect(g); g.connect(c.destination); kay.start();
  } catch (e) {}
}

// ---------- Kapı gıcırtısı (sentezlenmiş, dosyasız) ----------
function gicirti(d) {
  // yumuşak ahşap kapı sesi: alçak bir "tok", hafif hava ve çok kısık küçük bir gıcırtı
  try {
    if (!sesBagl) return;
    d = d || 1.3;
    const c = sesBagl, t = c.currentTime;
    // 1) alçak, yumuşak vuruş
    const o1 = c.createOscillator(), g1 = c.createGain();
    o1.type = 'sine'; o1.frequency.setValueAtTime(95, t); o1.frequency.exponentialRampToValueAtTime(55, t + 0.3);
    g1.gain.setValueAtTime(0.0001, t); g1.gain.exponentialRampToValueAtTime(0.22, t + 0.02); g1.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    o1.connect(g1); g1.connect(c.destination); o1.start(t); o1.stop(t + 0.45);
    // 2) hafif hava / sürtünme
    const uz = Math.floor(c.sampleRate * d), buf = c.createBuffer(1, uz, c.sampleRate), veri = buf.getChannelData(0);
    for (let i = 0; i < uz; i++) veri[i] = Math.random() * 2 - 1;
    const kay = c.createBufferSource(); kay.buffer = buf;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420;
    const g2 = c.createGain();
    g2.gain.setValueAtTime(0.0001, t); g2.gain.linearRampToValueAtTime(0.07, t + d * 0.35); g2.gain.linearRampToValueAtTime(0.0001, t + d);
    kay.connect(lp); lp.connect(g2); g2.connect(c.destination); kay.start(t);
    // 3) çok kısık, kısa, yumuşak gıcırtı
    const o3 = c.createOscillator(), g3 = c.createGain();
    o3.type = 'sine'; o3.frequency.setValueAtTime(520, t + d * 0.2); o3.frequency.linearRampToValueAtTime(680, t + d * 0.55);
    g3.gain.setValueAtTime(0.0001, t + d * 0.2); g3.gain.linearRampToValueAtTime(0.025, t + d * 0.35); g3.gain.linearRampToValueAtTime(0.0001, t + d * 0.6);
    o3.connect(g3); g3.connect(c.destination); o3.start(t + d * 0.2); o3.stop(t + d * 0.65);
  } catch (e) {}
}

// ---------- Kapı kapanma sesi (küçük, yumuşak bir "tok") ----------
let sesBagl = null;
function kapiSesi() {
  try {
    if (!sesBagl) return;
    const t = sesBagl.currentTime;
    const osc = sesBagl.createOscillator(), g = sesBagl.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(110, t); osc.frequency.exponentialRampToValueAtTime(42, t + 0.35);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    osc.connect(g); g.connect(sesBagl.destination);
    osc.start(t); osc.stop(t + 0.55);
  } catch (e) {}
}

let sonrakiKapiIsik = null;
// ---------- Sonraki odaya kapı (sağ duvar, odaya girince hemen sağda) ----------
(function sonrakiKapi() {
  const GEN = 1.3, YUK = 2.35;
  const g = new THREE.Group();
  g.position.set(ODA_X, 0, KAPI2_Z);
  g.rotation.y = -Math.PI / 2; // yüzü odaya (−x) bakar
  const kasaMat = new THREE.MeshPhongMaterial({ color: 0xb08a4f, specular: 0xfff0c0, shininess: 40, emissive: 0x2a1c06 });
  [-1, 1].forEach(y => {
    const k = new THREE.Mesh(new THREE.BoxGeometry(0.08, YUK + 0.1, 0.1), kasaMat);
    k.position.set(y * (GEN / 2 + 0.05), YUK / 2, 0.05); g.add(k);
  });
  const ust = new THREE.Mesh(new THREE.BoxGeometry(GEN + 0.18, 0.1, 0.1), kasaMat);
  ust.position.set(0, YUK + 0.05, 0.05); g.add(ust);
  // kapı açılınca görünen sıcak ışık
  const gc = document.createElement('canvas'); gc.width = 64; gc.height = 128;
  const gx = gc.getContext('2d');
  const gr = gx.createRadialGradient(32, 84, 4, 32, 84, 90);
  gr.addColorStop(0, 'rgba(255,236,190,1)'); gr.addColorStop(0.5, 'rgba(255,190,110,.9)'); gr.addColorStop(1, 'rgba(255,150,70,.6)');
  gx.fillStyle = gr; gx.fillRect(0, 0, 64, 128);
  const isikAlan = new THREE.Mesh(new THREE.PlaneGeometry(GEN, YUK),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(gc), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  isikAlan.position.set(0, YUK / 2, 0.03);
  g.add(isikAlan);
  kapi2.glow = isikAlan;
  // menteşeli kanat (sol menteşe)
  const hinge = new THREE.Group();
  hinge.position.set(-GEN / 2, 0, 0.06);
  const c = document.createElement('canvas'); c.width = 512; c.height = 1024;
  const x = c.getContext('2d');
  const doku = new THREE.CanvasTexture(c);
  function ciz() {
    x.fillStyle = '#3a2314'; x.fillRect(0, 0, 512, 1024);
    x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 6;
    x.strokeRect(40, 60, 432, 380); x.strokeRect(40, 520, 432, 440);
    const altin = x.createLinearGradient(0, 0, 512, 1024);
    altin.addColorStop(0, '#fff3cf'); altin.addColorStop(0.5, '#d9a94f'); altin.addColorStop(1, '#f7e2a6');
    x.fillStyle = altin; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.shadowColor = 'rgba(0,0,0,.6)'; x.shadowBlur = 10;
    x.font = '120px "Great Vibes", "Snell Roundhand", "Brush Script MT", cursive';
    x.fillText('Devamı', 256, 200);
    x.fillText('var...', 256, 330);
    x.fillStyle = '#e0556f'; x.font = '70px Georgia, serif'; x.fillText('♥', 256, 700);
    doku.needsUpdate = true;
  }
  ciz();
  if (document.fonts && document.fonts.load) document.fonts.load('100px "Great Vibes"', 'Devamı var').then(ciz).catch(() => {});
  const kanat = new THREE.Mesh(new THREE.PlaneGeometry(GEN, YUK), new THREE.MeshBasicMaterial({ map: doku, color: 0x8a8a8a, fog: false, side: THREE.DoubleSide }));
  kanat.position.set(GEN / 2, YUK / 2, 0);
  hinge.add(kanat);
  g.add(hinge);
  kapi2.hinge = hinge;
  // kapının altından sızan sıcak ışık
  const isikSerit = new THREE.Mesh(new THREE.PlaneGeometry(GEN, 0.35),
    new THREE.MeshBasicMaterial({ color: 0xffb35a, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  isikSerit.rotation.x = -Math.PI / 2; isikSerit.position.set(0, 0.02, 0.25);
  g.add(isikSerit);
  sonrakiKapiIsik = isikSerit;
  sahne.add(g);
})();

// ---------- Müzik ----------
let muzik = null, muzikHedef = 0, muzikVar = true;
let muzik2 = null, muzik2Hedef = 0, muzik3 = null, muzik3Hedef = 0, muzik4 = null, muzik4Hedef = 0, muzik5 = null, muzik5Hedef = 0;
function muzikKur() {
  muzik = new Audio(ODA1.sarki);
  muzik.loop = true;
  muzik.volume = 0;
  muzik.addEventListener('error', () => { muzikVar = false; });
  const p = muzik.play();
  if (p && p.catch) p.catch(() => {});
  muzik2 = new Audio('muzik/iki-cocuk.mp3');
  muzik2.loop = true; muzik2.volume = 0;
  const p2 = muzik2.play();
  if (p2 && p2.catch) p2.catch(() => {});
  muzik3 = new Audio('muzik/serseri.mp3');
  muzik3.loop = true; muzik3.volume = 0;
  const p3 = muzik3.play();
  if (p3 && p3.catch) p3.catch(() => {});
  muzik4 = new Audio('muzik/coban-yildizi.mp3');
  muzik4.loop = true; muzik4.volume = 0;
  const p4 = muzik4.play();
  if (p4 && p4.catch) p4.catch(() => {});
  muzik5 = new Audio('muzik/iki-yabanci.mp3');
  muzik5.loop = true; muzik5.volume = 0;
  const p5 = muzik5.play();
  if (p5 && p5.catch) p5.catch(() => {});
}

// ---------- Karakter: ışıklı İ ve M, aralarında ışık teli ----------
const matAltin = new THREE.MeshPhongMaterial({ color: 0xf0c15a, specular: 0xfff6d6, shininess: 90, emissive: 0x7a5412 });
function harfGeo(sekil, ortaX) {
  const g = new THREE.ExtrudeGeometry(sekil, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2 });
  g.translate(-ortaX, 0, -0.035);
  return g;
}
function yuvarlakDikdortgen(w, h, r) {
  const sh = new THREE.Shape();
  sh.moveTo(r, 0); sh.lineTo(w - r, 0); sh.absarc(w - r, r, r, -Math.PI / 2, 0, false);
  sh.lineTo(w, h - r); sh.absarc(w - r, h - r, r, 0, Math.PI / 2, false);
  sh.lineTo(r, h); sh.absarc(r, h - r, r, Math.PI / 2, Math.PI, false);
  sh.lineTo(0, r); sh.absarc(r, r, r, Math.PI, Math.PI * 1.5, false);
  return sh;
}
function parilti(boy, opaklik) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,214,140,1)'); g.addColorStop(0.35, 'rgba(255,190,100,.45)'); g.addColorStop(1, 'rgba(255,170,80,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, opacity: opaklik, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  sp.scale.set(boy, boy, 1);
  return sp;
}

const ikili = new THREE.Group();   // hareket eden ana grup
const govde = new THREE.Group();   // havada süzülen, sallanan kısım
ikili.add(govde);
const halolar = [];
const patenler = [], harfPaten = [], yerPaten = [];
let patenGiyildi = false, patenTakili = false, patenUcus = null;
let ikiliKalp = null;
(function karakterYap() {
  // İ: ince bir çubuk ve üstünde nokta
  const harfI = new THREE.Group();
  harfI.add(new THREE.Mesh(harfGeo(yuvarlakDikdortgen(0.1, 0.5, 0.045), 0.05), matAltin));
  const nokta = new THREE.Mesh(new THREE.SphereGeometry(0.058, 16, 12), matAltin);
  nokta.position.set(0, 0.62, 0); harfI.add(nokta);
  harfI.position.set(-0.36, 0, 0);
  govde.add(harfI);
  // M: sade ve kalın çizgili
  const sM = new THREE.Shape();
  [[0, 0], [0, 0.5], [0.1, 0.5], [0.25, 0.25], [0.4, 0.5], [0.5, 0.5], [0.5, 0], [0.4, 0], [0.4, 0.3], [0.25, 0.05], [0.1, 0.3], [0.1, 0]]
    .forEach((p, k) => k ? sM.lineTo(p[0], p[1]) : sM.moveTo(p[0], p[1]));
  const harfM = new THREE.Mesh(harfGeo(sM, 0.25), matAltin);
  harfM.position.set(0.36, 0, 0);
  govde.add(harfM);
  // aralarında parlayan ışık teli ve kalp
  const tel = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.37, 8), new THREE.MeshBasicMaterial({ color: 0xffe3a3 }));
  tel.rotation.z = Math.PI / 2; tel.position.set(0, 0.32, 0); govde.add(tel);
  ikiliKalp = new THREE.Mesh(kalpGeo, new THREE.MeshBasicMaterial({ color: 0xff5a7a }));
  ikiliKalp.scale.set(0.11, 0.11, 1); ikiliKalp.position.set(0, 0.33, -0.02); ikiliKalp.rotation.y = Math.PI;
  govde.add(ikiliKalp);
  // harelerle parlama
  [[-0.36, 0.3, 0.95], [0.36, 0.28, 1.15], [0, 0.33, 0.55]].forEach(h => {
    const p = parilti(h[2] * 0.7, 0.12); p.position.set(h[0], h[1], 0); govde.add(p); halolar.push(p);
  });
  // buz patenleri: İ'nin altında 1, M'nin iki bacağında 2
  const matBot = new THREE.MeshPhongMaterial({ color: 0xf1ece0, specular: 0xffffff, shininess: 40, emissive: 0x2b2820 });
  const matBicak = new THREE.MeshPhongMaterial({ color: 0xcfe3f5, specular: 0xffffff, shininess: 130, emissive: 0x1d3550 });
  const botSekil = new THREE.Shape();
  botSekil.moveTo(-0.12, 0); botSekil.lineTo(0.12, 0);
  botSekil.quadraticCurveTo(0.17, 0, 0.17, 0.05); botSekil.quadraticCurveTo(0.17, 0.09, 0.11, 0.11);
  botSekil.lineTo(0.03, 0.12); botSekil.quadraticCurveTo(0.0, 0.16, 0.01, 0.2);
  botSekil.lineTo(-0.07, 0.2); botSekil.lineTo(-0.1, 0.07); botSekil.quadraticCurveTo(-0.12, 0.03, -0.12, 0);
  const botGeo = new THREE.ExtrudeGeometry(botSekil, { depth: 0.14, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2 });
  botGeo.translate(0, 0, -0.07);
  const bicakSekil = new THREE.Shape();
  bicakSekil.moveTo(-0.12, -0.05); bicakSekil.lineTo(0.11, -0.05);
  bicakSekil.quadraticCurveTo(0.19, -0.05, 0.19, 0.01); bicakSekil.lineTo(-0.12, 0.01);
  const bicakGeo = new THREE.ExtrudeGeometry(bicakSekil, { depth: 0.012, bevelEnabled: false });
  bicakGeo.translate(0, 0, -0.006);
  const PATEN_RENK = [0xff5c9e, 0x2fd0d6, 0xa07bff];   // pembe, turkuaz, mor
  const matBeyaz = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0xffffff, shininess: 30, emissive: 0x303030 });
  function patenMesh(renk) {
    const g = new THREE.Group();
    const bm = new THREE.MeshPhongMaterial({ color: renk, specular: 0xffffff, shininess: 80, emissive: new THREE.Color(renk).multiplyScalar(0.3) });
    g.add(new THREE.Mesh(botGeo, bm), new THREE.Mesh(bicakGeo, matBicak));
    const man = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.072, 0.035, 14), matBeyaz);   // beyaz manşet
    man.position.set(-0.035, 0.2, 0); g.add(man);
    [0.12, 0.148, 0.176].forEach(y => {                                                          // bağcıklar
      const bg = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.011, 0.125), matBeyaz);
      bg.position.set(0.034 - (y - 0.12) * 0.25, y, 0); bg.rotation.z = -0.15; g.add(bg);
    });
    g.scale.setScalar(0.65);
    const dis = new THREE.Group();
    dis.add(g);
    dis.rotation.y = Math.PI / 2;   // burun ileriye (−z) baksın
    return dis;
  }
  function patenYap(x, faz, renk) {   // harfin ayağındaki yuva (giyilince görünür)
    const dis = patenMesh(renk);
    dis.position.set(x, -0.09, 0);
    dis.visible = false;
    govde.add(dis);
    patenler.push({ g: dis, faz });
    harfPaten.push(dis);
  }
  patenYap(-0.36, 0, PATEN_RENK[0]);
  patenYap(0.16, Math.PI, PATEN_RENK[1]);
  patenYap(0.56, 0, PATEN_RENK[2]);
  // odanın girişinde yerde bekleyen, daha büyük ve renkli patenler
  [[-0.6, -18.5], [0.0, -18.95], [0.6, -18.5]].forEach((p, i) => {
    const dis = patenMesh(PATEN_RENK[i]);
    dis.position.set(p[0], 0.06, p[1]);
    dis.rotation.y = Math.PI / 2 + (i - 1) * 0.35;
    dis.scale.setScalar(1.6);
    sahne.add(dis);
    const rgb = new THREE.Color(PATEN_RENK[i]);
    const doku = radyalDoku(Math.round(rgb.r * 255), Math.round(rgb.g * 255), Math.round(rgb.b * 255));
    const halka = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5),
      new THREE.MeshBasicMaterial({ map: doku, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    halka.rotation.x = -Math.PI / 2; halka.position.set(p[0], 0.03, p[1]);
    sahne.add(halka);
    const isik = new THREE.Sprite(new THREE.SpriteMaterial({ map: doku, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    isik.scale.set(1.5, 1.5, 1); isik.position.set(p[0], 0.4, p[1]);
    sahne.add(isik);
    yerPaten.push({ g: dis, halka, isik, bx: p[0], bz: p[1], by: 0.06, r0: dis.rotation.y });
  });
  govde.position.y = 0.19;
  ikili.scale.setScalar(0.8);
  // yerdeki yumuşak gölge
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  const golge = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.7),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
  golge.rotation.x = -Math.PI / 2; golge.position.y = 0.012;
  ikili.add(golge);
  sahne.add(ikili);
})();
let ikiliYon = 0, yurume = 0, yurumeFaz = 0, egim = 0;

// arkalarında kalan ışık zerrecikleri
const ZER = 90;
const zerKonum = new Float32Array(ZER * 3), zerRenk = new Float32Array(ZER * 3);
const zerOmur = new Float32Array(ZER).fill(0), zerYas = new Float32Array(ZER).fill(9);
let zerSira = 0, zerBirik = 0;
const zerGeo = new THREE.BufferGeometry();
zerGeo.setAttribute('position', new THREE.BufferAttribute(zerKonum, 3));
zerGeo.setAttribute('color', new THREE.BufferAttribute(zerRenk, 3));
const kalpDoku = (function () {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d');
  x.translate(32, 34); x.scale(46, -46);
  x.shadowColor = 'rgba(255,255,255,.9)'; x.shadowBlur = 0.12 * 46 / 46 * 10;
  x.beginPath();
  x.moveTo(0, -0.5);
  x.bezierCurveTo(-0.15, -0.35, -0.6, -0.05, -0.6, 0.22);
  x.bezierCurveTo(-0.6, 0.5, -0.2, 0.62, 0, 0.3);
  x.bezierCurveTo(0.2, 0.62, 0.6, 0.5, 0.6, 0.22);
  x.bezierCurveTo(0.6, -0.05, 0.15, -0.35, 0, -0.5);
  x.closePath();
  x.fillStyle = '#ffffff'; x.fill();
  return new THREE.CanvasTexture(c);
})();
const zerPuan = new THREE.Points(zerGeo, new THREE.PointsMaterial({
  map: kalpDoku, size: 0.2, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true, fog: false }));
zerPuan.frustumCulled = false;
sahne.add(zerPuan);
function zerreGuncelle(dt, x, z, yon, hareketli) {
  zerBirik += dt * (hareketli ? 40 : 6);
  while (zerBirik >= 1) {
    zerBirik -= 1;
    const k = zerSira = (zerSira + 1) % ZER;
    const arka = hareketli ? 0.25 : 0;
    zerKonum[k * 3] = x + Math.sin(yon) * arka + (Math.random() - 0.5) * 0.7;
    zerKonum[k * 3 + 1] = 0.15 + Math.random() * 0.8;
    zerKonum[k * 3 + 2] = z + Math.cos(yon) * arka + (Math.random() - 0.5) * 0.25;
    zerYas[k] = 0; zerOmur[k] = 1.1 + Math.random() * 0.9;
  }
  for (let k = 0; k < ZER; k++) {
    zerYas[k] += dt;
    const t = zerYas[k] / (zerOmur[k] || 1);
    const par = t >= 1 ? 0 : (1 - t) * 0.5;
    zerKonum[k * 3 + 1] += dt * 0.28;
    zerRenk[k * 3] = 1 * par; zerRenk[k * 3 + 1] = 0.4 * par; zerRenk[k * 3 + 2] = 0.55 * par;
  }
  zerGeo.attributes.position.needsUpdate = true;
  zerGeo.attributes.color.needsUpdate = true;
}

// ---------- Öğretici: el simgesi, yürüme ve bakma ----------
const elKutu = document.getElementById('el'), ogrKutu = document.getElementById('ogretici');
const DOKUNMATIK = !!(window.matchMedia && window.matchMedia('(pointer:coarse)').matches);
let elSu = null;
function elGoster(tur) { elSu = tur; elKutu.className = (tur && DOKUNMATIK) ? 'el ' + tur : 'el'; }
// ---------- Kendi sesinle yönergeler (giriş alıştırması) ----------
const SES_YOL = { giris: 'ses/konus-giris.mp3', ileri: 'ses/konus-ileri.mp3', geri: 'ses/konus-geri.mp3', sag: 'ses/konus-sag.mp3', sol: 'ses/konus-sol.mp3', yukari: 'ses/konus-yukari.mp3', asagi: 'ses/konus-asagi.mp3', kapi: 'ses/konus-kapi.mp3', hazir: 'ses/konus-hazir.mp3' };
const sesEl = new Audio(); sesEl.preload = 'auto';
let sesKuyruk = [], sesCaliyor = false, hazirSesCalindi = false;
function sesSiradaki() {
  if (sesCaliyor || !sesKuyruk.length) return;
  const k = sesKuyruk.shift(); sesCaliyor = true;
  const bit = () => { if (!sesCaliyor) return; sesCaliyor = false; sesEl.onended = null; sesEl.onerror = null; if (k.cb) k.cb(); sesSiradaki(); };
  sesEl.onended = bit; sesEl.onerror = bit; sesEl.src = SES_YOL[k.ad]; sesEl.volume = 1;
  try { const p = sesEl.play(); if (p && p.catch) p.catch(bit); } catch (e) { bit(); }
}
function sesCal(ad, cb) { sesKuyruk.push({ ad, cb }); sesSiradaki(); }   // sırayla çalar, üst üste binmez
const OGR_ADIM = [
  { ad: 'İleri', ses: 'ileri', el: 'ileri', yaz: 'Düğmeyi yukarı kaydır, ileri yürü.', yazD: 'W tuşuyla ileri yürü.', ol: () => ogrIleriGirdi() > 0.5 },
  { ad: 'Geri', ses: 'geri', el: 'geri', yaz: 'Şimdi düğmeyi aşağı kaydır, geri yürü.', yazD: 'S tuşuyla geri yürü.', ol: () => ogrIleriGirdi() < -0.5 },
  { ad: 'Sağa', ses: 'sag', el: 'bak-sag', yaz: 'Düğmeye dokunmadan ekranı sağa sürükle, sağa bak.', yazD: 'Fareyi basılı tutup sağa sürükle.', ol: () => kon.dragX - ogrDX0 >= 150 },
  { ad: 'Sola', ses: 'sol', el: 'bak-sol', yaz: 'Şimdi ekranı sola sürükle, sola bak.', yazD: 'Fareyi sola sürükle.', ol: () => kon.dragX - ogrDX0 <= -150 },
  { ad: 'Yukarı', ses: 'yukari', el: 'bak-yukari', yaz: 'Ekranı yukarı sürükle, tavana bak.', yazD: 'Fareyi yukarı sürükle.', ol: () => kon.dragY - ogrDY0 <= -90 },
  { ad: 'Aşağı', ses: 'asagi', el: 'bak-asagi', yaz: 'Ekranı aşağı sürükle, yere bak.', yazD: 'Fareyi aşağı sürükle.', ol: () => kon.dragY - ogrDY0 >= 90 }
];
const OGR_BITTI = OGR_ADIM.length, OGR_BEKLEME = 20000;
let ogr = -1, ogrBaslaZ = 0, ogrAdimZ = 0, ogrS = 0, ogrBekle = 0, ogrDX0 = 0, ogrDY0 = 0, ogrBittiZ = 0;
const ogrListe = document.getElementById('ogrListe');
const ogrChipler = OGR_ADIM.map(a => { const c = document.createElement('span'); c.textContent = a.ad; ogrListe.appendChild(c); return c; });
function ogrIleriGirdi() {
  const t = kon.tus;
  return kon.joyY + ((t['w'] || t['arrowup']) ? 1 : 0) - ((t['s'] || t['arrowdown']) ? 1 : 0);
}
function ogrYaz(t, el) { ogrKutu.textContent = t; ogrKutu.classList.add('acik'); elGoster(el); }
function ogrAdimGoster() {
  const a = OGR_ADIM[ogr];
  ogrYaz(DOKUNMATIK ? a.yaz : a.yazD, a.el);
  ogrKutu.classList.remove('buyuk');
  ogrAdimZ = performance.now(); ogrS = 0;
  ogrDX0 = kon.dragX; ogrDY0 = kon.dragY;
  if (a.ses) sesCal(a.ses);
}
const ALISTIRMA = true;   // true: koridordaki 6 adımlı alıştırma açık
function ogrBasla() {
  if (!ALISTIRMA) { ogr = OGR_BITTI; ogrBaslaZ = 0; return; }   // askıda: alıştırma atlanır, kapı hemen açılır
  ogr = 0; ogrBaslaZ = performance.now();
  ogrListe.classList.add('acik');
  ogrBekle = 1e15; ogrYaz('Hoş geldin, Gülüm.', null);   // karşılama konuşması bitince ilk adım başlar
  sesCal('giris', () => { ogrBekle = performance.now() + 500; });
}
function kapiHazir() { return ogr >= OGR_BITTI && performance.now() - ogrBaslaZ >= OGR_BEKLEME; }
function ogrGuncelle(dt) {
  const simdi = performance.now();
  if (ogr < 0 || ogr >= OGR_BITTI) {
    if (ogr >= OGR_BITTI && ogrBittiZ && simdi - ogrBittiZ > 5000) { ogrKutu.classList.remove('acik'); ogrListe.classList.remove('acik'); ogrBittiZ = 0; }
    return;
  }
  if (ogrBekle) { if (simdi < ogrBekle) return; ogrBekle = 0; if (ogr < OGR_BITTI) ogrAdimGoster(); return; }
  const a = OGR_ADIM[ogr];
  if (a.el === 'ileri' || a.el === 'geri') { if (a.ol()) ogrS += dt; else ogrS = Math.max(0, ogrS - dt * 0.5); }
  const bitti = (a.el === 'ileri' || a.el === 'geri') ? ogrS >= 1.0 : a.ol();
  if (bitti) {
    ogrChipler[ogr].classList.add('tamam');
    ogr++;
    if (ogr >= OGR_BITTI) {
      ogrYaz('Hazırsın! Kapıya doğru ilerle.', null);
      ogrBittiZ = simdi; sesCal('kapi');
    } else {
      ogrYaz('✓ Güzel!', null);
      ogrBekle = simdi + 900;
    }
    return;
  }
  if (simdi - ogrAdimZ > 30000) ogrKutu.classList.add('buyuk');
}
// kamera kendiliğinden bir noktaya yumuşakça dönsün (kullanıcı dokunursa vazgeçer)
function otoBak(hx, hz) {
  const dx = hx - kon.x, dz = hz - kon.z;
  kon.oto = { yaw: Math.atan2(-dx, -dz), pitch: -0.1 };
}

// ---------- Patenleri giyme ----------
function patenSesi() {
  try {
    if (!sesBagl) return;
    const c = sesBagl, t0 = c.currentTime;
    [0, 0.13, 0.26].forEach((dt, i) => {
      const t = t0 + dt;
      [1800 + i * 300, 2700 + i * 400].forEach(f => {
        const o = c.createOscillator(), g = c.createGain();
        o.type = 'triangle'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.1, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
        o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + 0.18);
      });
    });
  } catch (e) {}
}
const gecici = new THREE.Vector3();
function patenGuncelle(simdi) {
  if (patenGiyildi) return;
  const cx = 0, cz = -18.7;
  yerPaten.forEach((p, i) => {
    if (!patenUcus) {
      p.g.position.y = p.by + 0.05 + Math.sin(simdi / 500 + i) * 0.04;
      p.g.rotation.y = p.r0 + Math.sin(simdi / 900 + i) * 0.22;
      p.halka.material.opacity = 0.4 + 0.25 * Math.sin(simdi / 450 + i);
      p.isik.material.opacity = 0.35 + 0.2 * Math.sin(simdi / 450 + i);
    }
  });
  if (!patenUcus && odadaMi && Math.hypot(kon.x - cx, kon.z - cz) < 1.0) {
    patenUcus = { t0: simdi };
    patenSesi();
  }
  if (!patenUcus) return;
  let bitenler = 0;
  yerPaten.forEach((p, i) => {
    const t = Math.max(0, Math.min(1, (simdi - patenUcus.t0 - i * 140) / 800));
    const e = t * t * (3 - 2 * t);
    harfPaten[i].getWorldPosition(gecici);
    p.g.position.set(p.bx + (gecici.x - p.bx) * e, p.by + (gecici.y - p.by) * e + Math.sin(Math.PI * e) * 0.5, p.bz + (gecici.z - p.bz) * e);
    const hedefR = ikiliYon + Math.PI / 2;
    const fark = Math.atan2(Math.sin(hedefR - p.r0), Math.cos(hedefR - p.r0));
    p.g.rotation.y = p.r0 + fark * e;
    p.g.scale.setScalar(1.6 - 0.8 * e);
    p.halka.material.opacity = 0.5 * (1 - e);
    p.isik.material.opacity = 0.5 * (1 - e);
    if (t >= 1) bitenler++;
  });
  if (bitenler === yerPaten.length) {
    yerPaten.forEach(p => { p.g.visible = false; p.halka.visible = false; p.isik.visible = false; });
    harfPaten.forEach(h => { h.visible = true; });
    patenGiyildi = true; patenTakili = true;
    ogrYaz('Patenlerini giydin! ⛸️', null);
    setTimeout(() => ogrKutu.classList.remove('acik'), 2400);
  }
}

// ---------- Patenleri çıkarma (ikinci odanın girişi) ----------
let cikisUcus = null, patenKartAcik = false;
const patenKart = document.getElementById('patenKart'), patenBtn = document.getElementById('patenCikarBtn');
const RAF_YER = [[HOL_SON + 0.3, 0.45, -17.05], [HOL_SON + 0.3, 0.45, -16.4], [HOL_SON + 0.3, 0.45, -15.75]];
patenBtn.addEventListener('click', () => {
  if (!patenTakili || cikisUcus) return;
  cikisUcus = { t0: performance.now(), bas: [], r0: ikiliYon + Math.PI / 2 };
  harfPaten.forEach((h, i) => {
    h.getWorldPosition(gecici);
    cikisUcus.bas.push(gecici.clone());
    h.visible = false;
    const g = yerPaten[i].g;
    g.visible = true; g.scale.setScalar(0.8); g.position.copy(gecici); g.rotation.y = cikisUcus.r0;
  });
  patenSesi();
});
function patenCikarGuncelle(simdi) {
  const gor = patenTakili && !cikisUcus && kapi2.acik && kon.x > ODA_X + 0.8;
  if (gor !== patenKartAcik) { patenKartAcik = gor; patenKart.classList.toggle('acik', gor); }
  if (!cikisUcus || cikisUcus.bitti) return;
  let biten = 0;
  yerPaten.forEach((p, i) => {
    const t = Math.max(0, Math.min(1, (simdi - cikisUcus.t0 - i * 140) / 800));
    const e = t * t * (3 - 2 * t);
    const b = cikisUcus.bas[i], h = RAF_YER[i];
    p.g.position.set(b.x + (h[0] - b.x) * e, b.y + (h[1] - b.y) * e + Math.sin(Math.PI * e) * 0.5, b.z + (h[2] - b.z) * e);
    const fark = Math.atan2(Math.sin(0 - cikisUcus.r0), Math.cos(0 - cikisUcus.r0));
    p.g.rotation.y = cikisUcus.r0 + fark * e;
    p.g.scale.setScalar(0.8 + 0.3 * e);
    if (t >= 1) biten++;
  });
  if (biten === yerPaten.length) {
    patenTakili = false;
    cikisUcus = { ...cikisUcus, bitti: true };
    ogrYaz('Patenlerini kenara koydun. İçeri girebilirsin.', null);
    setTimeout(() => ogrKutu.classList.remove('acik'), 2600);
  }
}

// ---------- İkinci odadaki renkli balonlar (çarpınca hareket eder) ----------
const BALON_R = 0.3;
const balonlar = [];
(function balonKur() {
  const renkler = [0xff5c9e, 0x2fd0d6, 0xa07bff, 0xffd23f, 0x5fd16a, 0xff8a3d, 0x4aa3ff, 0xff4d4d];
  const konumlar = [[10.2, -15.6], [10.6, -21.8], [11.8, -17.4], [11.4, -20.0], [12.8, -15.2], [13.0, -22.4],
    [13.6, -18.8], [14.2, -16.4], [14.6, -21.0], [15.4, -19.2], [15.8, -15.4], [12.2, -23.0], [10.0, -18.6], [14.4, -23.0]];
  konumlar.forEach((k, i) => {
    const renk = renkler[i % renkler.length];
    const g = new THREE.Group();
    const m = new THREE.Mesh(new THREE.SphereGeometry(BALON_R, 20, 14),
      new THREE.MeshPhongMaterial({ color: renk, specular: 0xffffff, shininess: 80, emissive: new THREE.Color(renk).multiplyScalar(0.28) }));
    m.scale.set(1, 1.12, 1); m.position.y = BALON_R * 1.12;
    g.add(m);
    const dugum = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.09, 8), m.material);
    dugum.rotation.x = Math.PI; dugum.position.y = 0.02;
    g.add(dugum);
    g.position.set(k[0], 0.0, k[1]);
    sahne.add(g);
    balonlar.push({ g, m, x: k[0], z: k[1], vx: 0, vz: 0, faz: Math.random() * 6, ezil: 0 });
  });
})();
function balonSesi(siddet) {
  try {
    if (!sesBagl) return;
    const c = sesBagl, t = c.currentTime;
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(260 + Math.random() * 60, t); o.frequency.exponentialRampToValueAtTime(150, t + 0.12);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.min(0.13, 0.04 + siddet * 0.05), t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + 0.18);
  } catch (e) {}
}
let balonSesZ = 0;
function balonGuncelle(dt, t) {
  const KX0 = HOL_SON + 0.8, KX1 = ODA2_X1 - 1.0, KZ0 = ODA2_Z0 + 0.5, KZ1 = ODA2_Z1 - 0.5;
  const kHiz = Math.hypot(kon.vx, kon.vz);
  balonlar.forEach((b, i) => {
    // sürtünme: yumuşakça yavaşlar
    const s = Math.exp(-dt * 0.9);
    b.vx *= s; b.vz *= s;
    b.x += b.vx * dt; b.z += b.vz * dt;
    // duvarlardan sek
    if (b.x < KX0) { b.x = KX0; b.vx = Math.abs(b.vx) * 0.7; }
    if (b.x > KX1) { b.x = KX1; b.vx = -Math.abs(b.vx) * 0.7; }
    if (b.z < KZ0) { b.z = KZ0; b.vz = Math.abs(b.vz) * 0.7; }
    if (b.z > KZ1) { b.z = KZ1; b.vz = -Math.abs(b.vz) * 0.7; }
    engelleriItele(b, BALON_R, true);
    // karaktere çarpma
    const dx = b.x - kon.x, dz = b.z - kon.z, d = Math.hypot(dx, dz), R = BALON_R + 0.5;
    if (d < R && d > 0.001) {
      const nx = dx / d, nz = dz / d;
      b.x = kon.x + nx * R; b.z = kon.z + nz * R;
      const hiz = Math.max(1.4, kHiz * 1.35);
      b.vx = nx * hiz + kon.vx * 0.5; b.vz = nz * hiz + kon.vz * 0.5;
      b.ezil = 1;
      if (t - balonSesZ > 0.12) { balonSesZ = t; balonSesi(hiz); }
    }
    // balonlar birbirine çarpar
    for (let j = i + 1; j < balonlar.length; j++) {
      const o = balonlar[j], ex = o.x - b.x, ez = o.z - b.z, e = Math.hypot(ex, ez), mn = BALON_R * 2;
      if (e < mn && e > 0.001) {
        const nx = ex / e, nz = ez / e, ic = (mn - e) / 2;
        b.x -= nx * ic; b.z -= nz * ic; o.x += nx * ic; o.z += nz * ic;
        const rel = (o.vx - b.vx) * nx + (o.vz - b.vz) * nz;
        if (rel < 0) { b.vx += nx * rel; b.vz += nz * rel; o.vx -= nx * rel; o.vz -= nz * rel; o.ezil = 0.6; b.ezil = 0.6; }
      }
    }
    b.ezil = Math.max(0, b.ezil - dt * 4);
    const sal = Math.sin(t * 1.3 + b.faz) * 0.02;
    b.g.position.set(b.x, 0.02 + sal + Math.min(0.06, Math.hypot(b.vx, b.vz) * 0.03), b.z);
    const e = 1 + b.ezil * 0.12;
    b.m.scale.set(e, 1.12 - b.ezil * 0.1, e);
  });
}

// ---------- Üçüncü oda: motor garajı (gül kapısının arkası) ----------
const HOL3_Z1 = -11.3;
const R3 = { x0: 4.0, x1: 16.0, z0: -11.3, z1: -0.5, y: 3.4 };
const R3cx = (R3.x0 + R3.x1) / 2, R3cz = (R3.z0 + R3.z1) / 2;
const ENGELLER3 = [{ x: R3cx, z: -5.5, r: 1.35 }, { x: R3cx - 3.8, z: -5.8, r: 1.15 }, { x: R3cx + 3.8, z: -5.8, r: 1.2 }];
const motor = { grup: null, aci: 0, platlar: [], ana: null };
(function motorOdasi() {
  const duvar3 = new THREE.MeshPhongMaterial({ color: 0x34363b, specular: 0x000000, shininess: 4 });
  const zemin3 = new THREE.MeshPhongMaterial({ color: 0x4b4d53, specular: 0x000000, shininess: 4 });
  const tavan3 = new THREE.MeshPhongMaterial({ color: 0x232428, specular: 0x000000, shininess: 4 });
  const ay = (w, h, d, mat, px, py, pz) => kutu(w, h, d, mat, px, py, pz);
  // hol (gül kapısından odaya)
  ay(1.6, 0.1, HOL3_Z1 - ODA2_Z1, zemin3, K3.x, -0.05, (ODA2_Z1 + HOL3_Z1) / 2);
  ay(1.6, 0.1, HOL3_Z1 - ODA2_Z1, tavan3, K3.x, 3.05, (ODA2_Z1 + HOL3_Z1) / 2);
  [-1, 1].forEach(y => ay(0.1, 3.1, HOL3_Z1 - ODA2_Z1, duvar3, K3.x + y * 0.85, 1.5, (ODA2_Z1 + HOL3_Z1) / 2));
  // oda
  const w = R3.x1 - R3.x0, d = R3.z1 - R3.z0;
  ay(w, 0.1, d, zemin3, R3cx, -0.05, R3cz);
  ay(w, 0.1, d, tavan3, R3cx, R3.y + 0.05, R3cz);
  ay(w, R3.y, 0.1, duvar3, R3cx, R3.y / 2, R3.z1 + 0.05);                 // kuzey (arka)
  ay(0.1, R3.y, d, duvar3, R3.x0 - 0.05, R3.y / 2, R3cz);                  // batı
  ay(0.1, R3.y, d, duvar3, R3.x1 + 0.05, R3.y / 2, R3cz);                  // doğu
  // güney duvarı (holün açıldığı yer boş)
  const sa = (K3.x - 0.8) - R3.x0, sb = R3.x1 - (K3.x + 0.8);
  ay(sa, R3.y, 0.1, duvar3, R3.x0 + sa / 2, R3.y / 2, R3.z0 - 0.05);
  ay(sb, R3.y, 0.1, duvar3, K3.x + 0.8 + sb / 2, R3.y / 2, R3.z0 - 0.05);
  // duvar boyunca kırmızı şerit
  const serit = new THREE.MeshBasicMaterial({ color: 0xd1162b });
  ay(0.02, 0.06, d, serit, R3.x0 + 0.01, 0.9, R3cz); ay(0.02, 0.06, d, serit, R3.x1 - 0.01, 0.9, R3cz);
  ay(w, 0.06, 0.02, serit, R3cx, 0.9, R3.z1 - 0.01);
  // tavanda aydınlatma şeritleri
  const neonB = new THREE.MeshBasicMaterial({ color: 0xdfe9ff });
  [-3, 0, 3].forEach(dx => ay(0.12, 0.03, d - 3, neonB, R3cx + dx * 1.6, R3.y - 0.02, R3cz));
  // zeminde sarı kesik yol çizgisi (holden motora)
  const sari = new THREE.MeshBasicMaterial({ color: 0xe8c33a });
  for (let i = 0; i < 4; i++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.7), sari); p.rotation.x = -Math.PI / 2; p.position.set(K3.x, 0.012, HOL3_Z1 + 0.5 + i * 1.0); sahne.add(p); }
  // ışıklar
  const anaIsik = new THREE.PointLight(0xffe7cf, 1.1, 15, 1.5); anaIsik.position.set(R3cx, 3.0, R3cz); sahne.add(anaIsik);
  const kirmiziIsik = new THREE.PointLight(0xff2a4a, 0.8, 9, 1.8); kirmiziIsik.position.set(R3cx, 2.5, R3.z1 - 1.0); sahne.add(kirmiziIsik);

  // neon yazı
  const nc = document.createElement('canvas'); nc.width = 1024; nc.height = 192;
  const nx = nc.getContext('2d'); const nd = new THREE.CanvasTexture(nc);
  function neonCiz() {
    nx.clearRect(0, 0, 1024, 192);
    nx.textAlign = 'center'; nx.textBaseline = 'middle';
    nx.font = 'bold 110px "Arial Black", Impact, Arial, sans-serif';
    nx.shadowColor = '#ff2a4a'; nx.shadowBlur = 40; nx.fillStyle = '#ff9aa9'; nx.fillText('YOLA ÇIKALIM', 512, 100);
    nx.shadowBlur = 14; nx.fillStyle = '#fff0f2'; nx.fillText('YOLA ÇIKALIM', 512, 100);
    nd.needsUpdate = true;
  }
  neonCiz();
  const neon = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 4.4 * 192 / 1024), new THREE.MeshBasicMaterial({ map: nd, transparent: true, depthWrite: false, fog: false }));
  neon.position.set(R3cx, 2.45, R3.z1 - 0.04); neon.rotation.y = Math.PI; sahne.add(neon);

  // dönen platformlarda motosikletler: ortada macera tipi (Ducati tarzı), yanlarda spor ve cruiser
  const siyah = new THREE.MeshPhongMaterial({ color: 0x15161a, specular: 0x444444, shininess: 30 });
  const krom = new THREE.MeshPhongMaterial({ color: 0xcfd3da, specular: 0xffffff, shininess: 120 });
  const gri = new THREE.MeshPhongMaterial({ color: 0x5e6066, specular: 0xffffff, shininess: 50 });
  const camMat = new THREE.MeshPhongMaterial({ color: 0x9fb4c8, specular: 0xffffff, shininess: 80, transparent: true, opacity: 0.45, side: THREE.DoubleSide });
  function tekerYap(buyuk, kalin, kollu) {
    const w = new THREE.Group();
    w.add(new THREE.Mesh(new THREE.TorusGeometry(buyuk, kalin, 12, 32), siyah));
    w.add(new THREE.Mesh(new THREE.TorusGeometry(buyuk - 0.1, 0.015, 8, 28), krom));
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.12, 12), krom); hub.rotation.x = Math.PI / 2; w.add(hub);
    if (kollu) for (let i = 0; i < 6; i++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.012, buyuk * 1.7, 0.012), krom); sp.rotation.z = i * Math.PI / 6; w.add(sp); }
    return w;
  }
  function motoYap(stil, boya, boya2, vurgu) {
    const moto = new THREE.Group();
    const boyaM = new THREE.MeshPhongMaterial({ color: boya, specular: 0xffffff, shininess: 90, emissive: new THREE.Color(boya).multiplyScalar(0.12) });
    const boya2M = new THREE.MeshPhongMaterial({ color: boya2, specular: 0xffffff, shininess: 80, emissive: new THREE.Color(boya2).multiplyScalar(0.08) });
    const vurguM = new THREE.MeshPhongMaterial({ color: vurgu, specular: 0xffffff, shininess: 60, emissive: new THREE.Color(vurgu).multiplyScalar(0.2) });
    const P = (geo, mat, x, y, z, rz, rx) => { const p = new THREE.Mesh(geo, mat); p.position.set(x, y, z); if (rz) p.rotation.z = rz; if (rx) p.rotation.x = rx; moto.add(p); return p; };
    const buyuk = stil === 'adv' ? 0.35 : stil === 'cruiser' ? 0.3 : 0.31;
    const boyUz = stil === 'cruiser' ? 0.78 : 0.66;
    const gx = stil === 'cruiser' ? 0.6 : 0.52;          // ön takımın (direksiyon) pivotu
    const on = new THREE.Group(); on.position.set(gx, 0, 0); moto.add(on);   // direksiyonla dönen ön takım
    const Pon = (geo, mat, x, y, z, rz, rx) => { const p = new THREE.Mesh(geo, mat); p.position.set(x - gx, y, z); if (rz) p.rotation.z = rz; if (rx) p.rotation.x = rx; on.add(p); return p; };
    const arka = tekerYap(buyuk, stil === 'adv' ? 0.095 : 0.08, stil === 'adv'); arka.position.set(-boyUz, buyuk + 0.1, 0); moto.add(arka);
    const onTeker = tekerYap(buyuk, stil === 'adv' ? 0.095 : 0.08, stil === 'adv'); onTeker.position.set(boyUz - gx, buyuk + 0.1, 0); on.add(onTeker);
    [0.1, -0.1].forEach(z => Pon(new THREE.CylinderGeometry(0.022, 0.022, 0.62, 8), krom, gx + 0.08, 0.76, z, 0.355));   // ön amortisör
    Pon(new THREE.CylinderGeometry(0.016, 0.016, stil === 'cruiser' ? 0.9 : 0.64, 8), siyah, gx - 0.02, 1.02, 0, 0, Math.PI / 2);   // gidon
    [1, -1].forEach(d => Pon(new THREE.CylinderGeometry(0.02, 0.02, 0.12, 8), siyah, gx - 0.02, 1.02, d * (stil === 'cruiser' ? 0.45 : 0.32), 0, Math.PI / 2));
    Pon(new THREE.SphereGeometry(0.1, 14, 10), new THREE.MeshBasicMaterial({ color: 0xfff1c9 }), gx + 0.2, 0.92, 0);   // far
    // gövde
    const depo = P(new THREE.SphereGeometry(0.38, 18, 12), boyaM, 0.15, 0.95, 0); depo.scale.set(1, 0.5, 0.52);
    P(new THREE.BoxGeometry(0.5, 0.07, 0.22), siyah, -0.28, 0.85, 0);                                                    // sele
    P(new THREE.BoxGeometry(0.4, 0.3, 0.3), gri, 0.05, 0.55, 0);                                                         // motor bloğu
    [0.12, -0.12].forEach(z => P(new THREE.BoxGeometry(0.75, 0.05, 0.05), krom, -0.32, 0.45, z));                       // salıncak
    P(new THREE.CylinderGeometry(0.05, 0.065, 0.85, 12), krom, -0.45, 0.38, 0.2, Math.PI / 2 + 0.05);                   // egzoz
    P(new THREE.BoxGeometry(0.5, 0.025, 0.2), boya2M, -0.72, 0.8, 0, 0.25);                                              // arka çamurluk
    if (stil === 'adv') {
      P(new THREE.BoxGeometry(0.1, 0.04, 0.22), vurguM, -0.5, 0.83, 0);                                                  // kırmızı sele ucu
      const cam = Pon(new THREE.PlaneGeometry(0.3, 0.34), camMat, gx + 0.18, 1.2, 0); cam.rotation.y = Math.PI / 2; cam.rotation.z = -0.4;   // rüzgârlık
      Pon(new THREE.BoxGeometry(0.42, 0.05, 0.14), boya2M, gx + 0.18, 0.78, 0, -0.15);                                   // gaga çamurluk
      [0.28, -0.28].forEach(z => P(new THREE.BoxGeometry(0.42, 0.26, 0.17), siyah, -0.6, 0.78, z));                       // yan çantalar
      P(new THREE.BoxGeometry(0.34, 0.1, 0.34), boya2M, 0.12, 0.62, 0, 0, 0);                                            // karter koruma
      P(new THREE.BoxGeometry(0.28, 0.04, 0.28), vurguM, 0.14, 0.9, 0);                                                  // tank şeridi (kırmızı)
    }
    if (stil === 'sport') {
      const kapak = P(new THREE.SphereGeometry(0.34, 16, 12), boyaM, gx + 0.05, 0.95, 0); kapak.scale.set(1.05, 0.9, 0.55);   // ön kaporta
      P(new THREE.BoxGeometry(0.4, 0.04, 0.2), vurguM, 0.0, 0.7, 0);
    }
    if (stil === 'cruiser') {
      Pon(new THREE.CylinderGeometry(0.14, 0.14, 0.05, 16), krom, gx + 0.2, 0.92, 0, Math.PI / 2);                        // yuvarlak far çerçevesi
      [0.2, -0.2].forEach(z => P(new THREE.SphereGeometry(0.19, 14, 10), krom, -0.78, 0.55, z));
    }
    moto.rotation.order = 'YXZ';
    moto.userData = { on, tekerler: [onTeker, arka] };
    return moto;
  }
  const bikeler = [
    { x: R3cx, z: -5.5, stil: 'adv', boya: 0xf2f2f2, boya2: 0x15161a, vurgu: 0xd1162b, r: 1.35, hiz: 0.3, aci: 0.4 },
    { x: R3cx - 3.8, z: -5.8, stil: 'sport', boya: 0xd1162b, boya2: 0x15161a, vurgu: 0xffffff, r: 1.15, hiz: -0.4, aci: 1.2 },
    { x: R3cx + 3.8, z: -5.8, stil: 'cruiser', boya: 0x1f4fa8, boya2: 0x15161a, vurgu: 0xe8c33a, r: 1.2, hiz: 0.35, aci: 2.1 }
  ];
  motor.platlar = [];
  bikeler.forEach(bk => {
    if (SURUS_AKTIF && bk.stil === 'adv') {   // (kapalı) ana motor: platformsuz, koltuğun önünde park hâlinde
      const ana = motoYap(bk.stil, bk.boya, bk.boya2, bk.vurgu);
      ana.position.set(7.0, 0, -8.9); ana.rotation.y = -Math.PI / 2; sahne.add(ana); motor.ana = ana;
      return;
    }
    const m = new THREE.Group(); m.position.set(bk.x, 0, bk.z); m.rotation.y = bk.aci; sahne.add(m);
    const plat = new THREE.Mesh(new THREE.CylinderGeometry(bk.r, bk.r + 0.05, 0.1, 40), new THREE.MeshPhongMaterial({ color: 0x1c1d21, specular: 0x333333, shininess: 30 })); plat.position.y = 0.05; m.add(plat);
    const halka = new THREE.Mesh(new THREE.TorusGeometry(bk.r - 0.03, 0.018, 8, 60), new THREE.MeshBasicMaterial({ color: bk.stil === 'cruiser' ? 0x4aa3ff : 0xff2a4a })); halka.rotation.x = Math.PI / 2; halka.position.y = 0.105; m.add(halka);
    const moto = motoYap(bk.stil, bk.boya, bk.boya2, bk.vurgu); moto.position.y = 0.1; m.add(moto);
    motor.platlar.push({ g: m, hiz: bk.hiz, moto });
  });
  if (!motor.ana) motor.ana = motor.platlar[0].moto;
  motor.grup = motor.ana;
})();

// duvar çerçeveleri: motor fotoğrafları (foto/motor1.jpg ... motor6.jpg). Yoksa yer tutucu görünür.
function motorFotoEkle(dosya, px, pz, tarafi) {   // taraf: 'bati' | 'doga' | 'kuzey'
  const FH = 1.5, FW = 1.8, FY = 1.7;
  const rot = tarafi === 'bati' ? Math.PI / 2 : tarafi === 'doga' ? -Math.PI / 2 : Math.PI;
  const yon = tarafi === 'bati' ? [1, 0] : tarafi === 'doga' ? [-1, 0] : [0, -1];
  const cx = px + yon[0] * 0.065, cz = pz + yon[1] * 0.065;
  const cer = new THREE.Mesh(new THREE.BoxGeometry(tarafi === 'kuzey' ? FW + 0.2 : 0.06, FH + 0.2, tarafi === 'kuzey' ? 0.06 : FW + 0.2),
    new THREE.MeshPhongMaterial({ color: 0x111215, specular: 0x333333, shininess: 30 }));
  cer.position.set(px + yon[0] * 0.03, FY, pz + yon[1] * 0.03); sahne.add(cer);
  // yer tutucu: motosiklet silueti
  const c = document.createElement('canvas'); c.width = 512; c.height = 360;
  const x = c.getContext('2d');
  x.fillStyle = '#17181c'; x.fillRect(0, 0, 512, 360);
  x.strokeStyle = '#d1162b'; x.lineWidth = 8; x.lineCap = 'round';
  x.beginPath(); x.arc(130, 235, 62, 0, 7); x.stroke(); x.beginPath(); x.arc(382, 235, 62, 0, 7); x.stroke();
  x.beginPath(); x.moveTo(130, 235); x.lineTo(210, 140); x.lineTo(310, 150); x.lineTo(382, 235); x.moveTo(210, 140); x.lineTo(250, 235); x.lineTo(310, 150); x.moveTo(310, 150); x.lineTo(340, 100); x.lineTo(380, 100); x.stroke();
  x.fillStyle = 'rgba(243,233,220,.55)'; x.font = '26px Georgia, serif'; x.textAlign = 'center'; x.fillText('Motor fotoğrafı', 256, 330);
  const yer = new THREE.CanvasTexture(c);
  const net = new THREE.Mesh(new THREE.PlaneGeometry(FW, FH), new THREE.MeshBasicMaterial({ map: yer, color: 0x3a3a3a, fog: false }));
  net.position.set(cx, FY, cz); net.rotation.y = rot; sahne.add(net);
  const kayit = { net, bul: { material: { color: new THREE.Color(), opacity: 1 } }, z: cz, px: cx, pz: cz };
  cocukFoto.push(kayit);
  new THREE.TextureLoader().load(dosya, tex => {
    tex.anisotropy = 4;
    const oran = tex.image.width / tex.image.height;
    const gen = Math.min(2.6, FH * oran);
    net.material.map = tex; net.material.needsUpdate = true;
    net.scale.x = gen / FW; cer.scale.set(tarafi === 'kuzey' ? 1 : 1, 1, 1);
    if (tarafi === 'kuzey') cer.scale.x = (gen + 0.2) / (FW + 0.2); else cer.scale.z = (gen + 0.2) / (FW + 0.2);
    const bc = document.createElement('canvas'); bc.width = 18; bc.height = Math.max(8, Math.round(18 / oran));
    bc.getContext('2d').drawImage(tex.image, 0, 0, bc.width, bc.height);
    const bt = new THREE.CanvasTexture(bc); bt.magFilter = THREE.LinearFilter; bt.minFilter = THREE.LinearFilter;
    const bul = new THREE.Mesh(new THREE.PlaneGeometry(gen, FH), new THREE.MeshBasicMaterial({ map: bt, color: 0x1f1f1f, transparent: true, fog: false }));
    bul.position.set(cx + yon[0] * 0.002, FY, cz + yon[1] * 0.002); bul.rotation.y = rot; sahne.add(bul);
    kayit.bul = bul;
  }, undefined, () => {});
}
motorFotoEkle('foto/motor-a.jpg', 5.9, R3.z1, 'kuzey');
motorFotoEkle('foto/motor-b.jpg', 14.1, R3.z1, 'kuzey');
motorFotoEkle('foto/motor-c.jpg', R3.x1, -5.8, 'doga');    // sol duvar (içeri girerken sol)
motorFotoEkle('foto/motor-d.jpg', R3.x0, -5.8, 'bati');    // sağ duvar
function motorGuncelle(dt) { motor.platlar.forEach(p => { p.g.rotation.y += dt * p.hiz; }); }

// ---------- Dolabın üstünde gül başlı dönen rüzgâr gülü ----------
const ruzgarGulu = { bas: null };
(function ruzgarGuluKur() {
  const g = new THREE.Group();
  g.position.set(8.52, 0.75, -22.15); g.rotation.y = Math.PI / 2;   // çalışma masasının ön kenarında, yüzü odaya (+x) bakar
  sahne.add(g);
  const sap = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.4, 8), new THREE.MeshPhongMaterial({ color: 0x2f6a35, specular: 0x000000 }));
  sap.position.y = 0.2; g.add(sap);
  const yaprak = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), new THREE.MeshPhongMaterial({ color: 0x3a7d40, specular: 0x000000 }));
  yaprak.scale.set(1.3, 0.12, 0.55); yaprak.position.set(0.045, 0.14, 0); yaprak.rotation.z = 0.5; g.add(yaprak);
  const taban = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.012, 14), new THREE.MeshPhongMaterial({ color: 0xd4af37, specular: 0xffffff, shininess: 60 }));
  taban.position.y = 0.006; g.add(taban);
  const bas = new THREE.Group(); bas.position.set(0, 0.42, 0.012); g.add(bas);   // yüzü odaya (+z) bakar
  function petal(L, W, renk) {
    const sh = new THREE.Shape();
    sh.moveTo(0, 0); sh.bezierCurveTo(W * 1.1, L * 0.15, W * 1.15, L * 0.85, 0, L); sh.bezierCurveTo(-W * 1.15, L * 0.85, -W * 1.1, L * 0.15, 0, 0);
    return new THREE.Mesh(new THREE.ShapeGeometry(sh, 10), new THREE.MeshPhongMaterial({ color: renk, specular: 0xffffff, shininess: 40, side: THREE.DoubleSide }));
  }
  // kapalı gül tomurcuğu: yapraklar ileriye doğru kapanır, hafif bükülü (dönünce rüzgâr gülü gibi görünür)
  const katman = (adet, L, W, egim, ofset, renkler, bukul) => {
    for (let i = 0; i < adet; i++) {
      const p = petal(L, W, new THREE.Color(renkler[i % renkler.length]));
      p.rotation.x = egim;              // yaprağı ileriye (+z) yatır
      p.rotation.y = bukul;             // hafif bükülme
      const kol = new THREE.Group(); kol.rotation.z = ofset + i * 2 * Math.PI / adet;
      kol.add(p); bas.add(kol);
    }
  };
  katman(5, 0.15, 0.06, 0.95, 0.0, ['#a60d26', '#b3122c', '#a60d26', '#c8102e', '#b3122c'], 0.35);   // dış yapraklar
  katman(5, 0.125, 0.05, 1.2, 0.6, ['#c8102e', '#d92b45', '#cf1b38', '#d92b45', '#c8102e'], -0.3);    // orta
  katman(4, 0.095, 0.04, 1.38, 0.2, ['#d92b45', '#e64a5f'], 0.3);                                        // iç
  katman(3, 0.06, 0.03, 1.5, 0.9, ['#e64a5f', '#d92b45'], -0.25);                                        // en iç, kapalı uç
  // altta çanak yaprakları (yeşil)
  katman(5, 0.07, 0.03, -0.45, 0.3, ['#2e8b3d', '#3da34d'], 0.2);
  ruzgarGulu.bas = bas;
})();
function ruzgarGuluGuncelle(dt, t) {
  if (!ruzgarGulu.bas) return;
  const hiz = 3.2 + 1.6 * Math.sin(t * 0.5);   // vantilatörün esintisiyle hız değişir
  ruzgarGulu.bas.rotation.z -= dt * hiz;
}
// duvar fotoğrafı gibi: yalnızca ikinci odadayken çalışır

// ---------- Motor odası: arka duvarın ortasından yan duvarlardaki fotoğraflara giden silik oklar ----------
const motorOklar = [];
(function motorOklariKur() {
  const ok = (x, z, rotY, ters, k) => {
    const mat = new THREE.MeshBasicMaterial({ color: 0xe8b25f, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
    const m = new THREE.Mesh(okGeo, mat);
    m.scale.set(ters ? -0.7 : 0.7, 0.7, 1);
    m.position.set(x, 0.62, z); m.rotation.y = rotY;
    sahne.add(m);
    motorOklar.push({ mat, k });
  };
  const zN = R3.z1 - 0.02;
  // arka duvarda ortadan dışa (neon yazının altından), sonra yan duvarlarda fotoğrafa doğru
  [8.6, 7.8, 7.0, 6.2, 5.4].forEach((x, n) => ok(x, zN, Math.PI, false, n));                  // batıya (sağdaki duvara)
  [11.4, 12.2, 13.0, 13.8, 14.6].forEach((x, n) => ok(x, zN, Math.PI, true, n));              // doğuya (soldaki duvara)
  [-1.4, -2.3, -3.2, -4.1].forEach((z, n) => ok(R3.x0 + 0.02, z, Math.PI / 2, false, 5 + n));   // batı duvarı: güneye, fotoğrafa
  [-1.4, -2.3, -3.2, -4.1].forEach((z, n) => ok(R3.x1 - 0.02, z, -Math.PI / 2, true, 5 + n));   // doğu duvarı
})();

// ---------- Sürüş koltuğu ve uzaktan kumandalı motor ----------
const KOLTUK = { x: 7.0, z: -10.45 };
const PARK = { x: 7.0, z: -8.9, h: -Math.PI / 2 };
const surus = { oturuyor: false, aktif: false, donus: null, x: 0, z: 0, h: 0, v: 0, gaz: false, fren: false, motorSes: null, yon: 0 };
const SURUS_SINIR = { x0: 4.8, x1: 15.2, z0: -10.8, z1: -1.2 };
const SURUS_ENGEL = [{ x: 7.2, z: -2.9, r: 1.65 }, { x: 12.8, z: -2.9, r: 1.7 }, { x: 7.0, z: -11.0, r: 1.1 }];
if (SURUS_AKTIF) ENGELLER3.push({ x: 7.0, z: -11.0, r: 0.55 });   // oyuncu bankın içinden geçmesin
(function koltukKur() {
  if (!SURUS_AKTIF) return;
  const ahsap = new THREE.MeshPhongMaterial({ color: 0x4a3220, specular: 0x221a12, shininess: 14 });
  const kirmizi = new THREE.MeshPhongMaterial({ color: 0xa8182c, specular: 0x331010, shininess: 20 });
  const k = (w, h, d, mat, x, y, z) => kutu(w, h, d, mat, x, y, z);
  k(1.2, 0.1, 0.55, ahsap, 7.0, 0.42, -11.02);                // oturak
  k(1.1, 0.12, 0.47, kirmizi, 7.0, 0.52, -11.02);             // minder
  k(1.2, 0.6, 0.08, ahsap, 7.0, 0.8, -11.26);                 // arkalık
  k(1.1, 0.45, 0.1, kirmizi, 7.0, 0.82, -11.2);               // arkalık minderi
  [[-0.55, -10.8], [0.55, -10.8], [-0.55, -11.22], [0.55, -11.22]].forEach(p => k(0.07, 0.4, 0.07, ahsap, 7.0 + p[0], 0.2, p[1]));
  [-0.6, 0.6].forEach(d => k(0.06, 0.2, 0.5, ahsap, 7.0 + d, 0.62, -11.02));   // kolçaklar
  // duvarda yazı
  const c = document.createElement('canvas'); c.width = 768; c.height = 160;
  const x = c.getContext('2d'); const d = new THREE.CanvasTexture(c);
  function yaz() {
    x.clearRect(0, 0, 768, 160); x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = '84px "Great Vibes", "Snell Roundhand", cursive';
    const gr = x.createLinearGradient(0, 0, 768, 0); gr.addColorStop(0, '#fff3cf'); gr.addColorStop(0.5, '#d9a94f'); gr.addColorStop(1, '#f7e2a6');
    x.shadowColor = 'rgba(0,0,0,.6)'; x.shadowBlur = 8; x.fillStyle = gr; x.fillText('Otur, motoru sen sür', 384, 84);
    d.needsUpdate = true;
  }
  yaz();
  if (document.fonts && document.fonts.load) document.fonts.load('80px "Great Vibes"', 'Otur motoru sen sür').then(yaz).catch(() => {});
  const yazi = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6 * 160 / 768), new THREE.MeshBasicMaterial({ map: d, transparent: true, depthWrite: false, fog: false }));
  yazi.position.set(7.0, 1.75, R3.z0 + 0.03); sahne.add(yazi);
})();
const oturBtn = document.getElementById('oturBtn'), surusKutu = document.getElementById('surus');
const gazBtn = document.getElementById('gazBtn'), frenBtn = document.getElementById('frenBtn'), kalkBtn = document.getElementById('kalkBtn');
const basili = (el, f) => {
  const ac = e => { e.preventDefault(); f(true); el.classList.add('bas'); }, kapat = e => { f(false); el.classList.remove('bas'); };
  el.addEventListener('pointerdown', ac); el.addEventListener('pointerup', kapat); el.addEventListener('pointercancel', kapat); el.addEventListener('pointerleave', kapat);
};
basili(gazBtn, v => { surus.gaz = v; });
basili(frenBtn, v => { surus.fren = v; });
function motorSesiBasla() {
  try {
    if (!sesBagl || surus.motorSes) return;
    const c = sesBagl, o = c.createOscillator(), o2 = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain();
    o.type = 'sawtooth'; o2.type = 'square'; f.type = 'lowpass'; f.frequency.value = 420; f.Q.value = 2;
    g.gain.value = 0.0001;
    o.connect(f); o2.connect(f); f.connect(g); g.connect(c.destination); o.start(); o2.start();
    surus.motorSes = { o, o2, f, g };
  } catch (e) {}
}
function motorSesiDur() {
  try { if (surus.motorSes) { const m = surus.motorSes; m.g.gain.setTargetAtTime(0.0001, sesBagl.currentTime, 0.1); setTimeout(() => { try { m.o.stop(); m.o2.stop(); } catch (e) {} }, 400); surus.motorSes = null; } } catch (e) {}
}
oturBtn.addEventListener('click', () => {
  if (surus.oturuyor || surus.aktif) return;
  surus.oturuyor = true; surus.kam = null;
  kon.x = KOLTUK.x; kon.z = KOLTUK.z; kon.vx = 0; kon.vz = 0; kon.yaw = Math.PI; kon.oto = null; ikiliYon = Math.PI;
  const moto0 = motor.ana;
  surus.x = moto0.position.x; surus.z = moto0.position.z; surus.h = moto0.rotation.y; surus.v = 0; surus.donus = null;
  surus.aktif = true;
  oturBtn.classList.remove('acik'); surusKutu.classList.add('acik');
  motorSesiBasla();
});
kalkBtn.addEventListener('click', () => {
  if (!surus.oturuyor) return;
  surus.oturuyor = false; surus.gaz = false; surus.fren = false;
  surusKutu.classList.remove('acik'); motorSesiDur();
  surus.donus = { t0: performance.now() };
});
function surusGuncelle(dt, simdi) {
  if (!SURUS_AKTIF || !motor.ana) return;
  const moto = motor.ana, gecis = moto.userData;
  // oturma düğmesi: koltuğa yaklaşınca görünür
  const koltugaYakin = K3.acik && !surus.oturuyor && !surus.aktif && Math.hypot(kon.x - KOLTUK.x, kon.z - KOLTUK.z) < 1.5 && kon.z > R3.z0 && kon.x < R3.x1;
  oturBtn.classList.toggle('acik', koltugaYakin);
  if (!surus.aktif) return;
  if (surus.donus) {   // park yerine geri dönüş
    surus.x += (PARK.x - surus.x) * Math.min(1, dt * 2.5); surus.z += (PARK.z - surus.z) * Math.min(1, dt * 2.5);
    const fark = Math.atan2(Math.sin(PARK.h - surus.h), Math.cos(PARK.h - surus.h)); surus.h += fark * Math.min(1, dt * 3);
    surus.v = 0;
    moto.position.set(surus.x, 0, surus.z); moto.rotation.y = surus.h; moto.rotation.x = 0;
    gecis.on.rotation.y = 0;
    if (Math.hypot(PARK.x - surus.x, PARK.z - surus.z) < 0.05 && Math.abs(fark) < 0.05) {
      moto.position.set(PARK.x, 0, PARK.z); moto.rotation.y = PARK.h;
      surus.aktif = false; surus.donus = null;
    }
    return;
  }
  // girişler
  const t = kon.tus;
  let dir = kon.joyX + ((t['d'] || t['arrowright']) ? 1 : 0) - ((t['a'] || t['arrowleft']) ? 1 : 0);
  dir = Math.max(-1, Math.min(1, dir));
  const gaz = surus.gaz || t['w'] || t['arrowup'] || t[' '], fren = surus.fren || t['s'] || t['arrowdown'];
  // hız
  if (gaz) surus.v += 3.6 * dt; else surus.v -= 1.1 * dt * Math.sign(surus.v);
  if (fren) { if (surus.v > 0.02) surus.v = Math.max(0, surus.v - 8 * dt); else surus.v = Math.max(-1.8, surus.v - 2.2 * dt); }   // durunca frene basılı tutmak geri vitese alır
  surus.v = Math.max(-1.8, Math.min(6.5, surus.v));
  if (Math.abs(surus.v) < 0.02 && !gaz && !fren) surus.v = 0;
  // direksiyon: yavaşken geniş, hızlanınca keskin, çok hızlıda biraz daha yumuşak
  const donusHizi = 2.2 * Math.min(1, Math.abs(surus.v) / 1.8) * (1 - Math.min(0.35, Math.abs(surus.v) / 18));
  surus.yon += (dir - surus.yon) * Math.min(1, dt * 8);
  surus.h -= surus.yon * donusHizi * dt * Math.sign(surus.v || 1);
  surus.x += Math.cos(surus.h) * surus.v * dt; surus.z -= Math.sin(surus.h) * surus.v * dt;
  // duvarlar
  const S = SURUS_SINIR;
  if (surus.x < S.x0) { surus.x = S.x0; surus.h = Math.PI - surus.h; surus.v *= 0.55; }
  if (surus.x > S.x1) { surus.x = S.x1; surus.h = Math.PI - surus.h; surus.v *= 0.55; }
  if (surus.z < S.z0) { surus.z = S.z0; surus.h = -surus.h; surus.v *= 0.55; }
  if (surus.z > S.z1) { surus.z = S.z1; surus.h = -surus.h; surus.v *= 0.55; }
  SURUS_ENGEL.forEach(o => {
    const dx = surus.x - o.x, dz = surus.z - o.z, d = Math.hypot(dx, dz);
    if (d < o.r && d > 0.0001) { surus.x = o.x + dx / d * o.r; surus.z = o.z + dz / d * o.r; surus.v *= 0.6; }
  });
  // görünüm
  moto.position.set(surus.x, 0, surus.z); moto.rotation.y = surus.h;
  moto.rotation.x = surus.yon * Math.min(1, Math.abs(surus.v) / 4) * 0.35;   // virajda yatar
  gecis.on.rotation.y = -surus.yon * 0.5;
  gecis.tekerler.forEach(w => { w.rotation.z -= surus.v / 0.4 * dt; });
  // motor sesi
  if (surus.motorSes) {
    const m = surus.motorSes, n = Math.abs(surus.v) / 6.5;
    m.o.frequency.setTargetAtTime(48 + n * 110 + (gaz ? 14 : 0), sesBagl.currentTime, 0.05);
    m.o2.frequency.setTargetAtTime(24 + n * 55, sesBagl.currentTime, 0.05);
    m.f.frequency.setTargetAtTime(300 + n * 900, sesBagl.currentTime, 0.08);
    m.g.gain.setTargetAtTime(0.045 + 0.07 * n + (gaz ? 0.02 : 0), sesBagl.currentTime, 0.08);
  }
}

// ---------- İREM parkuru: gün batımında topraklı, geniş arazi ----------
const ARX = 1500, ARZ = 0;                       // arena odalardan çok uzakta (görünmez)
const park = { aktif: false, hazir: false, x: 0, z: 0, y: 0, vy: 0, h: 0, v: 0, yon: 0, ramp: false, gaz: false, fren: false, ust: false,
  vyG: 0, grup: null, kam: null, toz: [], tozSira: 0, sonToz: 0, eskiSis: null, eskiArka: null, kapali: [], maske: null, mw: 0, mh: 0 };
const PARK_RAMPALAR = [];
const PARK_OLCEK = 0.7;   // İREM yazısının küçültme oranı
const PARK_TEPE = { x0: ARX + 175, z: ARZ, gen: 24, Hh: 6.5 };       // tepe: 24 m yokuş, 10 m düzlük, 12 m iniş
const PARK_TUMSEK = { x0: ARX + 262, z: ARZ, gen: 20, genlik: 0.6 };   // 8 tümsek dizisi
const PARK_SALLANAK = { x: ARX + 245, z: ARZ, aci: 0.2, hedef: 0.2, tahta: null };
const duz = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
function parkYukseklik(x, z, sadeceTepeTumsek) {   // arazinin yüksekliği
  let h = 0;
  const t = PARK_TEPE;
  if (Math.abs(z - t.z) < t.gen / 2) {
    const u = x - t.x0, kenar = Math.abs(z - t.z) < t.gen / 2 ? 1 : 0;
    let y = 0;
    if (u > 0 && u < 24) y = t.Hh * duz(u / 24);
    else if (u >= 24 && u < 34) y = t.Hh;
    else if (u >= 34 && u < 46) y = t.Hh * (1 - duz((u - 34) / 12));
    h = Math.max(h, y * kenar);
  }
  const b = PARK_TUMSEK;
  if (Math.abs(z - b.z) < b.gen / 2) {
    const u = x - b.x0;
    if (u > 0 && u < 60) h = Math.max(h, b.genlik * (0.5 - 0.5 * Math.cos(u / 7.5 * Math.PI * 2)));
  }
  if (sadeceTepeTumsek) return h;
  PARK_RAMPALAR.forEach(r => {
    const dx = x - r.x, dz = z - r.z, c = Math.cos(r.rot), sn = Math.sin(r.rot);
    const u = dx * c - dz * sn + r.L / 2, w = dx * sn + dz * c;
    if (Math.abs(w) < r.W / 2 && u > 0 && u < r.L) h = Math.max(h, u / r.L * r.H);
  });
  const sl = PARK_SALLANAK, su = x - sl.x, sw = z - sl.z;
  if (Math.abs(su) < 8 && Math.abs(sw) < 3) h = Math.max(h, 1.6 + su * Math.tan(sl.aci));
  return h;
}
function parkKur() {
  if (park.hazir) return;
  park.hazir = true;
  const g = new THREE.Group(); g.visible = false; sahne.add(g); park.grup = g;
  // zemin: çimen
  const cc = document.createElement('canvas'); cc.width = cc.height = 256;
  const cx = cc.getContext('2d'); cx.fillStyle = '#5d7a37'; cx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2600; i++) { cx.fillStyle = ['#6a8a3d', '#4e6a2e', '#7a9a48', '#566f30'][i % 4]; cx.fillRect(Math.random() * 256, Math.random() * 256, 2 + Math.random() * 3, 2 + Math.random() * 3); }
  const cd = new THREE.CanvasTexture(cc); cd.wrapS = cd.wrapT = THREE.RepeatWrapping; cd.repeat.set(160, 160);
  const zemin = new THREE.Mesh(new THREE.PlaneGeometry(3600, 3600), new THREE.MeshLambertMaterial({ map: cd }));
  zemin.rotation.x = -Math.PI / 2; zemin.position.set(ARX, 0, ARZ); g.add(zemin);

  // toprak yol: İ R E M harfleri (10 piksel = 1 metre)
  const PW = 2080, PH = 1000;
  const tc = document.createElement('canvas'); tc.width = PW; tc.height = PH;
  const tx = tc.getContext('2d');
  const M = 10, Hh = 60, Y0 = 22, KAL = 9;
  const yol = (cizim, genislik, renk) => { tx.strokeStyle = renk; tx.lineWidth = genislik * M; tx.lineCap = 'round'; tx.lineJoin = 'round'; cizim(); tx.stroke(); };
  const harfler = (genislik, renk) => {
    const L = (x0, fn) => { tx.beginPath(); fn((x, y) => tx.moveTo((x0 + x) * M, (Y0 + y) * M), (x, y) => tx.lineTo((x0 + x) * M, (Y0 + y) * M), tx); };
    // İ
    yol(() => { tx.beginPath(); tx.moveTo(26 * M, Y0 * M); tx.lineTo(26 * M, (Y0 + Hh) * M); }, genislik, renk);
    yol(() => { tx.beginPath(); tx.arc(26 * M, 8 * M, 3.2 * M, 0, 7); }, genislik, renk);
    // R
    yol(() => { tx.beginPath(); tx.moveTo(44 * M, (Y0 + Hh) * M); tx.lineTo(44 * M, Y0 * M); tx.lineTo(62 * M, Y0 * M); tx.arc(62 * M, (Y0 + 15) * M, 15 * M, -Math.PI / 2, Math.PI / 2); tx.lineTo(44 * M, (Y0 + 30) * M); tx.moveTo(56 * M, (Y0 + 30) * M); tx.lineTo(76 * M, (Y0 + Hh) * M); }, genislik, renk);
    // E
    yol(() => { tx.beginPath(); tx.moveTo(122 * M, Y0 * M); tx.lineTo(96 * M, Y0 * M); tx.lineTo(96 * M, (Y0 + Hh) * M); tx.lineTo(122 * M, (Y0 + Hh) * M); tx.moveTo(96 * M, (Y0 + 30) * M); tx.lineTo(118 * M, (Y0 + 30) * M); }, genislik, renk);
    // M
    yol(() => { tx.beginPath(); tx.moveTo(144 * M, (Y0 + Hh) * M); tx.lineTo(144 * M, Y0 * M); tx.lineTo(169 * M, (Y0 + 34) * M); tx.lineTo(194 * M, Y0 * M); tx.lineTo(194 * M, (Y0 + Hh) * M); }, genislik, renk);
  };
  harfler(KAL + 1.6, '#6e3419');       // kenar (koyu)
  harfler(KAL, '#b4572d');             // toprak
  harfler(KAL - 3.4, '#c4693a');       // orta açık şerit
  tx.globalCompositeOperation = 'source-atop';
  for (let i = 0; i < 9000; i++) { tx.fillStyle = ['#a24a24', '#c9753f', '#8d4020', '#b95f31'][i % 4]; tx.fillRect(Math.random() * PW, Math.random() * PH, 3 + Math.random() * 7, 2 + Math.random() * 4); }
  tx.globalCompositeOperation = 'source-over';
  const veri = tx.getImageData(0, 0, PW, PH).data;       // yüzey maskesi: dolu piksel = toprak
  park.maske = new Uint8Array(PW * PH); for (let i = 0; i < PW * PH; i++) park.maske[i] = veri[i * 4 + 3] > 128 ? 1 : 0;
  park.mw = PW; park.mh = PH;
  const yolDoku = new THREE.CanvasTexture(tc); yolDoku.anisotropy = 4;
  const yolMesh = new THREE.Mesh(new THREE.PlaneGeometry(PW / M * PARK_OLCEK, PH / M * PARK_OLCEK), new THREE.MeshLambertMaterial({ map: yolDoku, transparent: true }));
  yolMesh.rotation.x = -Math.PI / 2; yolMesh.position.set(ARX, 0.04, ARZ - 5); g.add(yolMesh);

  // rampalar (İREM yazısından sonra)
  const rampMat = new THREE.MeshLambertMaterial({ color: 0xb4572d });
  [[ARX + 86, ARZ - 3, 0], [ARX + 114, ARZ + 5, 0.25], [ARX + 142, ARZ - 9, -0.2]].forEach(r => {
    const L = 10, W = 8, Hy = 2.6;
    const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(L, Hy); sh.lineTo(L, 0); sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth: W, bevelEnabled: false }); geo.translate(-L / 2, 0, -W / 2);
    const m = new THREE.Mesh(geo, rampMat); m.position.set(r[0], 0.02, r[1]); m.rotation.y = r[2]; g.add(m);
    const sar = new THREE.Mesh(new THREE.PlaneGeometry(0.8, W), new THREE.MeshBasicMaterial({ color: 0xffe14a })); // uçta sarı şerit
    sar.rotation.y = r[2] + Math.PI / 2; sar.position.set(r[0] + Math.cos(r[2]) * L / 2, Hy + 0.02, r[1] - Math.sin(r[2]) * L / 2);
    g.add(sar);
    PARK_RAMPALAR.push({ x: r[0], z: r[1], rot: r[2], L, W, H: Hy });
  });

  // yeni parkur bölümleri: tepe (çıkış-iniş), tahterevalli, tümsekler
  const toprakM = new THREE.MeshLambertMaterial({ color: 0xb4572d });
  const dilim = (gen, der, segX, f, x0, zc) => {   // yükseklik fonksiyonundan şerit yüzey
    const geo = new THREE.PlaneGeometry(gen, der, segX, 1); geo.rotateX(-Math.PI / 2);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const wx = x0 + p.getX(i) + gen / 2; p.setY(i, parkYukseklik(wx, zc, true)); p.setX(i, p.getX(i)); }
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, toprakM); m.position.set(x0 + gen / 2, 0.02, zc); g.add(m);
  };
  dilim(46, 24, 92, null, PARK_TEPE.x0, PARK_TEPE.z);
  dilim(60, 20, 160, null, PARK_TUMSEK.x0, PARK_TUMSEK.z);
  // tahterevalli
  const tahta = new THREE.Group(); tahta.position.set(PARK_SALLANAK.x, 1.6, PARK_SALLANAK.z); g.add(tahta);
  const plank = new THREE.Mesh(new THREE.BoxGeometry(16, 0.3, 6), new THREE.MeshLambertMaterial({ color: 0x7a5232 })); plank.position.y = -0.15; tahta.add(plank);
  [-1, 1].forEach(sg => { const kenar = new THREE.Mesh(new THREE.BoxGeometry(16, 0.25, 0.3), new THREE.MeshLambertMaterial({ color: 0xe8c33a })); kenar.position.set(0, 0.05, sg * 2.85); tahta.add(kenar); });
  const destek = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.9, 1.6, 12), new THREE.MeshLambertMaterial({ color: 0x4a4d55 })); destek.rotation.x = Math.PI / 2; destek.position.set(PARK_SALLANAK.x, 0.8, PARK_SALLANAK.z); g.add(destek);
  PARK_SALLANAK.tahta = tahta; tahta.rotation.z = PARK_SALLANAK.aci;
  // gökyüzü kubbesi (gün batımı), güneş ve dağlar
  const sk = document.createElement('canvas'); sk.width = 8; sk.height = 256;
  const sx = sk.getContext('2d'), sg = sx.createLinearGradient(0, 0, 0, 256);
  sg.addColorStop(0, '#2f2a66'); sg.addColorStop(0.35, '#8a4a7a'); sg.addColorStop(0.48, '#ff8f4a'); sg.addColorStop(0.5, '#ffc27a'); sg.addColorStop(0.52, '#f09a60'); sg.addColorStop(1, '#a96a4a');
  sx.fillStyle = sg; sx.fillRect(0, 0, 8, 256);
  const kubbe = new THREE.Mesh(new THREE.SphereGeometry(1000, 24, 16), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sk), side: THREE.BackSide, fog: false }));
  park.kubbe = kubbe; g.add(kubbe);
  const gunes = new THREE.Sprite(new THREE.SpriteMaterial({ map: radyalDoku(255, 220, 160), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  gunes.scale.set(420, 420, 1); gunes.position.set(ARX + 900, 90, ARZ - 250); g.add(gunes); park.gunes = gunes;
  const dagMat = new THREE.MeshLambertMaterial({ color: 0x3a2c3e });
  for (let i = 0; i < 18; i++) {
    const a = i / 18 * Math.PI * 2, r = 700 + (i % 3) * 40, h = 90 + (i * 37 % 80);
    const d = new THREE.Mesh(new THREE.ConeGeometry(160 + (i % 4) * 30, h, 6), dagMat);
    d.position.set(ARX + Math.cos(a) * r, h / 2 - 2, ARZ + Math.sin(a) * r); g.add(d);
  }
  // tepecikler ve taşlar (süs)
  const tasMat = new THREE.MeshLambertMaterial({ color: 0x8a8378 });
  for (let i = 0; i < 70; i++) {
    const tas = new THREE.Mesh(new THREE.DodecahedronGeometry(0.6 + (i % 5) * 0.35, 0), tasMat);
    tas.position.set(ARX + ((i * 53) % 280) - 140, 0.3, ARZ + ((i * 31) % 140) - 70); g.add(tas);
  }
  // çit: arenanın çevresi
  const direk = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.4, 0.3), new THREE.MeshLambertMaterial({ color: 0x5a4030 }));
  const dir = new THREE.InstancedMesh(direk.geometry, direk.material, 300);
  const o = new THREE.Object3D(); let n = 0;
  const put = (x, z) => { if (n < 300) { o.position.set(ARX + x, 0.7, ARZ + z); o.updateMatrix(); dir.setMatrixAt(n++, o.matrix); } };
  for (let x = -150; x <= 315; x += 6) { put(x, -75); put(x, 75); }
  for (let z = -72; z <= 72; z += 6) { put(-150, z); put(315, z); }
  g.add(dir);
  const ray = new THREE.MeshLambertMaterial({ color: 0x6b4c36 });
  [-75, 75].forEach(z => { const m = new THREE.Mesh(new THREE.BoxGeometry(465, 0.12, 0.12), ray); m.position.set(ARX + 82.5, 1.1, ARZ + z); g.add(m); });
  [-150, 315].forEach(x => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 150), ray); m.position.set(ARX + x, 1.1, ARZ); g.add(m); });
  // arena ışıkları (sadece parkurda açık)
  park.gunIsik = new THREE.DirectionalLight(0xffa860, 1.15); park.gunIsik.position.set(ARX + 300, 80, ARZ - 120); park.gunIsik.visible = false; sahne.add(park.gunIsik);
  park.gokIsik = new THREE.HemisphereLight(0xffc79a, 0x4a3a2a, 0.75); park.gokIsik.visible = false; sahne.add(park.gokIsik);
  // toz küreleri
  const tozDoku = radyalDoku(214, 170, 120);
  for (let i = 0; i < 28; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tozDoku, transparent: true, opacity: 0, depthWrite: false, fog: true }));
    sp.visible = false; g.add(sp); park.toz.push({ sp, t: 9, x: 0, y: 0, z: 0 });
  }
}
function parkYuzey(x, z) {   // true = toprak yol
  const px = Math.floor(((x - ARX) / PARK_OLCEK + 104) * 10), py = Math.floor(((z - (ARZ - 5)) / PARK_OLCEK + 50) * 10);
  if (px < 0 || py < 0 || px >= park.mw || py >= park.mh) return false;
  return park.maske[py * park.mw + px] === 1;
}
const gecisKutu = document.getElementById('gecis'), parkKart = document.getElementById('parkurKart');
const yukariBtn = document.getElementById('yukariBtn');
function parkAc() {
  if (park.aktif) return;
  parkKur();
  gecisKutu.classList.add('acik');
  setTimeout(() => {
    park.aktif = true;
    // ışıklar: odalardaki ışıkları kapat (telefonu yormasın), arena ışıklarını aç
    park.kapali = [];
    sahne.traverse(o => { if (o.isLight && o !== park.gunIsik && o !== park.gokIsik && o.visible) { o.visible = false; park.kapali.push(o); } });
    park.gunIsik.visible = true; park.gokIsik.visible = true;
    park.eskiSis = sahne.fog; park.eskiArka = sahne.background;
    sahne.fog = new THREE.FogExp2(0xe39a68, 0.0012); sahne.background = new THREE.Color(0xe39a68);
    kamera.far = 1500; kamera.updateProjectionMatrix();
    park.grup.visible = true; ikili.visible = false;
    // motor: standdan çıkar, parkurun başına konur
    const mo = motor.platlar[0]; park.moto = mo.moto;
    sahne.add(park.moto);
    park.x = ARX - 92; park.z = ARZ - 5; park.h = 0; park.v = 0; park.y = 0; park.vy = 0; park.vyG = 0; park.yon = 0; park.kam = null; park.gorunum = 0; yukariBtn.textContent = 'Yukarıdan'; kamera.up.set(0, 1, 0);
    surusKutu.classList.add('acik'); kalkBtn.textContent = 'Çık'; yukariBtn.classList.add('acik');
    motorSesiBasla();
    gecisKutu.classList.remove('acik');
  }, 650);
}
function parkKapat() {
  if (!park.aktif) return;
  gecisKutu.classList.add('acik');
  surusKutu.classList.remove('acik'); yukariBtn.classList.remove('acik'); park.gaz = false; park.fren = false; surus.gaz = false; surus.fren = false; motorSesiDur();
  setTimeout(() => {
    park.aktif = false;
    park.kapali.forEach(o => { o.visible = true; });
    park.gunIsik.visible = false; park.gokIsik.visible = false;
    sahne.fog = park.eskiSis; sahne.background = park.eskiArka;
    kamera.far = 60; kamera.up.set(0, 1, 0); kamera.updateProjectionMatrix(); boyutla();
    park.grup.visible = false; ikili.visible = true;
    const mo = motor.platlar[0]; mo.g.add(park.moto); park.moto.position.set(0, 0.1, 0); park.moto.rotation.set(0, 0, 0); park.moto.userData.on.rotation.y = 0;
    kalkBtn.textContent = 'Kalk';
    gecisKutu.classList.remove('acik');
  }, 650);
}
const GORUNUM_ADI = ['Yukarıdan', 'Harita', 'Normal'];   // düğmede bir sonraki görünüm yazar
yukariBtn.addEventListener('click', () => { park.gorunum = ((park.gorunum || 0) + 1) % 3; park.kam = null; yukariBtn.textContent = GORUNUM_ADI[park.gorunum]; });
kalkBtn.addEventListener('click', () => { if (park.aktif) parkKapat(); });
function tozAt(x, y, z, t) {
  const p = park.toz[park.tozSira = (park.tozSira + 1) % park.toz.length];
  p.t = 0; p.x = x; p.y = y; p.z = z; p.sp.visible = true;
}
function parkGuncelle(dt, simdi) {
  if (!park.aktif) return;
  const t = kon.tus, moto = park.moto, gecis = moto.userData;
  let dir = kon.joyX + ((t['d'] || t['arrowright']) ? 1 : 0) - ((t['a'] || t['arrowleft']) ? 1 : 0);
  dir = Math.max(-1, Math.min(1, dir));
  const gaz = park.gaz || surus.gaz || t['w'] || t['arrowup'] || t[' '], fren = park.fren || surus.fren || t['s'] || t['arrowdown'];   // ekrandaki GAZ/FREN düğmeleri surus.gaz / surus.fren'i ayarlar
  const toprakta = parkYuzey(park.x, park.z), havada = park.y > 0.05;
  const vmax = toprakta ? 16 : 8, ivme = toprakta ? 5.2 : 3.2;
  if (!havada) {
    if (gaz) park.v += ivme * dt; else park.v -= 1.3 * dt * Math.sign(park.v);
    if (park.v > vmax) park.v -= 6 * dt;                       // çimende yavaşlatır
    if (fren) { if (park.v > 0.02) park.v = Math.max(0, park.v - 9 * dt); else park.v = Math.max(-2.2, park.v - 2.4 * dt); }
    if (Math.abs(park.v) < 0.03 && !gaz && !fren) park.v = 0;
  }
  park.v = Math.max(-2.2, Math.min(20, park.v));
  const donusHizi = 1.9 * Math.min(1, Math.abs(park.v) / 2.5) * (1 - Math.min(0.45, Math.abs(park.v) / 32));
  park.yon += (dir - park.yon) * Math.min(1, dt * 7);
  park.h -= park.yon * donusHizi * dt * Math.sign(park.v || 1) * (havada ? 0.25 : 1);
  const ox = park.x, oz = park.z;
  park.x += Math.cos(park.h) * park.v * dt; park.z -= Math.sin(park.h) * park.v * dt;
  // sınırlar
  if (park.x < ARX - 145) { park.x = ARX - 145; park.h = Math.PI - park.h; park.v *= 0.5; }
  if (park.x > ARX + 315) { park.x = ARX + 315; park.h = Math.PI - park.h; park.v *= 0.5; }
  if (park.z < ARZ - 70) { park.z = ARZ - 70; park.h = -park.h; park.v *= 0.5; }
  if (park.z > ARZ + 70) { park.z = ARZ + 70; park.h = -park.h; park.v *= 0.5; }
  // arazi: rampalar, tepe, tahterevalli, tümsekler
  const f0x = Math.cos(park.h), f0z = -Math.sin(park.h);
  // tahterevalli: motor ortayı geçince ters tarafa devrilir
  const SL = PARK_SALLANAK, suz = park.x - SL.x, swz = park.z - SL.z;
  if (Math.abs(suz) < 8 && Math.abs(swz) < 3 && Math.abs(suz) > 0.6) SL.hedef = suz < 0 ? 0.2 : -0.2;
  const eskiAci = SL.aci; SL.aci += Math.max(-0.7 * dt, Math.min(0.7 * dt, SL.hedef - SL.aci)); SL.tahta.rotation.z = SL.aci;
  if (Math.sign(eskiAci - 0.001) !== Math.sign(SL.aci - 0.001) && Math.abs(SL.aci) < 0.01) balonSesi(4);
  const zeminY = parkYukseklik(park.x, park.z, false);
  const egimOnu = (parkYukseklik(park.x + f0x * 0.9, park.z + f0z * 0.9, false) - parkYukseklik(park.x - f0x * 0.9, park.z - f0z * 0.9, false)) / 1.8;
  const egim = egimOnu;
  if (park.vy !== 0 || park.y > zeminY + 0.03) {   // havada
    park.y += park.vy * dt; park.vy -= 16 * dt;
    if (park.y <= zeminY) { if (park.vy < -3) tozAt(park.x, 0.2, park.z); park.y = zeminY; park.vy = 0; park.vyG = 0; }
  } else {
    const vyG = (zeminY - park.y) / Math.max(dt, 0.001);
    if (zeminY < park.y - 0.03 && (park.vyG || 0) > 1.2 && park.v > 3) { park.vy = park.vyG; park.y += park.vy * dt; }   // yükselen zemin birden bitti: havaya fırla
    else { park.y = zeminY; park.vyG = park.vyG * 0.6 + vyG * 0.4; }
    park.v -= egim * 3.5 * dt;                                                        // yokuşta yavaşlar, inişte hızlanır
  }
  const havaTam = park.y > zeminY + 0.08;
  // görünüm
  moto.position.set(park.x, park.y, park.z); moto.rotation.y = park.h;
  moto.rotation.x = park.yon * Math.min(1, Math.abs(park.v) / 6) * 0.38;
  moto.rotation.z = havaTam ? Math.atan2(park.vy, Math.max(4, park.v)) * 0.6 : Math.atan(egim);
  gecis.on.rotation.y = -park.yon * 0.5;
  gecis.tekerler.forEach(w => { w.rotation.z -= park.v / 0.4 * dt; });
  // toz
  if (park.v > 2 && !havaTam && simdi - park.sonToz > 60) { park.sonToz = simdi; tozAt(park.x - Math.cos(park.h) * 0.9, 0.15, park.z + Math.sin(park.h) * 0.9); }
  park.toz.forEach(p => {
    if (p.t >= 1.1) { p.sp.visible = false; return; }
    p.t += dt; const k = p.t / 1.1;
    p.sp.position.set(p.x, p.y + k * 1.2, p.z); p.sp.scale.set(0.8 + k * 2.6, 0.8 + k * 2.6, 1); p.sp.material.opacity = 0.5 * (1 - k);
  });
  // motor sesi
  if (surus.motorSes) {
    const m = surus.motorSes, n = Math.abs(park.v) / 18;
    m.o.frequency.setTargetAtTime(48 + n * 130 + (gaz ? 14 : 0), sesBagl.currentTime, 0.05);
    m.o2.frequency.setTargetAtTime(24 + n * 65, sesBagl.currentTime, 0.05);
    m.f.frequency.setTargetAtTime(300 + n * 1100, sesBagl.currentTime, 0.08);
    m.g.gain.setTargetAtTime(0.045 + 0.08 * n + (gaz ? 0.02 : 0), sesBagl.currentTime, 0.08);
  }
}
// parkura giden kapı (motor odasının doğu duvarında)
const kapiP = { hinge: null, acik: false, aci: 0, z: -9.3, gorunur: false };
(function parkurKapisi() {
  const g = new THREE.Group(); g.position.set(R3.x1 - 0.02, 0, kapiP.z); g.rotation.y = -Math.PI / 2; sahne.add(g);
  const kasa = new THREE.MeshPhongMaterial({ color: 0xb08a4f, specular: 0xfff0c0, shininess: 40, emissive: 0x2a1c06 });
  [-1, 1].forEach(y => { const k = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.45, 0.1), kasa); k.position.set(y * 0.7, 1.2, 0.05); g.add(k); });
  const ust = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 0.1), kasa); ust.position.set(0, 2.4, 0.05); g.add(ust);
  const c = document.createElement('canvas'); c.width = 512; c.height = 1024; const x = c.getContext('2d'), d = new THREE.CanvasTexture(c);
  function ciz() {
    x.fillStyle = '#5a2a16'; x.fillRect(0, 0, 512, 1024);
    x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 6; x.strokeRect(40, 60, 432, 380); x.strokeRect(40, 520, 432, 440);
    const altin = x.createLinearGradient(0, 0, 512, 1024); altin.addColorStop(0, '#fff3cf'); altin.addColorStop(0.5, '#d9a94f'); altin.addColorStop(1, '#f7e2a6');
    x.strokeStyle = altin; x.lineWidth = 7; x.lineCap = 'round';
    // motosiklet çizgisi
    x.beginPath(); x.arc(150, 700, 70, 0, 7); x.stroke(); x.beginPath(); x.arc(362, 700, 70, 0, 7); x.stroke();
    x.beginPath(); x.moveTo(150, 700); x.lineTo(230, 600); x.lineTo(310, 610); x.lineTo(362, 700); x.moveTo(230, 600); x.lineTo(260, 700); x.lineTo(310, 610); x.moveTo(310, 610); x.lineTo(335, 550); x.lineTo(375, 550); x.stroke();
    x.fillStyle = altin; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '110px "Great Vibes", cursive'; x.fillText('Parkur', 256, 240);
    d.needsUpdate = true;
  }
  ciz();
  if (document.fonts && document.fonts.load) document.fonts.load('100px "Great Vibes"', 'Parkur').then(ciz).catch(() => {});
  const hinge = new THREE.Group(); hinge.position.set(-0.65, 0, 0.06); g.add(hinge); kapiP.hinge = hinge;
  const kanat = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 2.35), new THREE.MeshBasicMaterial({ map: d, color: 0xcfcfcf, fog: false, side: THREE.DoubleSide })); kanat.position.set(0.65, 1.175, 0); hinge.add(kanat);
  // üstte yönerge yazısı
  const yc = document.createElement('canvas'); yc.width = 1536; yc.height = 224; const yx = yc.getContext('2d'), yd = new THREE.CanvasTexture(yc);
  function yaz() {
    yx.clearRect(0, 0, 1536, 224); yx.textAlign = 'center'; yx.textBaseline = 'middle'; yx.font = '120px "Great Vibes", cursive';
    const gr = yx.createLinearGradient(0, 0, 1536, 0); gr.addColorStop(0, '#fff3cf'); gr.addColorStop(0.5, '#d9a94f'); gr.addColorStop(1, '#f7e2a6');
    yx.shadowColor = 'rgba(0,0,0,.6)'; yx.shadowBlur = 10; yx.fillStyle = gr; yx.fillText('Motor sürmek ister misin?', 768, 112); yd.needsUpdate = true;
  }
  yaz(); if (document.fonts && document.fonts.load) document.fonts.load('100px "Great Vibes"', 'Motor sürmek ister misin').then(yaz).catch(() => {});
  const yazi = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4 * 224 / 1536), new THREE.MeshBasicMaterial({ map: yd, transparent: true, depthWrite: false, fog: false }));
  yazi.position.set(0, 2.85, 0.05); g.add(yazi);
})();
function kapiPGuncelle(dt) {
  const dx = R3.x1 - kon.x, dz = kapiP.z - kon.z, uz = Math.hypot(dx, dz);
  const bak = (-Math.sin(kon.yaw) * dx - Math.cos(kon.yaw) * dz) / (uz || 1);
  const goster = K3.acik && !park.aktif && !kapiP.acik && uz < 3.6 && bak > (kapiP.gorunur ? 0.2 : 0.45) && kon.x > 8;
  if (goster !== kapiP.gorunur) { kapiP.gorunur = goster; parkKart.classList.toggle('acik', goster); }
  kapiP.aci += ((kapiP.acik ? -1.9 : 0) - kapiP.aci) * Math.min(1, dt * 2.2);
  kapiP.hinge.rotation.y = kapiP.aci;
}
parkKart.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
  if (kapiP.acik) return;
  kapiP.acik = true; parkKart.classList.remove('acik'); kapiP.gorunur = false;
  gicirti(1.4);
  setTimeout(() => { parkAc(); setTimeout(() => { kapiP.acik = false; }, 1500); }, 1000);
}));


// ---------- 3. oda: teklif kapısı (ikinci odanın yanındaki duvarda) ----------
const SORU4 = {
  metin: '15 Temmuz\'da ne oldu?',
  secenekler: ['Darbe', 'Resmi çıkma teklifi', 'Dinozorlar yok oldu'],
  dogru: 'Resmi çıkma teklifi',
  yanlis: {
    'Darbe': 'O başka bir 15 Temmuz 😄 Bizimkine bak.',
    'Dinozorlar yok oldu': 'O çok daha eskiydi, bizim değil 🦕'
  },
  ipucu: 'İpucu: Bir kalp, bir soru ve bir evet.',
  dogruMesaj: 'Evet! Kapı açılıyor...'
};
const kapiT = { x: R3.x0, z: -9.3, hinge: null, panel: null, acik: KAPILAR_ACIK, aci: KAPILAR_ACIK ? -1.9 : 0, cozuldu: KAPILAR_ACIK, gorunur: false, bitis: 0, yanlis: 0 };
(function teklifKapisi() {
  const g = new THREE.Group(); g.position.set(kapiT.x + 0.02, 0, kapiT.z); g.rotation.y = Math.PI / 2; sahne.add(g);
  const kasa = new THREE.MeshPhongMaterial({ color: 0xb08a4f, specular: 0xfff0c0, shininess: 40, emissive: 0x2a1c06 });
  [-1, 1].forEach(y => { const k = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.45, 0.1), kasa); k.position.set(y * 0.7, 1.2, 0.05); g.add(k); });
  const ust = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 0.1), kasa); ust.position.set(0, 2.4, 0.05); g.add(ust);
  // kapının arkasında görünen parlak panel
  const pc = document.createElement('canvas'); pc.width = 512; pc.height = 1024; const px = pc.getContext('2d'), pd = new THREE.CanvasTexture(pc);
  function panelCiz() {
    const gr = px.createRadialGradient(256, 480, 20, 256, 480, 620); gr.addColorStop(0, '#fff1d6'); gr.addColorStop(0.45, '#f2a6b4'); gr.addColorStop(1, '#6a1e34');
    px.fillStyle = gr; px.fillRect(0, 0, 512, 1024);
    px.fillStyle = '#e0556f'; px.beginPath(); px.moveTo(256, 880); px.bezierCurveTo(60, 740, 150, 550, 256, 660); px.bezierCurveTo(362, 550, 452, 740, 256, 880); px.fill();
    px.fillStyle = '#fff6e4'; px.textAlign = 'center'; px.textBaseline = 'middle'; px.shadowColor = 'rgba(80,10,30,.7)'; px.shadowBlur = 10;
    px.font = '130px "Great Vibes", cursive'; px.fillText('Eymir\'e', 256, 140); px.fillText('hoş geldin', 256, 280);
    pd.needsUpdate = true;
  }
  panelCiz();
  if (document.fonts && document.fonts.load) document.fonts.load('90px "Great Vibes"', 'Eymir 15 Temmuz').then(panelCiz).catch(() => {});
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 2.35), new THREE.MeshBasicMaterial({ map: pd, fog: false })); panel.position.set(0, 1.175, -0.02); panel.visible = false; g.add(panel); kapiT.panel = panel;
  // kapı kanadı
  const c = document.createElement('canvas'); c.width = 512; c.height = 1024; const x = c.getContext('2d'), d = new THREE.CanvasTexture(c);
  function ciz() {
    x.fillStyle = '#5a2a16'; x.fillRect(0, 0, 512, 1024);
    x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 6; x.strokeRect(40, 60, 432, 380); x.strokeRect(40, 520, 432, 440);
    const altin = x.createLinearGradient(0, 0, 512, 1024); altin.addColorStop(0, '#fff3cf'); altin.addColorStop(0.5, '#d9a94f'); altin.addColorStop(1, '#f7e2a6');
    x.fillStyle = altin; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = '120px "Great Vibes", cursive'; x.fillText('15', 256, 190); x.fillText('Temmuz', 256, 320);
    x.font = '260px serif'; x.fillText('♥', 256, 740);
    d.needsUpdate = true;
  }
  ciz();
  if (document.fonts && document.fonts.load) document.fonts.load('100px "Great Vibes"', '15 Temmuz').then(ciz).catch(() => {});
  const hinge = new THREE.Group(); hinge.position.set(-0.65, 0, 0.06); g.add(hinge); kapiT.hinge = hinge;
  const kanat = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 2.35), new THREE.MeshBasicMaterial({ map: d, color: 0xcfcfcf, fog: false, side: THREE.DoubleSide })); kanat.position.set(0.65, 1.175, 0); hinge.add(kanat);
})();
const soruT = document.createElement('div'); soruT.id = 'soru2';
const soruTBaslik = document.createElement('div'); soruTBaslik.id = 'soru2Baslik'; soruTBaslik.textContent = SORU4.metin;
const soruTSec = document.createElement('div'); soruTSec.id = 'soru2Sec';
const soruTMesaj = document.createElement('div'); soruTMesaj.id = 'soru2Mesaj';
soruT.append(soruTBaslik, soruTSec, soruTMesaj); document.body.appendChild(soruT);
if (KAPILAR_ACIK) kapiT.panel.visible = true;
SORU4.secenekler.forEach(sc => {
  const b = document.createElement('button'); b.textContent = sc;
  b.addEventListener('click', () => {
    if (kapiT.cozuldu) return;
    if (sc === SORU4.dogru) {
      kapiT.cozuldu = true; kapiT.acik = true; kapiT.panel.visible = true;
      soruTMesaj.textContent = SORU4.dogruMesaj; soruTMesaj.className = 'dogru'; soruTSec.style.display = 'none';
      kalpPatlat(); gicirti(1.6); kapiT.bitis = performance.now() + 5000;
    } else {
      kapiT.yanlis++;
      soruTMesaj.textContent = (SORU4.yanlis[sc] || 'Bir daha dene.') + (kapiT.yanlis >= 2 ? ' ' + SORU4.ipucu : '');
      soruTMesaj.className = 'yanlis'; b.classList.add('sal'); b.classList.add('solgun');
      setTimeout(() => b.classList.remove('sal'), 400);
    }
  });
  soruTSec.appendChild(b);
});
function kapiTGuncelle(dt) {
  const dx = kapiT.x - kon.x, dz = kapiT.z - kon.z, uz = Math.hypot(dx, dz);
  const bak = (-Math.sin(kon.yaw) * dx - Math.cos(kon.yaw) * dz) / (uz || 1);
  let goster = !park.aktif && uz < 3.4 && bak > (kapiT.gorunur ? 0.2 : 0.45) && kon.z > HOL3_Z1 && kon.x > 2.5 && kon.x < 9;
  if (kapiT.cozuldu && performance.now() > kapiT.bitis) goster = false;
  if (goster !== kapiT.gorunur) { kapiT.gorunur = goster; soruT.classList.toggle('acik', goster); }
  kapiT.aci += ((kapiT.acik ? -1.9 : 0) - kapiT.aci) * Math.min(1, dt * 2.2);
  kapiT.hinge.rotation.y = kapiT.aci;
}

// ---------- Kontrol ----------
const kon = { donuk: 0, vx: 0, vz: 0, oto: null, bakToplam: 0, dragX: 0, dragY: 0, yaw: 0, pitch: -0.22, x: 0, z: 1.2, ileri: 0, yan: 0, joyX: 0, joyY: 0, tus: {} };
let basladi = false;

window.addEventListener('keydown', e => { kon.tus[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', e => { kon.tus[e.key.toLowerCase()] = false; });

const joy = document.getElementById('joy'), joyTop = document.getElementById('joyTop');
let joyId = null, bakId = null, sonX = 0, sonY = 0, sonBakZaman = 0;

joy.addEventListener('pointerdown', e => {
  joyId = e.pointerId; joy.setPointerCapture(e.pointerId); joyGuncelle(e); e.preventDefault();
});
joy.addEventListener('pointermove', e => { if (e.pointerId === joyId) joyGuncelle(e); });
function joyBitir(e) {
  if (e.pointerId !== joyId) return;
  joyId = null; kon.joyX = 0; kon.joyY = 0; joyTop.style.transform = 'translate(0,0)';
}
joy.addEventListener('pointerup', joyBitir);
joy.addEventListener('pointercancel', joyBitir);
function joyGuncelle(e) {
  const r = joy.getBoundingClientRect();
  let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
  const mx = r.width / 2 - 10, d = Math.hypot(dx, dy);
  if (d > mx) { dx = dx / d * mx; dy = dy / d * mx; }
  joyTop.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
  kon.joyX = dx / mx; kon.joyY = -dy / mx;
}

canvas.addEventListener('pointerdown', e => {
  if (bakId !== null) return;
  bakId = e.pointerId; sonX = e.clientX; sonY = e.clientY; canvas.setPointerCapture(e.pointerId); kon.oto = null;
  document.getElementById('ipucu').classList.add('gizli');
});
canvas.addEventListener('pointermove', e => {
  if (e.pointerId !== bakId) return;
  if (ey.incele) { ey.dSpin += (e.clientX - sonX) * 0.012; ey.dTilt = sinir(ey.dTilt + (e.clientY - sonY) * 0.006, -0.6, 0.6); sonX = e.clientX; sonY = e.clientY; return; }
  kon.bakToplam += Math.abs(e.clientX - sonX) + Math.abs(e.clientY - sonY); sonBakZaman = performance.now();
  kon.dragX += e.clientX - sonX; kon.dragY += e.clientY - sonY;
  kon.yaw -= (e.clientX - sonX) * 0.005;
  kon.pitch -= (e.clientY - sonY) * 0.004;
  kon.pitch = Math.max(-0.85, Math.min(yo.aktif ? 1.3 : 0.45, kon.pitch));
  sonX = e.clientX; sonY = e.clientY;
});
function bakBitir(e) { if (e.pointerId === bakId) bakId = null; }
canvas.addEventListener('pointerup', bakBitir);
canvas.addEventListener('pointercancel', bakBitir);

// ---------- Döngü ----------
const yaziKutu = document.getElementById('yazi');
let ilkGiris = false;
let kapiAci = KAPILAR_ACIK ? Math.PI * 0.5 : 0, kapiAcik = KAPILAR_ACIK, odadaMi = false, yaziAcik = false;
const sinir = (v, a, b) => Math.max(a, Math.min(b, v));
const yumusak = (a, b, v) => { const t = sinir((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
let onceki = performance.now();

// ---------- Eymir: gökyüzü, göl, bisiklet turu ----------
const EX = 3000, EZ = -3000;                       // arena odalardan çok uzakta
const EY_GOL = 14.5, EY_YOL0 = 16.5, EY_YOL1 = 20.5, EY_DUVAR = 27;
const EY_AGAC = [];
const EY_KAPI_TH = 6.5 * Math.PI * 2 / 7;   // sonraki odanın kapısı: turun sonunda, son çerçeve ile giriş arasında
const EY_FOTO = [   // fotoğraflar sırayla duvara dizilir; benzerler yan yana gelmesin diye dönüşümlü
  { dosya: 'foto/eymir-1.jpg', yazi: '' }, { dosya: 'foto/eymir-2.jpg', yazi: '' },
  { dosya: 'foto/eymir-7.jpg', yazi: '' }, { dosya: 'foto/eymir-3.jpg', yazi: '' },
  { dosya: 'foto/eymir-8.jpg', yazi: '' }, { dosya: 'foto/eymir-5.jpg', yazi: '' }
];
const ey = { aktif: false, hazir: false, grup: null, kapali: [], eskiSis: null, eskiArka: null, bisik: false, bisikNo: -1, bisikler: [], foto: [],
  gece: 0, geceHedef: 0, iskeleSure: 0, iskeleKalp: false, bulutlar: [], gun: null, hemi: null, gok: null, yildiz: null, su: null, suPar: null,
  yaziT: 0, kuslar: [], kusSon: 0, sektor: new Array(16).fill(false), sektorSay: 0, kapiD: null, dKutu: false, alevler: [], mumParla: [], mumYer: [], mumIsik: [], yaprakSis: null, hd: null, sandik: null, durum: 'yok', dT: 0, kilit: false, incele: false, flip: false, spin: 0, dSpin: 0, dTilt: 0, finalYazi: false, finalBitis: 0, fener: null, kuncul: null, kunKonum: null, kunTemel: null, gunes: null, gunesParla: null, lamba: [], sonGece: -1 };
const eyBtn = document.getElementById('bisikBtn');
function eyTube(a, b, r, mat) {
  const d = new THREE.Vector3().subVectors(b, a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 6), mat);
  m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m;
}
function eyBisiklet(renk) {   // ön tarafı -z'ye bakar
  const g = new THREE.Group();
  const cer = new THREE.MeshLambertMaterial({ color: renk }), koyu = new THREE.MeshLambertMaterial({ color: 0x23242a }), metal = new THREE.MeshLambertMaterial({ color: 0xcfcfd6 });
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const tekerler = [];
  [-0.55, 0.55].forEach(z => {
    const w = new THREE.Group(); w.position.set(0, 0.34, z);
    const lastik = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.03, 6, 20), koyu); lastik.rotation.y = Math.PI / 2; w.add(lastik);
    for (let i = 0; i < 3; i++) { const jant = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.64, 0.01), metal); jant.rotation.x = i * Math.PI / 3; w.add(jant); }
    g.add(w); tekerler.push(w);
  });
  [[V(0, 0.34, 0.55), V(0, 0.78, 0.38)], [V(0, 0.78, 0.38), V(0, 0.9, -0.4)], [V(0, 0.9, -0.4), V(0, 0.34, -0.55)], [V(0, 0.34, 0.55), V(0, 0.3, 0.08)], [V(0, 0.3, 0.08), V(0, 0.9, -0.4)], [V(0, 0.3, 0.08), V(0, 0.78, 0.38)]]
    .forEach(p => g.add(eyTube(p[0], p[1], 0.022, cer)));
  const sele = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.3), koyu); sele.position.set(0, 0.82, 0.4); g.add(sele);
  const gidon = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.025, 0.025), metal); gidon.position.set(0, 0.97, -0.42); g.add(gidon);
  const zil = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), metal); zil.position.set(0.2, 1.0, -0.42); g.add(zil);
  // sepet + çiçekler
  const sepet = new THREE.MeshLambertMaterial({ color: 0xb38a55 });
  const sb = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.16, 0.24), sepet); sb.position.set(0, 0.86, -0.7); g.add(sb);
  [0xff8fb1, 0xfff0c8, 0xffc857, 0xff6f91].forEach((c, i) => { const f = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 5), new THREE.MeshLambertMaterial({ color: c })); f.position.set(-0.11 + i * 0.075, 0.97 + (i % 2) * 0.02, -0.7); g.add(f); });
  g.userData.tekerler = tekerler; g.userData.cer = cer; g.userData.renk = new THREE.Color(renk);
  return g;
}
function eyKur() {
  if (ey.hazir) return; ey.hazir = true;
  const g = new THREE.Group(); g.visible = false; sahne.add(g); ey.grup = g;
  let sd = 11; const rnd = () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; };
  const dummy = new THREE.Object3D();
  const tuval = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  // gökyüzü kubbesi
  const gc = tuval(8, 256), gx = gc.getContext('2d'), gr = gx.createLinearGradient(0, 0, 0, 256);
  [[0, '#2f4684'], [0.22, '#6b73ad'], [0.38, '#d98a9a'], [0.47, '#ffb070'], [0.5, '#ffd9a4'], [0.52, '#c98a73'], [0.6, '#6a5a78'], [1, '#2a2438']].forEach(s => gr.addColorStop(s[0], s[1]));
  gx.fillStyle = gr; gx.fillRect(0, 0, 8, 256);
  ey.gok = new THREE.Mesh(new THREE.SphereGeometry(1500, 24, 14), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(gc), side: THREE.BackSide, fog: false, depthWrite: false }));
  ey.gok.position.set(EX, 0, EZ); ey.gok.renderOrder = -2; g.add(ey.gok);
  // güneş
  const sc = tuval(256, 256), sx = sc.getContext('2d'), sg = sx.createRadialGradient(128, 128, 0, 128, 128, 128);
  sg.addColorStop(0, 'rgba(255,250,225,1)'); sg.addColorStop(0.16, 'rgba(255,236,190,1)'); sg.addColorStop(0.2, 'rgba(255,200,130,.65)'); sg.addColorStop(0.5, 'rgba(255,150,100,.22)'); sg.addColorStop(1, 'rgba(255,140,100,0)');
  sx.fillStyle = sg; sx.fillRect(0, 0, 256, 256);
  const gunes = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(sc), fog: false, depthWrite: false, transparent: true }));
  gunes.scale.set(700, 700, 1); gunes.position.set(EX - 330, 80, EZ - 1000); g.add(gunes); ey.gunes = gunes;
  // bulutlar
  const bc = tuval(256, 128), bx = bc.getContext('2d');
  [[70, 78, 46], [118, 60, 54], [170, 72, 50], [210, 84, 34], [120, 90, 46]].forEach(b => { const rg = bx.createRadialGradient(b[0], b[1], 0, b[0], b[1], b[2]); rg.addColorStop(0, 'rgba(255,255,255,.95)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); bx.fillStyle = rg; bx.fillRect(0, 0, 256, 128); });
  const bdoku = new THREE.CanvasTexture(bc);
  for (let i = 0; i < 16; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: bdoku, color: 0xffd9d0, fog: false, depthWrite: false, transparent: true, opacity: 0.88 }));
    const a = rnd() * Math.PI * 2, r = 450 + rnd() * 700, w = 280 + rnd() * 260;
    s.scale.set(w, w * 0.42, 1); s.position.set(EX + Math.cos(a) * r, 140 + rnd() * 160, EZ + Math.sin(a) * r); g.add(s); ey.bulutlar.push(s);
  }
  // Çoban Yıldızı: gece olunca batı ufkunda beliren parlak yıldız
  const yc0 = tuval(256, 256), y0 = yc0.getContext('2d'), yg0 = y0.createRadialGradient(128, 128, 0, 128, 128, 128);
  yg0.addColorStop(0, 'rgba(255,255,245,1)'); yg0.addColorStop(0.08, 'rgba(255,245,210,.95)'); yg0.addColorStop(0.25, 'rgba(255,225,160,.35)'); yg0.addColorStop(1, 'rgba(255,220,150,0)');
  y0.fillStyle = yg0; y0.fillRect(0, 0, 256, 256);
  [[0, 1], [1, 0]].forEach(d => { const ray = y0.createLinearGradient(128 - d[0] * 128, 128 - d[1] * 128, 128 + d[0] * 128, 128 + d[1] * 128); ray.addColorStop(0, 'rgba(255,240,200,0)'); ray.addColorStop(0.5, 'rgba(255,250,230,.95)'); ray.addColorStop(1, 'rgba(255,240,200,0)'); y0.fillStyle = ray; y0.fillRect(d[0] ? 0 : 124, d[1] ? 0 : 124, d[0] ? 256 : 8, d[1] ? 256 : 8); });
  ey.cobanY = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(yc0), fog: false, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending, opacity: 0 }));
  ey.cobanY.scale.set(190, 190, 1); ey.cobanY.position.set(EX - 120, 270, EZ - 1000); g.add(ey.cobanY);
  const yz = tuval(512, 96), yzx = yz.getContext('2d'); yzx.textAlign = 'center'; yzx.textBaseline = 'middle';
  const yzd = new THREE.CanvasTexture(yz);
  function cobanYaz() { yzx.clearRect(0, 0, 512, 96); yzx.font = '70px "Great Vibes", cursive'; yzx.shadowColor = 'rgba(0,0,0,.6)'; yzx.shadowBlur = 8; yzx.fillStyle = '#fff3cf'; yzx.fillText('Çoban Yıldızı', 256, 50); yzd.needsUpdate = true; }
  cobanYaz(); if (document.fonts && document.fonts.load) document.fonts.load('60px "Great Vibes"', 'Çoban Yıldızı').then(cobanYaz).catch(() => {});
  ey.cobanYazi = new THREE.Sprite(new THREE.SpriteMaterial({ map: yzd, fog: false, depthWrite: false, transparent: true, opacity: 0 }));
  ey.cobanYazi.scale.set(300, 56, 1); ey.cobanYazi.position.set(EX - 120, 195, EZ - 1000); g.add(ey.cobanYazi);
  // yıldızlar
  const ya = new Float32Array(500 * 3);
  for (let i = 0; i < 500; i++) { const a = rnd() * Math.PI * 2, e = 0.12 + rnd() * 1.4; ya[i * 3] = EX + Math.cos(a) * Math.cos(e) * 1400; ya[i * 3 + 1] = Math.sin(e) * 1400; ya[i * 3 + 2] = EZ + Math.sin(a) * Math.cos(e) * 1400; }
  const yg = new THREE.BufferGeometry(); yg.setAttribute('position', new THREE.BufferAttribute(ya, 3));
  ey.yildiz = new THREE.Points(yg, new THREE.PointsMaterial({ size: 2.4, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false, color: 0xfff4d8 })); g.add(ey.yildiz);
  // zemin
  const cc = tuval(256, 256), cx = cc.getContext('2d'); cx.fillStyle = '#6a8a45'; cx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2600; i++) { cx.fillStyle = ['#759550', '#5c7b3a', '#82a05a', '#678641'][i % 4]; cx.fillRect(rnd() * 256, rnd() * 256, 2 + rnd() * 3, 2 + rnd() * 3); }
  const cd = new THREE.CanvasTexture(cc); cd.wrapS = cd.wrapT = THREE.RepeatWrapping; cd.repeat.set(220, 220);
  const zemin = new THREE.Mesh(new THREE.CircleGeometry(1200, 48), new THREE.MeshLambertMaterial({ map: cd }));
  zemin.rotation.x = -Math.PI / 2; zemin.position.set(EX, 0, EZ); g.add(zemin);
  // uzak tepeler
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2 + rnd() * 0.3, r = 520 + rnd() * 260, s = 110 + rnd() * 120;
    const t = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), new THREE.MeshLambertMaterial({ color: [0x6d7248, 0x5d6a45, 0x7a7650][i % 3] }));
    t.scale.set(s * 1.6, s * 0.38, s); t.position.set(EX + Math.cos(a) * r, 0, EZ + Math.sin(a) * r); t.rotation.y = rnd() * 3; g.add(t);
  }
  // yürüyüş yolu
  const yol = new THREE.Mesh(new THREE.RingGeometry(EY_YOL0, EY_YOL1, 96), new THREE.MeshLambertMaterial({ color: 0xa8855a }));
  yol.rotation.x = -Math.PI / 2; yol.position.set(EX, 0.02, EZ); g.add(yol);
  const kum = new THREE.Mesh(new THREE.RingGeometry(EY_GOL - 0.3, EY_GOL + 1.4, 64), new THREE.MeshLambertMaterial({ color: 0x8c7d57 }));
  kum.rotation.x = -Math.PI / 2; kum.position.set(EX, 0.025, EZ); g.add(kum);
  // göl
  const wc = tuval(256, 256), wx = wc.getContext('2d'), wg = wx.createLinearGradient(0, 0, 0, 256);
  wg.addColorStop(0, '#a9cdf2'); wg.addColorStop(0.45, '#4f95d6'); wg.addColorStop(1, '#1f63b4'); wx.fillStyle = wg; wx.fillRect(0, 0, 256, 256);
  const pg = wx.createLinearGradient(80, 0, 176, 0); pg.addColorStop(0, 'rgba(255,230,180,0)'); pg.addColorStop(0.5, 'rgba(255,240,210,.4)'); pg.addColorStop(1, 'rgba(255,230,180,0)');
  wx.fillStyle = pg; wx.fillRect(80, 0, 96, 150);
  ey.su = new THREE.Mesh(new THREE.CircleGeometry(EY_GOL, 64), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(wc) }));
  ey.su.rotation.x = -Math.PI / 2; ey.su.position.set(EX, 0.04, EZ); g.add(ey.su);
  const pc = tuval(256, 256), px = pc.getContext('2d');
  for (let i = 0; i < 260; i++) { px.fillStyle = 'rgba(255,255,255,' + (0.25 + rnd() * 0.6) + ')'; px.fillRect(rnd() * 256, rnd() * 256, 1 + rnd() * 5, 1 + rnd() * 1.2); }
  const pdk = new THREE.CanvasTexture(pc); pdk.wrapS = pdk.wrapT = THREE.RepeatWrapping; pdk.repeat.set(4, 4);
  ey.suPar = new THREE.Mesh(new THREE.CircleGeometry(EY_GOL - 0.1, 64), new THREE.MeshBasicMaterial({ map: pdk, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }));
  ey.suPar.rotation.x = -Math.PI / 2; ey.suPar.position.set(EX, 0.05, EZ); g.add(ey.suPar);
  // kamışlar
  const kam = new THREE.InstancedMesh(new THREE.ConeGeometry(0.05, 1.3, 4), new THREE.MeshLambertMaterial({ color: 0x8a9440 }), 190);
  for (let i = 0; i < 190; i++) { const a = rnd() * Math.PI * 2, r = EY_GOL + 0.1 + rnd() * 1.1, s = 0.6 + rnd() * 0.9; dummy.position.set(EX + Math.cos(a) * r, 0.65 * s, EZ + Math.sin(a) * r); dummy.rotation.set((rnd() - 0.5) * 0.25, 0, (rnd() - 0.5) * 0.25); dummy.scale.set(1, s, 1); dummy.updateMatrix(); kam.setMatrixAt(i, dummy.matrix); }
  g.add(kam);
  // çiçekler
  const cic = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.09, 0), new THREE.MeshLambertMaterial({ color: 0xffffff }), 280);
  const cr = [0xff8fb1, 0xfff0c8, 0xffc857, 0xffffff, 0xd9a7ff];
  for (let i = 0; i < 280; i++) { const a = rnd() * Math.PI * 2, r = rnd() < 0.5 ? 20.9 + rnd() * 4.6 : 15.2 + rnd() * 1.1; dummy.position.set(EX + Math.cos(a) * r, 0.1, EZ + Math.sin(a) * r); dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(0.7 + rnd() * 0.8); dummy.updateMatrix(); cic.setMatrixAt(i, dummy.matrix); cic.setColorAt(i, new THREE.Color(cr[i % cr.length])); }
  g.add(cic);
  // ağaçlar (duvarın dışında)
  const gövde = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.25, 0.35, 2, 6), new THREE.MeshLambertMaterial({ color: 0x5a4331 }), 260);
  const yaprak = new THREE.InstancedMesh(new THREE.ConeGeometry(2.3, 6.5, 7), new THREE.MeshLambertMaterial({ color: 0xffffff }), 260);
  for (let i = 0; i < 260; i++) {
    const a = rnd() * Math.PI * 2, r = 31 + rnd() * 75, s = 0.9 + rnd() * 1.2, x = EX + Math.cos(a) * r, z = EZ + Math.sin(a) * r;
    dummy.position.set(x, s, z); dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(s); dummy.updateMatrix(); gövde.setMatrixAt(i, dummy.matrix);
    dummy.position.set(x, 5 * s, z); dummy.updateMatrix(); yaprak.setMatrixAt(i, dummy.matrix);
    yaprak.setColorAt(i, new THREE.Color([0x3f5f2e, 0x4c6b34, 0x587a38, 0x6b8140][i % 4]));
  }
  g.add(gövde); g.add(yaprak);
  // bahçenin içinde, çerçevelerin arasında küçük ağaçlar (çarpışmalı)
  const IN = 34, igov = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.2, 0.28, 2, 6), new THREE.MeshLambertMaterial({ color: 0x5a4331 }), IN);
  const iyap = new THREE.InstancedMesh(new THREE.ConeGeometry(2.1, 5.2, 7), new THREE.MeshLambertMaterial({ color: 0xffffff }), IN);
  const fa = []; for (let i = 0; i < EY_FOTO.length; i++) fa.push((i + 1) * Math.PI * 2 / (EY_FOTO.length + 1));
  const farkA = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
  let ik = 0, deneme = 0;
  while (ik < IN && deneme++ < 600) {
    const th = rnd() * Math.PI * 2, r = 22.2 + rnd() * 2.6;
    if (farkA(th, 0) < 0.45 || farkA(th, Math.PI / 2) < 0.3 || (th > 4.7 && th < 6.15) || fa.some(a => farkA(th, a) < 0.2)) continue;
    const sc = 0.5 + rnd() * 0.35, x = EX + Math.sin(th) * r, z = EZ + Math.cos(th) * r;
    dummy.position.set(x, sc, z); dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(sc); dummy.updateMatrix(); igov.setMatrixAt(ik, dummy.matrix);
    dummy.position.set(x, 4.6 * sc, z); dummy.updateMatrix(); iyap.setMatrixAt(ik, dummy.matrix);
    iyap.setColorAt(ik, new THREE.Color([0x4c6b34, 0x587a38, 0x6b8140, 0x3f5f2e][ik % 4]));
    EY_AGAC.push({ x, z, r: 0.45 }); ik++;
  }
  igov.count = ik; iyap.count = ik; g.add(igov); g.add(iyap);
  // bahçe duvarı
  const dc = tuval(256, 128), dx = dc.getContext('2d'); dx.fillStyle = '#b79a88'; dx.fillRect(0, 0, 256, 128);
  for (let y = 0; y < 128; y += 16) for (let x = (y / 16) % 2 ? 0 : 16; x < 256; x += 32) { dx.fillStyle = ['#c3a795', '#aa8d7c', '#b99f8c'][(x + y) % 3]; dx.fillRect(x + 1, y + 1, 30, 14); }
  const dd = new THREE.CanvasTexture(dc); dd.wrapS = dd.wrapT = THREE.RepeatWrapping; dd.repeat.set(36, 1.2);
  const duvar = new THREE.Mesh(new THREE.CylinderGeometry(EY_DUVAR + 0.15, EY_DUVAR + 0.15, 3.2, 96, 1, true), new THREE.MeshLambertMaterial({ map: dd, side: THREE.DoubleSide }));
  duvar.position.set(EX, 1.6, EZ); g.add(duvar);
  const ust = new THREE.Mesh(new THREE.RingGeometry(EY_DUVAR - 0.15, EY_DUVAR + 0.5, 96), new THREE.MeshLambertMaterial({ color: 0x8c6f60, side: THREE.DoubleSide }));
  ust.rotation.x = -Math.PI / 2; ust.position.set(EX, 3.2, EZ); g.add(ust);
  // fotoğraf çerçeveleri: duvarda, girişin iki yanından başlayıp tur boyunca sıralı
  const FW = 1.9, FH = 1.5, FY = 1.85;
  const lc = tuval(128, 128), lx = lc.getContext('2d'), lg = lx.createRadialGradient(64, 64, 0, 64, 64, 64);
  lg.addColorStop(0, 'rgba(255,214,150,.9)'); lg.addColorStop(1, 'rgba(255,200,120,0)'); lx.fillStyle = lg; lx.fillRect(0, 0, 128, 128);
  const ldoku = new THREE.CanvasTexture(lc);
  EY_FOTO.forEach((f, i) => {
    const th = (i + 1) * Math.PI * 2 / (EY_FOTO.length + 1), R = EY_DUVAR - 0.05;
    const px0 = EX + Math.sin(th) * R, pz0 = EZ + Math.cos(th) * R, rot = th + Math.PI;
    const ic = Math.sin(th), ic2 = Math.cos(th);   // dışa doğru birim vektör
    const cer = new THREE.Mesh(new THREE.BoxGeometry(FW + 0.22, FH + 0.22, 0.08), new THREE.MeshLambertMaterial({ color: 0xe6c88c }));
    cer.position.set(px0 + ic * 0.04, FY, pz0 + ic2 * 0.04); cer.rotation.y = rot; g.add(cer);
    const yc = tuval(512, 410), yx = yc.getContext('2d'), yg2 = yx.createLinearGradient(0, 0, 0, 410);
    yg2.addColorStop(0, '#f2b28a'); yg2.addColorStop(1, '#9a6a8a'); yx.fillStyle = yg2; yx.fillRect(0, 0, 512, 410);
    yx.fillStyle = 'rgba(255,240,225,.8)'; yx.font = '200px serif'; yx.textAlign = 'center'; yx.textBaseline = 'middle'; yx.fillText('♥', 256, 205);
    const net = new THREE.Mesh(new THREE.PlaneGeometry(FW, FH), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(yc), color: 0x555555, fog: false }));
    net.position.set(px0 - ic * 0.005, FY, pz0 - ic2 * 0.005); net.rotation.y = rot; g.add(net);
    const kayit = { net, bul: { material: { color: new THREE.Color(), opacity: 1 } }, px: px0 - ic * 1.5, pz: pz0 - ic2 * 1.5 };
    ey.foto.push(kayit);
    // altyazı
    const ac = tuval(512, 96), ax = ac.getContext('2d'); ax.textAlign = 'center'; ax.textBaseline = 'middle';
    function altYaz() { ax.clearRect(0, 0, 512, 96); ax.font = '64px "Great Vibes", cursive'; ax.shadowColor = 'rgba(0,0,0,.6)'; ax.shadowBlur = 8; ax.fillStyle = '#fff3cf'; ax.fillText(f.yazi, 256, 50); adoku.needsUpdate = true; }
    const adoku = new THREE.CanvasTexture(ac); altYaz();
    if (document.fonts && document.fonts.load) document.fonts.load('60px "Great Vibes"', f.yazi).then(altYaz).catch(() => {});
    const alt = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.36), new THREE.MeshBasicMaterial({ map: adoku, transparent: true, depthWrite: false, fog: false }));
    alt.visible = !!f.yazi; alt.position.set(px0 - ic * 0.01, FY - FH / 2 - 0.38, pz0 - ic2 * 0.01); alt.rotation.y = rot; g.add(alt);
    // fener ışığı
    const lamba = new THREE.Sprite(new THREE.SpriteMaterial({ map: ldoku, fog: false, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending, opacity: 0.4 }));
    lamba.scale.set(2.2, 2.2, 1); lamba.position.set(px0 - ic * 0.4, FY + FH / 2 + 0.55, pz0 - ic2 * 0.4); g.add(lamba); ey.lamba.push(lamba);
    if (f.dosya) new THREE.TextureLoader().load(f.dosya, tex => {
      tex.anisotropy = 4;
      const oran = tex.image.width / tex.image.height, gen = Math.min(2.6, FH * oran);
      net.material.map = tex; net.material.needsUpdate = true; net.scale.x = gen / FW; cer.scale.x = (gen + 0.22) / (FW + 0.22);
      const bcv = tuval(18, Math.max(8, Math.round(18 / oran))); bcv.getContext('2d').drawImage(tex.image, 0, 0, bcv.width, bcv.height);
      const bt = new THREE.CanvasTexture(bcv); bt.magFilter = THREE.LinearFilter; bt.minFilter = THREE.LinearFilter;
      const bul = new THREE.Mesh(new THREE.PlaneGeometry(gen, FH), new THREE.MeshBasicMaterial({ map: bt, color: 0x333333, transparent: true, fog: false }));
      bul.position.set(px0 - ic * 0.004, FY, pz0 - ic2 * 0.004); bul.rotation.y = rot; g.add(bul); kayit.bul = bul;
    }, undefined, () => {});
  });
  // sonraki odaya kapı: tam tur atınca açılır
  { const R = EY_DUVAR - 0.05, kd = { th: EY_KAPI_TH, x: EX + Math.sin(EY_KAPI_TH) * R, z: EZ + Math.cos(EY_KAPI_TH) * R, acik: false, aci: 0, hinge: null, panel: null, kilit: null };
    ey.kapiD = kd;
    const kg = new THREE.Group(); kg.position.set(kd.x, 0, kd.z); kg.rotation.y = EY_KAPI_TH + Math.PI; g.add(kg);
    const kasa = new THREE.MeshLambertMaterial({ color: 0xb08a4f, emissive: 0x2a1c06 });
    [-1, 1].forEach(y => { const k = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.5, 0.12), kasa); k.position.set(y * 0.72, 1.2, 0.05); kg.add(k); });
    const ust = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.12, 0.12), kasa); ust.position.set(0, 2.45, 0.05); kg.add(ust);
    const pk = tuval(512, 1024), pkx = pk.getContext('2d'), pkg = pkx.createRadialGradient(256, 520, 10, 256, 520, 560);
    pkg.addColorStop(0, '#fff6dc'); pkg.addColorStop(0.5, '#ffc98a'); pkg.addColorStop(1, '#c7607a'); pkx.fillStyle = pkg; pkx.fillRect(0, 0, 512, 1024);
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 2.4), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(pk), fog: false })); panel.position.set(0, 1.2, -0.03); panel.visible = false; kg.add(panel); kd.panel = panel;
    const dk = tuval(512, 1024), dx2 = dk.getContext('2d'), ddk = new THREE.CanvasTexture(dk);
    function kapiCiz() {
      dx2.fillStyle = '#4e2a1c'; dx2.fillRect(0, 0, 512, 1024); dx2.strokeStyle = 'rgba(0,0,0,.35)'; dx2.lineWidth = 6; dx2.strokeRect(40, 60, 432, 380); dx2.strokeRect(40, 520, 432, 440);
      const al = dx2.createLinearGradient(0, 0, 512, 1024); al.addColorStop(0, '#fff3cf'); al.addColorStop(0.5, '#d9a94f'); al.addColorStop(1, '#f7e2a6');
      dx2.fillStyle = al; dx2.textAlign = 'center'; dx2.textBaseline = 'middle'; dx2.font = '110px "Great Vibes", cursive'; dx2.fillText('Sırada', 256, 190); dx2.fillText('ne var?', 256, 320);
      dx2.font = '240px serif'; dx2.fillText('♥', 256, 740); ddk.needsUpdate = true;
    }
    kapiCiz(); if (document.fonts && document.fonts.load) document.fonts.load('100px "Great Vibes"', 'Sırada ne var').then(kapiCiz).catch(() => {});
    const hg = new THREE.Group(); hg.position.set(-0.65, 0, 0.06); kg.add(hg); kd.hinge = hg;
    const kanat = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 2.35), new THREE.MeshBasicMaterial({ map: ddk, color: 0xcfcfcf, fog: false, side: THREE.DoubleSide })); kanat.position.set(0.65, 1.175, 0); hg.add(kanat);
    // asma kilit (açılınca kalkar)
    const lk = tuval(128, 160), lkx = lk.getContext('2d'); lkx.strokeStyle = '#e8c36a'; lkx.lineWidth = 14; lkx.beginPath(); lkx.arc(64, 62, 30, Math.PI, 0); lkx.stroke();
    lkx.fillStyle = '#e8c36a'; lkx.fillRect(22, 62, 84, 70); lkx.fillStyle = '#4e2a1c'; lkx.beginPath(); lkx.arc(64, 92, 9, 0, 7); lkx.fill(); lkx.fillRect(60, 96, 8, 20);
    const kilit = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.4), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(lk), transparent: true, fog: false })); kilit.position.set(0.6, 1.1, 0.04); kilit.rotation.y = 0; hg.add(kilit); kd.kilit = kilit; }
  // kuşlar
  { const kmat = new THREE.MeshBasicMaterial({ color: 0x2c2a36, side: THREE.DoubleSide, fog: false });
    const kanatGeo = new THREE.BufferGeometry(); kanatGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0.12, 1.1, 0.12, 0.28, 0.95, 0, -0.3]), 3)); kanatGeo.computeVertexNormals();
    for (let i = 0; i < 9; i++) {
      const kus = new THREE.Group(), sol = new THREE.Mesh(kanatGeo, kmat), sag = new THREE.Mesh(kanatGeo, kmat); sag.scale.x = -1;
      kus.add(sol); kus.add(sag); kus.scale.setScalar(0.9 + rnd() * 0.5); g.add(kus);
      ey.kuslar.push({ g: kus, sol, sag, r: 5 + rnd() * 20, a: rnd() * 6.28, w: (0.18 + rnd() * 0.18) * (i % 2 ? 1 : -1), h: 9 + rnd() * 9, f: rnd() * 6 });
    } }
  // iskele (doğu kıyısından göle)
  const tc = tuval(64, 256), tx = tc.getContext('2d'); tx.fillStyle = '#8a6a45'; tx.fillRect(0, 0, 64, 256);
  for (let y = 0; y < 256; y += 32) { tx.fillStyle = ['#9a7850', '#85653f', '#a08058'][(y / 32) % 3]; tx.fillRect(2, y + 2, 60, 28); }
  const td = new THREE.CanvasTexture(tc); td.wrapS = td.wrapT = THREE.RepeatWrapping; td.repeat.set(1, 3);
  const iskele = new THREE.Mesh(new THREE.BoxGeometry(10.6, 0.08, 1.8), new THREE.MeshLambertMaterial({ map: td }));
  iskele.position.set(EX + 12.7, 0.08, EZ); g.add(iskele);
  const direk = new THREE.MeshLambertMaterial({ color: 0x5f472d });
  for (let i = 0; i < 6; i++) [-0.85, 0.85].forEach(z => { const d = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 1.1, 6), direk); d.position.set(EX + 7.8 + i * 1.9, 0.5, EZ + z); g.add(d); });
  [-0.85, 0.85].forEach(z => { const r = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.05, 0.05), direk); r.position.set(EX + 12.6, 0.95, EZ + z); g.add(r); });
  // iskelenin ucunda fener
  { const dir0 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.3, 6), new THREE.MeshLambertMaterial({ color: 0x5f472d })); dir0.position.set(EX + 7.8, 0.65, EZ + 0.85); g.add(dir0);
    const fn = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffe2a0 })); fn.position.set(EX + 7.8, 1.4, EZ + 0.85); g.add(fn);
    const fp = new THREE.Sprite(new THREE.SpriteMaterial({ map: ldoku, fog: false, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending, opacity: 0.7 })); fp.scale.set(2.4, 2.4, 1); fp.position.copy(fn.position); g.add(fp); ey.fener = fp; }
  // bisikletler
  [[-2.3, 0xe8749a], [2.3, 0x2a3a78]].forEach((b, i) => {
    const bs = eyBisiklet(b[1]); bs.position.set(EX + b[0], 0, EZ + 17.8); bs.rotation.y = i ? 0.3 : -0.3; g.add(bs); ey.bisikler.push(bs);
    const pr = new THREE.Sprite(new THREE.SpriteMaterial({ map: ldoku, fog: false, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending, opacity: 0.6 }));
    pr.scale.set(3, 3, 1); pr.position.set(EX + b[0], 0.6, EZ + 17.8); g.add(pr); bs.userData.parla = pr;
  });
  // ateş böcekleri
  const KN = 70; ey.kunTemel = new Float32Array(KN * 3); ey.kunKonum = new Float32Array(KN * 3);
  for (let i = 0; i < KN; i++) { const a = rnd() * Math.PI * 2, r = 16 + rnd() * 10; ey.kunTemel[i * 3] = EX + Math.cos(a) * r; ey.kunTemel[i * 3 + 1] = 0.4 + rnd() * 2; ey.kunTemel[i * 3 + 2] = EZ + Math.sin(a) * r; }
  ey.kunKonum.set(ey.kunTemel);
  const kg = new THREE.BufferGeometry(); kg.setAttribute('position', new THREE.BufferAttribute(ey.kunKonum, 3));
  ey.kuncul = new THREE.Points(kg, new THREE.PointsMaterial({ size: 5, sizeAttenuation: false, color: 0xffe9a0, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); g.add(ey.kuncul);
  // ---- Hediye: cam fanus içinde pembe laleler (15 Temmuz) ----
  { const hr = new THREE.Group(); hr.visible = false; g.add(hr);
    const tilt = new THREE.Group(); hr.add(tilt); const spin = new THREE.Group(); tilt.add(spin);
    const M = { lale: new THREE.MeshPhongMaterial({ color: 0xf6a3c0, shininess: 60, specular: 0xffd9e6, side: THREE.DoubleSide, flatShading: true }),
      boncuk: new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 90, specular: 0xffffff, transparent: true, opacity: 0.9 }),
      yaprak: new THREE.MeshPhongMaterial({ color: 0x8fdc5f, side: THREE.DoubleSide, transparent: true, opacity: 0.82, shininess: 70 }),
      amber: new THREE.MeshPhongMaterial({ color: 0xf0b050, side: THREE.DoubleSide, transparent: true, opacity: 0.82, shininess: 70 }),
      tel: new THREE.MeshPhongMaterial({ color: 0xd9d2c0, shininess: 80 }) };
    // ahşap taban (üst yuvarlak çıkıntı + yan)
    const wc = tuval(512, 128), wx = wc.getContext('2d'); wx.fillStyle = '#e8cfa6'; wx.fillRect(0, 0, 512, 128);
    for (let i = 0; i < 70; i++) { wx.fillStyle = 'rgba(160,120,70,' + (0.05 + rnd() * 0.12) + ')'; wx.fillRect(rnd() * 512, 0, 1 + rnd() * 3, 128); }
    const wd = new THREE.CanvasTexture(wc); wd.wrapS = THREE.RepeatWrapping;
    const wood = new THREE.MeshPhongMaterial({ map: wd, color: 0xfff4e0, shininess: 20, specular: 0x222222 });
    const taban = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.42, 36), wood); taban.position.y = 0.21; spin.add(taban);
    const ust = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.8, 0.06, 36), wood); ust.position.y = 0.45; spin.add(ust);
    // alt yüz: el yazısı, pil bölmesi ve üç siyah ayak
    const bc = tuval(1024, 1024), bx = bc.getContext('2d');
    function altCiz() {
      bx.fillStyle = '#e9d1a8'; bx.fillRect(0, 0, 1024, 1024);
      for (let i = 0; i < 120; i++) { bx.fillStyle = 'rgba(150,110,60,' + (0.04 + rnd() * 0.1) + ')'; bx.fillRect(0, rnd() * 1024, 1024, 1 + rnd() * 3); }
      bx.fillStyle = '#e9e9ea'; bx.beginPath(); bx.arc(512, 580, 150, 0, 7); bx.fill(); bx.fillStyle = '#bfc1c4'; bx.fillRect(430, 540, 160, 110); bx.fillStyle = '#26262a'; bx.fillRect(468, 508, 74, 30); bx.fillStyle = '#9a9ca0'; bx.font = '20px sans-serif'; bx.textAlign = 'center'; bx.fillText('OFF  ON', 505, 500);
      bx.fillStyle = '#1d1d20'; [[250, 440], [790, 440], [525, 880]].forEach(f => { bx.beginPath(); bx.arc(f[0], f[1], 82, 0, 7); bx.fill(); });
      bx.save(); bx.translate(512, 215); bx.rotate(-0.1); bx.fillStyle = '#16161a'; bx.textAlign = 'center'; bx.textBaseline = 'middle';
      bx.font = '92px "Caveat", "Great Vibes", cursive'; bx.fillText('15 temmuz 2026', 0, -40); bx.fillText('Mehmetnur ♥ İrem Pembe', 0, 70); bx.restore();
      alt.material.map.needsUpdate = true;
    }
    const alt = new THREE.Mesh(new THREE.CircleGeometry(0.8, 40), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(bc), color: 0xf4ece0 }));
    alt.rotation.x = Math.PI / 2; alt.position.y = -0.002; spin.add(alt); altCiz();
    if (document.fonts && document.fonts.load) document.fonts.load('80px "Caveat"', '15 temmuz 2026 Mehmetnur İrem').then(altCiz).catch(() => {});
    [[250, 440], [790, 440], [525, 880]].forEach(f => { const ay = new THREE.Mesh(new THREE.CylinderGeometry(0.125, 0.125, 0.05, 14), new THREE.MeshLambertMaterial({ color: 0x1d1d20 })); ay.position.set((f[0] / 1024 - 0.5) * 1.6, -0.025, (0.5 - f[1] / 1024) * 1.6); spin.add(ay); });
    // boncuk zemini
    const BN = 760, bon = new THREE.InstancedMesh(new THREE.SphereGeometry(0.04, 5, 4), M.boncuk, BN), dm = new THREE.Object3D();
    for (let i = 0; i < BN; i++) { const r = 0.66 * Math.sqrt(rnd()), a = rnd() * 6.283; dm.position.set(Math.cos(a) * r, 0.5 + 0.2 * (1 - (r / 0.66) * (r / 0.66)) + rnd() * 0.05, Math.sin(a) * r); dm.rotation.set(0, 0, 0); dm.scale.setScalar(0.8 + rnd() * 0.5); dm.updateMatrix(); bon.setMatrixAt(i, dm.matrix); bon.setColorAt(i, new THREE.Color([0xf9c6d6, 0xfbe4ea, 0xf3a5c0, 0xffd7c8][i % 4])); }
    spin.add(bon);
    // laleler
    const pts = [[0.0, 0], [0.05, 0.02], [0.095, 0.08], [0.108, 0.16], [0.092, 0.24], [0.058, 0.31], [0.03, 0.36]].map(p => new THREE.Vector2(p[0], p[1]));
    const laleGeo = new THREE.LatheGeometry(pts, 6);
    function lale(x, z, boy, egim, yon) {
      const gl = new THREE.Group(); gl.position.set(x, 0.62, z); gl.rotation.order = 'YXZ'; gl.rotation.y = yon; gl.rotation.x = egim;
      const sap = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, boy, 4), M.tel); sap.position.y = boy / 2; gl.add(sap);
      const cic = new THREE.Mesh(laleGeo, M.lale); cic.position.y = boy - 0.02; cic.scale.set(1.15, 1.2, 1.15); cic.rotation.y = rnd() * 1; gl.add(cic); spin.add(gl);
    }
    for (let i = 0; i < 11; i++) { const a = i / 11 * 6.283 + 0.3, r = 0.46; lale(Math.cos(a) * r, Math.sin(a) * r, 0.72 + rnd() * 0.14, 0.12 + rnd() * 0.08, -a + Math.PI / 2); }
    for (let i = 0; i < 4; i++) { const a = i / 4 * 6.283 + 0.8, r = 0.24; lale(Math.cos(a) * r, Math.sin(a) * r, 0.62 + rnd() * 0.2, 0.1, -a + Math.PI / 2); }
    lale(0.03, 0.02, 0.4, 0, 0); lale(-0.12, 0.1, 0.45, 0.05, 1);
    // yapraklar
    const ys = new THREE.Shape(); ys.moveTo(0, 0); ys.quadraticCurveTo(0.09, 0.2, 0.02, 0.5); ys.quadraticCurveTo(-0.08, 0.22, 0, 0);
    const yg = new THREE.ShapeGeometry(ys);
    for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283 + rnd() * 0.3, r = 0.08 + rnd() * 0.2, y = new THREE.Mesh(yg, i % 4 === 3 ? M.amber : M.yaprak); y.position.set(Math.cos(a) * r, 0.58, Math.sin(a) * r); y.rotation.set(0, -a + Math.PI / 2, 0); y.rotateX(0.5 + rnd() * 0.5); y.scale.setScalar(1.1 + rnd() * 0.5); spin.add(y); }
    // cam kubbe
    const cam = new THREE.Mesh(new THREE.SphereGeometry(1, 30, 22, 0, Math.PI * 2, 0, Math.PI * 0.75), new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.16, shininess: 140, specular: 0xffffff, side: THREE.DoubleSide, depthWrite: false }));
    cam.position.y = 1.2; cam.renderOrder = 2; spin.add(cam);
    const camIc = new THREE.Mesh(new THREE.SphereGeometry(1.012, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.75), new THREE.MeshBasicMaterial({ color: 0xffc9dc, transparent: true, opacity: 0.0, side: THREE.BackSide, depthWrite: false, blending: THREE.AdditiveBlending }));
    camIc.position.y = 1.2; camIc.renderOrder = 3; spin.add(camIc);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: ldoku, fog: false, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending, opacity: 0 }));
    halo.scale.set(6.5, 6.5, 1); halo.position.y = 1.3; hr.add(halo);
    const ISIK = new THREE.Color();
    const hd = { root: hr, tilt, spin, halo, lit: 0, set(l) {
      this.lit = l; M.lale.emissive.setRGB(1, 0.8, 0.7).multiplyScalar(l); M.boncuk.emissive.setRGB(1, 0.55, 0.2).multiplyScalar(l * 0.5);
      M.yaprak.emissive.setRGB(0.5, 0.7, 0.1).multiplyScalar(l * 0.5); M.amber.emissive.setRGB(0.9, 0.45, 0.05).multiplyScalar(l * 0.5);
      camIc.material.opacity = 0.12 * l; halo.material.opacity = 0.75 * l; } };
    hd.set(0); ey.hd = hd; }
  // ---- Sandık ----
  { const cx0 = EX + Math.sin(EY_KAPI_TH - 0.2) * 19.4, cz0 = EZ + Math.cos(EY_KAPI_TH - 0.2) * 19.4;
    const sg = new THREE.Group(); sg.position.set(cx0, 0, cz0); sg.rotation.y = EY_KAPI_TH - 0.2 + Math.PI; sg.visible = false; sg.scale.setScalar(0.001); g.add(sg);
    const ac = tuval(256, 128), ax = ac.getContext('2d'); ax.fillStyle = '#5a341c'; ax.fillRect(0, 0, 256, 128);
    for (let y = 0; y < 128; y += 21) { ax.fillStyle = ['#6b3f23', '#4f2d18', '#5d361d'][(y / 21) % 3]; ax.fillRect(0, y + 1, 256, 19); }
    for (let i = 0; i < 160; i++) { ax.fillStyle = 'rgba(30,15,8,' + rnd() * 0.25 + ')'; ax.fillRect(rnd() * 256, rnd() * 128, 8 + rnd() * 30, 1); }
    const sd = new THREE.CanvasTexture(ac), ahsap = new THREE.MeshPhongMaterial({ map: sd, shininess: 25, specular: 0x331a0a });
    const altin = new THREE.MeshPhongMaterial({ color: 0xe9c46a, shininess: 100, specular: 0xfff1c0, emissive: 0x3a2a08 });
    const govde = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.55, 0.7), ahsap); govde.position.y = 0.275; sg.add(govde);
    [-0.5, 0.5].forEach(x => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.57, 0.72), altin); b.position.set(x, 0.275, 0); sg.add(b); });
    const ic = new THREE.Mesh(new THREE.PlaneGeometry(1.08, 0.58), new THREE.MeshBasicMaterial({ color: 0xffd9a0 })); ic.rotation.x = -Math.PI / 2; ic.position.y = 0.55; sg.add(ic);
    const hinge = new THREE.Group(); hinge.position.set(0, 0.55, -0.35); sg.add(hinge);
    const kapak = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.2, 18, 1, false, 0, Math.PI), ahsap); kapak.rotation.z = Math.PI / 2; kapak.position.set(0, 0, 0.35); hinge.add(kapak);
    [-0.5, 0.5].forEach(x => { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.357, 0.357, 0.09, 18, 1, false, 0, Math.PI), altin); b.rotation.z = Math.PI / 2; b.position.set(x, 0, 0.35); hinge.add(b); });
    const kilit = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.05), altin); kilit.position.set(0, 0.5, 0.36); sg.add(kilit);
    const isik = new THREE.Sprite(new THREE.SpriteMaterial({ map: ldoku, fog: false, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending, opacity: 0.5 }));
    isik.scale.set(3.4, 3.4, 1); isik.position.y = 0.8; sg.add(isik);
    const huzme = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.18, 4, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xffe1a8, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    huzme.position.y = 2.5; sg.add(huzme);
    ey.sandik = { grup: sg, hinge, isik, huzme, x: cx0, z: cz0, pop: 0, aci: 0 }; }
  // ---- Sandığa varmadan önce: ayaklı mumlar, yola güller, sandığın iki yanından dökülen yapraklar ----
  { const ch = ey.sandik, cr = EY_KAPI_TH - 0.2 + Math.PI, tgx = Math.cos(cr), tgz = -Math.sin(cr);   // sandığın yan (teğet) yönü
    const altinM = new THREE.MeshPhongMaterial({ color: 0xd9b25c, shininess: 90, specular: 0xfff1c0, emissive: 0x2e2208 });
    const mumM = new THREE.MeshLambertMaterial({ color: 0xfff0d2, emissive: 0x3a3020 });
    const alevG = new THREE.ConeGeometry(0.024, 0.1, 5), alevM = new THREE.MeshBasicMaterial({ color: 0xffb347, fog: false });
    const yerIsik = new THREE.CanvasTexture((() => { const c = tuval(128, 128), x = c.getContext('2d'), r = x.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,190,110,.85)'); r.addColorStop(1, 'rgba(255,170,90,0)'); x.fillStyle = r; x.fillRect(0, 0, 128, 128); return c; })());
    function mumAyak(x, z, h) {
      const gm = new THREE.Group(); gm.position.set(x, 0, z); g.add(gm);
      const taban = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.06, 12), altinM); taban.position.y = 0.03; gm.add(taban);
      const dir = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.035, h, 8), altinM); dir.position.y = h / 2; gm.add(dir);
      [0.3, 0.62].forEach(k => { const t = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), altinM); t.position.y = h * k; gm.add(t); });
      const tabak = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.1, 0.05, 12), altinM); tabak.position.y = h; gm.add(tabak);
      [[0, 0, 0.26], [0.11, 0.05, 0.17], [-0.1, 0.06, 0.2]].forEach(m => {
        const mm = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, m[2], 8), mumM); mm.position.set(m[0], h + 0.025 + m[2] / 2, m[1]); gm.add(mm);
        const al = new THREE.Mesh(alevG, alevM); al.position.set(m[0], h + 0.025 + m[2] + 0.05, m[1]); gm.add(al); ey.alevler.push({ m: al, f: rnd() * 6 });
      });
      const parla = new THREE.Sprite(new THREE.SpriteMaterial({ map: ldoku, fog: false, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending, opacity: 0.6 }));
      parla.scale.set(1.4, 1.4, 1); parla.position.y = h + 0.25; gm.add(parla); ey.mumParla.push({ s: parla, f: rnd() * 6 });
      const yer = new THREE.Mesh(new THREE.CircleGeometry(2.1, 20), new THREE.MeshBasicMaterial({ map: yerIsik, transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
      yer.rotation.x = -Math.PI / 2; yer.position.y = 0.035; gm.add(yer); ey.mumYer.push(yer);
    }
    [4.95, 5.12, 5.29, 5.46].forEach((th, i) => { mumAyak(EX + Math.sin(th) * 17.2, EZ + Math.cos(th) * 17.2, 1.35 + (i % 2) * 0.2); mumAyak(EX + Math.sin(th + 0.05) * 21.6, EZ + Math.cos(th + 0.05) * 21.6, 1.45 - (i % 2) * 0.15); });
    [-2.1, 2.1].forEach(k => mumAyak(ch.x + tgx * k, ch.z + tgz * k, 1.55));
    [-0.11, 0.11].forEach(k => mumAyak(EX + Math.sin(EY_KAPI_TH + k) * 24.8, EZ + Math.cos(EY_KAPI_TH + k) * 24.8, 1.5));
    // sadece orayı aydınlatan iki sıcak ışık
    [[ch.x, 2.3, ch.z], [EX + Math.sin(5.2) * 19.4, 2.2, EZ + Math.cos(5.2) * 19.4]].forEach(p => { const l = new THREE.PointLight(0xffb066, 0, 11, 2); l.position.set(p[0], p[1], p[2]); l.visible = false; sahne.add(l); ey.mumIsik.push(l); });
    // yolda güller ve yapraklar
    const gulG = new THREE.SphereGeometry(0.075, 7, 5), gulM = new THREE.MeshLambertMaterial({ color: 0xffffff }), GN = 46, gul = new THREE.InstancedMesh(gulG, gulM, GN), dm = new THREE.Object3D();
    const yapG = new THREE.CircleGeometry(0.06, 6), yapM = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide }), YN = 420, yap = new THREE.InstancedMesh(yapG, yapM, YN);
    const gr = [0xc9183a, 0xe0556f, 0xf3a1b8, 0xb01030, 0xffd0dc], yer = (i) => { for (let k = 0; k < 20; k++) { const th = 4.75 + rnd() * 1.2, r = 16.8 + rnd() * 3.5, x = EX + Math.sin(th) * r, z = EZ + Math.cos(th) * r; if (Math.hypot(x - ch.x, z - ch.z) > 1.3) return [x, z]; } return [EX + Math.sin(5) * 18.5, EZ + Math.cos(5) * 18.5]; };
    for (let i = 0; i < GN; i++) { const p = yer(i); dm.position.set(p[0], 0.06, p[1]); dm.rotation.set(0, rnd() * 6, 0); dm.scale.set(1, 0.6, 1); dm.updateMatrix(); gul.setMatrixAt(i, dm.matrix); gul.setColorAt(i, new THREE.Color(gr[i % gr.length])); }
    for (let i = 0; i < YN; i++) { const p = yer(i); dm.position.set(p[0], 0.035, p[1]); dm.rotation.set(-Math.PI / 2 + (rnd() - 0.5) * 0.3, 0, rnd() * 6); dm.scale.set(1, 1.5, 1); dm.updateMatrix(); yap.setMatrixAt(i, dm.matrix); yap.setColorAt(i, new THREE.Color(gr[(i + 1) % gr.length])); }
    g.add(gul); g.add(yap);
    // sandığın iki yanından dökülen gül yaprakları
    const PN = 110, pet = new THREE.InstancedMesh(yapG, yapM, PN), pv = [];
    for (let i = 0; i < PN; i++) { pet.setColorAt(i, new THREE.Color(gr[i % gr.length])); pv.push({ yan: i % 2 ? 1 : -1, ox: (rnd() - 0.5) * 0.7, oz: (rnd() - 0.5) * 0.9, y: rnd() * 3.4, hiz: 0.45 + rnd() * 0.5, f: rnd() * 6, d: 0.3 + rnd() * 0.4, dn: rnd() * 6 }); }
    pet.frustumCulled = false; pet.visible = false; g.add(pet); ey.yaprakSis = { m: pet, v: pv, tgx, tgz }; }
  // en yakın bisikleti gösteren ok
  const okM = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.5, 4), new THREE.MeshBasicMaterial({ color: 0xffd98a, fog: false }));
  okM.rotation.x = Math.PI; okM.visible = false; g.add(okM); ey.ok = okM;
  // ışıklar (açılana kadar kapalı)
  g.traverse(o => { if (o.isInstancedMesh) o.frustumCulled = false; });
  ey.hemi = new THREE.HemisphereLight(0xffd9b0, 0x4a5a30, 0.95); ey.hemi.visible = false; sahne.add(ey.hemi);
  ey.gun = new THREE.DirectionalLight(0xffa860, 0.85); ey.gun.position.set(EX - 120, 60, EZ - 300); ey.gun.target.position.set(EX, 0, EZ); sahne.add(ey.gun.target); ey.gun.visible = false; sahne.add(ey.gun);
}
function eyAc() {
  if (ey.aktif) return;
  eyKur();
  gecisKutu.classList.add('acik');
  soruT.classList.remove('acik'); kapiT.gorunur = false; parkKart.classList.remove('acik'); kapiP.gorunur = false;
  setTimeout(() => {
    ey.aktif = true;
    ey.kapali = [];
    sahne.traverse(o => { if (o.isLight && o !== ey.hemi && o !== ey.gun && o.visible) { o.visible = false; ey.kapali.push(o); } });
    ey.hemi.visible = true; ey.gun.visible = true; ey.mumIsik.forEach(l => { l.visible = true; });
    ey.eskiSis = sahne.fog; ey.eskiArka = sahne.background;
    sahne.fog = new THREE.FogExp2(0xf0b184, 0.0021); sahne.background = new THREE.Color(0xf0b184);
    kamera.far = 2600; kamera.updateProjectionMatrix();
    ey.grup.visible = true;
    kon.x = EX; kon.z = EZ + 21.2; kon.vx = 0; kon.vz = 0; kon.yaw = 0; kon.pitch = -0.16; kon.oto = null; ikiliYon = 0;
    if (muzik3) muzik3.volume = 0;
    ey.sonGece = -1; ey.yaziT = 0; ey.bindi = false; ey.ipucuBitis = performance.now() + 30000;
    yonKutu.textContent = 'Bisiklete bin! En yakın bisikletin yanına git.'; yonKutu.classList.add('acik');
    gecisKutu.classList.remove('acik');
  }, 650);
}
function eyKonumYuk(x, z) {   // iskele üstündeyken biraz yüksel
  return (x - EX > 7.2 && Math.abs(z - EZ) < 1.1 && Math.hypot(x - EX, z - EZ) < EY_GOL + 1.2) ? 0.1 : 0;
}
function eySinir() {
  let dx = kon.x - EX, dz = kon.z - EZ, r = Math.hypot(dx, dz);
  if (r < EY_GOL + 1.0) {
    if (dx > 7.0 && Math.abs(dz) < 1.5) { kon.z = EZ + sinir(dz, -0.78, 0.78); kon.x = Math.max(kon.x, EX + 7.6); }
    else { const k = (EY_GOL + 1.0) / (r || 1); kon.x = EX + dx * k; kon.z = EZ + dz * k; }
  } else if (r > EY_DUVAR - 1.4) {
    const k = (EY_DUVAR - 1.4) / r; kon.x = EX + dx * k; kon.z = EZ + dz * k;
  }
  engelleriItele(kon, 0.35, false, EY_AGAC);
}
function eyGuncelle(dt, simdi) {
  if (!ey.aktif) {
    // 3. odadaki açılmış kapıdan içeri girince Eymir'e geç
    if (kapiT.acik && kapiT.aci < -1.2 && K3.acik && kon.x < R3.x0 + 0.95 && kon.x > 2.5 && Math.abs(kon.z - kapiT.z) < 0.8) eyAc();
    return;
  }
  const t = simdi / 1000, gc0 = ey.gece;
  eyDekorGuncelle(dt, t);
  // yazı ipucu
  if (!ey.bindi && simdi < ey.ipucuBitis) {
    // bisikletler yanıp söner, ok en yakın olanı gösterir
    let yk = 0, ykd = 1e9;
    ey.bisikler.forEach((b, i) => { const d = Math.hypot(kon.x - b.position.x, kon.z - b.position.z); if (d < ykd) { ykd = d; yk = i; } });
    const dalga = 0.5 + 0.5 * Math.sin(t * 5);
    if (!yonKutu.classList.contains('acik')) { yonKutu.textContent = 'Bisiklete bin! En yakın bisikletin yanına git.'; yonKutu.classList.add('acik'); }
    ey.bisikler.forEach((b, i) => {
      b.userData.cer.emissive.copy(b.userData.renk).multiplyScalar(0.15 + 0.55 * dalga);
      b.userData.parla.material.opacity = 0.25 + 0.5 * dalga; b.userData.parla.visible = true;
    });
    const hb = ey.bisikler[yk]; ey.ok.visible = true; ey.ok.position.set(hb.position.x, 1.9 + 0.2 * Math.sin(t * 4), hb.position.z); ey.ok.rotation.y = t * 2;
  } else if (ey.ok.visible) {
    ey.ok.visible = false;
    ey.bisikler.forEach(b => { b.userData.cer.emissive.setRGB(0, 0, 0); b.userData.parla.visible = false; });
    yonKutu.classList.remove('acik');
  }
  // bulutlar, su
  ey.bulutlar.forEach(b => { b.position.x += 3.5 * dt; if (b.position.x > EX + 1150) b.position.x = EX - 1150; });
  ey.suPar.material.map.offset.set(t * 0.012, t * 0.007);
  ey.fener.material.opacity = 0.55 + 0.2 * Math.sin(t * 3.1) + 0.1 * Math.sin(t * 7.3);
  { const sc = 190 * (1 + 0.07 * Math.sin(t * 2.2)); ey.cobanY.scale.set(sc, sc, 1); }
  // bisiklet
  if (ey.bisik) {
    const b = ey.bisikler[ey.bisikNo], hiz = Math.hypot(kon.vx, kon.vz);
    b.position.set(kon.x, eyKonumYuk(kon.x, kon.z), kon.z); b.rotation.y = ikiliYon;
    b.userData.tekerler.forEach(w => { w.rotation.x -= hiz * dt / 0.34; });
    ikili.position.y = 0.42 + eyKonumYuk(kon.x, kon.z);
    eyBtn.textContent = 'İn'; eyBtn.classList.toggle('acik', !ey.kilit);
  } else {
    ikili.position.y = eyKonumYuk(kon.x, kon.z);
    let yakin = -1, yd = 2.6;
    ey.bisikler.forEach((b, i) => { const d = Math.hypot(kon.x - b.position.x, kon.z - b.position.z); if (d < yd) { yd = d; yakin = i; } });
    ey.yakinBisik = yakin;
    eyBtn.textContent = 'Bisiklete bin'; eyBtn.classList.toggle('acik', yakin >= 0 && !ey.kilit);
  }
  // fotoğraflar yaklaşınca netleşir
  ey.foto.forEach(f => {
    const uz = Math.hypot(kon.x - f.px, kon.z - f.pz), p = 0.25 + 0.75 * yumusak(12, 4.5, uz);
    f.net.material.color.setRGB(p, p, p); f.bul.material.color.setRGB(p, p, p); f.bul.material.opacity = 1 - yumusak(9, 5.5, uz);
  });
  // iskelenin ucu: teklif noktası
  const hu = Math.hypot(kon.x - (EX + 8.4), kon.z - EZ);
  if (hu < 1.8) {
    if (!ey.iskeleKalp) { ey.iskeleKalp = true; kalpPatlat(); }
    ey.iskeleSure += dt;
    if (ey.iskeleSure > 1.5 && ey.yaziT === 0) { yaziKutu.textContent = '15 Temmuz ♥'; yaziKutu.classList.add('acik'); }
  } else if (ey.yaziT === 0 && ey.iskeleSure > 0) { ey.iskeleSure = 0; yaziKutu.classList.remove('acik'); }
  // kuşlar
  if (gc0 < 0.55) ey.kuslar.forEach(k => {
    k.a += k.w * dt; const x = EX + Math.cos(k.a) * k.r, z = EZ + Math.sin(k.a) * k.r, y = k.h + Math.sin(t * 0.7 + k.f) * 1.2;
    k.g.visible = true; k.g.position.set(x, y, z); { const sg = k.w > 0 ? 1 : -1; k.g.rotation.y = Math.atan2(Math.sin(k.a) * sg, -Math.cos(k.a) * sg); }
    const fl = Math.sin(t * 8 + k.f) * 0.55; k.sol.rotation.z = fl; k.sag.rotation.z = -fl;
  }); else ey.kuslar.forEach(k => { k.g.visible = false; });
  if (gc0 < 0.5 && t > ey.kusSon) { eyKusSesi(); ey.kusSon = t + 3 + Math.random() * 6; }
  // tam tur: yürünen yönler işaretlenir, kapı açılır
  { const dxk = kon.x - EX, dzk = kon.z - EZ, rk = Math.hypot(dxk, dzk);
    if (rk > 15 && rk < 26.5) { const sk = Math.floor((((Math.atan2(dxk, dzk) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2)) * 16) % 16; if (!ey.sektor[sk]) { ey.sektor[sk] = true; ey.sektorSay++; } }
    const kd = ey.kapiD;
    if (ey.durum === 'yok' || ey.durum === 'sandik') ey.geceHedef = Math.min(0.96, Math.max(0, (ey.sektorSay / 16 - 0.1) / 0.72 * 0.96));
    eySandikGuncelle(dt, simdi, t);
    kd.aci += ((kd.acik ? -1.9 : 0) - kd.aci) * Math.min(1, dt * 1.8); kd.hinge.rotation.y = kd.aci; eyKapiSoruGuncelle(kd, simdi);
    const bisikIpucu = !ey.bindi && simdi < ey.ipucuBitis;
    if (!bisikIpucu) {
      const ud = Math.hypot(kon.x - kd.x, kon.z - kd.z);
      if (ey.dKutu && simdi > ey.dBitis) { ey.dKutu = false; yonKutu.classList.remove('acik'); }
      else if (ey.dKutu && kd.acik) yonKutu.classList.add('acik');
      if (!kd.acik) {
        if (ud < 6 && !ey.kilit && ey.durum !== 'ucus') { yonKutu.textContent = ey.durum === 'sandik' ? 'Yoldaki sandığı aç.' : (ey.durum === 'yok' ? 'Önce gölü tam tur at. Tur: %' + Math.round(ey.sektorSay / 16 * 100) : (ey.durum === 'asili' ? 'Kapıya yaklaş, sana bir sorum var.' : 'Hediyeye bak.')); yonKutu.classList.add('acik'); ey.dKutu = true; ey.dBitis = simdi + 1500; }
      }
    } }
  // gün batımı → gece
  ey.gece += (ey.geceHedef - ey.gece) * Math.min(1, dt * 0.3);
  const gc = ey.gece;
  if (Math.abs(gc - ey.sonGece) > 0.002) {
    ey.sonGece = gc;
    const k = 1 - gc, a = 0.1 + 0.9 * k;
    ey.gok.material.color.setRGB(0.035 + 0.965 * k, 0.05 + 0.95 * k, 0.14 + 0.86 * k);
    ey.gunes.position.y = 80 - 140 * gc; ey.gunes.material.opacity = k;
    ey.hemi.intensity = 0.1 + 0.85 * k; ey.hemi.color.setRGB(0.45 + 0.55 * k, 0.5 + 0.35 * k, 0.9 - 0.1 * k); ey.hemi.groundColor.setRGB(0.04 + 0.25 * k, 0.05 + 0.3 * k, 0.1 + 0.2 * k); ey.gun.intensity = 0.85 * k;
    sahne.fog.color.setRGB(0.025 + 0.915 * k, 0.03 + 0.66 * k, 0.09 + 0.43 * k); sahne.background.copy(sahne.fog.color);
    ey.su.material.color.setRGB(0.1 + 0.9 * k, 0.13 + 0.87 * k, 0.27 + 0.73 * k);
    ey.yildiz.material.opacity = gc; ey.kuncul.material.opacity = gc * 0.9;
    ey.cobanY.material.opacity = yumusak(0.12, 0.5, gc); ey.cobanYazi.material.opacity = yumusak(0.5, 0.9, gc);
    ey.bulutlar.forEach(b => b.material.color.setRGB(0.1 + 0.9 * k, 0.12 + 0.76 * k, 0.2 + 0.72 * k));
    ey.lamba.forEach(l => { l.material.opacity = 0.35 + 0.55 * gc; });
  }
  if (gc > 0.05) {
    const p = ey.kunKonum, b = ey.kunTemel;
    for (let i = 0; i < b.length; i += 3) { p[i] = b[i] + Math.sin(t * 0.6 + i) * 0.8; p[i + 1] = b[i + 1] + Math.sin(t * 0.9 + i * 1.3) * 0.35; p[i + 2] = b[i + 2] + Math.cos(t * 0.5 + i) * 0.8; }
    ey.kuncul.geometry.attributes.position.needsUpdate = true;
  }
}
// ---- Sandık ve hediye sahnesi ----
function eyZilSesi() {
  try {
    if (!sesBagl) return;
    const c = sesBagl, t = c.currentTime;
    [1046.5, 1318.5, 1568, 2093].forEach((f, i) => {
      const o = c.createOscillator(), g = c.createGain(), t0 = t + i * 0.16;
      o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.07, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.4);
      o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + 1.5);
    });
  } catch (e) {}
}
const acBtn = document.getElementById('acBtn'), hdUI = document.getElementById('hdUI'), cevirBtn = document.getElementById('cevirBtn'), tamamBtn = document.getElementById('tamamBtn'), geriBtn = document.getElementById('geriBtn');
const eyV = new THREE.Vector3();
const eyYumusak = t => { t = sinir(t, 0, 1); return t * t * (3 - 2 * t); };
function eyDekorGuncelle(dt, t) {
  const gc = ey.gece;
  ey.alevler.forEach(a => { const n = 0.85 + 0.15 * Math.sin(t * 11 + a.f) + 0.08 * Math.sin(t * 23 + a.f * 2); a.m.scale.set(n, 1.15 * n, n); });
  ey.mumParla.forEach(a => { a.s.material.opacity = (0.25 + 0.5 * gc) * (0.85 + 0.15 * Math.sin(t * 9 + a.f)); });
  ey.mumYer.forEach(m => { m.material.opacity = 0.12 + 0.5 * gc; });
  ey.mumIsik.forEach((l, i) => { l.intensity = (0.12 + 1.5 * gc) * (0.94 + 0.06 * Math.sin(t * 7 + i * 2)); });
  const ys = ey.yaprakSis;
  if (ys) {
    const gor = ey.durum !== 'yok'; ys.m.visible = gor;
    if (gor) {
      const sk = ey.sandik, dm = eyDm, cr = EY_KAPI_TH - 0.2 + Math.PI, nx = Math.sin(cr), nz = Math.cos(cr);
      ys.v.forEach((v, i) => {
        v.y -= v.hiz * dt; if (v.y < 0.04) { v.y = 3.4 + Math.random() * 0.6; v.ox = (Math.random() - 0.5) * 0.7; v.oz = (Math.random() - 0.5) * 0.9; }
        const sal = Math.sin(t * v.d * 2 + v.f) * 0.25;
        dm.position.set(sk.x + ys.tgx * (v.yan * 1.15 + v.ox + sal) + nx * v.oz, v.y, sk.z + ys.tgz * (v.yan * 1.15 + v.ox + sal) + nz * v.oz);
        dm.rotation.set(t * 1.3 + v.dn, t * 0.9 + v.f, v.dn); dm.scale.set(1, 1.5, 1); dm.updateMatrix(); ys.m.setMatrixAt(i, dm.matrix);
      });
      ys.m.instanceMatrix.needsUpdate = true;
    }
  }
}
const eyDm = new THREE.Object3D();
const SORU5 = { metin: "10 Ekim'de biz nereye gittik?", secenekler: ['Eskişehir', 'Kapadokya', 'Mardin'], dogru: 'Kapadokya',
  yanlis: { 'Eskişehir': 'Eskişehir güzel ama oraya değil, çok daha uzağa gittik 😄', 'Mardin': 'Mardin taş evleriyle güzel, ama başka bir yere gittik 🙈' },
  ipucu: 'İpucu: Peri bacaları ve bir ATV var.', dogruMesaj: 'Bildin! Kapadokya... Kapı açılıyor!' };
const soru5 = document.createElement('div'); soru5.id = 'soru3';
const soru5B = document.createElement('div'); soru5B.id = 'soru3Baslik'; soru5B.textContent = SORU5.metin;
const soru5S = document.createElement('div'); soru5S.id = 'soru3Sec'; const soru5M = document.createElement('div'); soru5M.id = 'soru3Mesaj';
soru5.append(soru5B, soru5S, soru5M); document.body.appendChild(soru5);
const kapiSoru = { cozuldu: false, yanlis: 0, gorunur: false, bitis: 0 };
SORU5.secenekler.forEach(sc => {
  const b = document.createElement('button'); b.textContent = sc;
  b.addEventListener('click', () => {
    if (kapiSoru.cozuldu) return;
    if (sc === SORU5.dogru) {
      kapiSoru.cozuldu = true; soru5M.textContent = SORU5.dogruMesaj; soru5M.className = 'dogru'; soru5S.style.display = 'none';
      kalpPatlat(); eyKapiAc(); kapiSoru.bitis = performance.now() + 5000;
    } else {
      kapiSoru.yanlis++; soru5M.textContent = (SORU5.yanlis[sc] || 'Bir daha dene.') + (kapiSoru.yanlis >= 2 ? ' ' + SORU5.ipucu : ''); soru5M.className = 'yanlis';
      b.classList.add('sal'); b.classList.add('solgun'); setTimeout(() => b.classList.remove('sal'), 400);
    }
  });
  soru5S.appendChild(b);
});
function eyKapiSoruGuncelle(kd, simdi) {
  const dx = kd.x - kon.x, dz = kd.z - kon.z, uz = Math.hypot(dx, dz), bak = (-Math.sin(kon.yaw) * dx - Math.cos(kon.yaw) * dz) / (uz || 1);
  let goster = ey.durum === 'asili' && uz < 3.8 && bak > (kapiSoru.gorunur ? 0.2 : 0.45) && !ey.kilit;
  if (kapiSoru.cozuldu && simdi > kapiSoru.bitis) goster = false;
  if (goster !== kapiSoru.gorunur) { kapiSoru.gorunur = goster; soru5.classList.toggle('acik', goster); }
}
function eyKapiAc() {
  const kd = ey.kapiD; if (kd.acik) return;
  kd.acik = true; kd.panel.visible = true; kd.kilit.visible = false; gicirti(1.6);
}
function eySandikGuncelle(dt, simdi, t) {
  const sk = ey.sandik, hd = ey.hd;
  if (ey.durum === 'yok' && ey.sektorSay >= 14) { ey.durum = 'sandik'; sk.grup.visible = true; sk.pop = 0; eyZilSesi(); }
  if (sk.grup.visible && sk.pop < 1) { sk.pop = Math.min(1, sk.pop + dt * 1.2); const e = 1 + 2.7 * Math.pow(sk.pop - 1, 3) + 1.7 * Math.pow(sk.pop - 1, 2); sk.grup.scale.setScalar(Math.max(0.001, e)); }
  const dc = Math.hypot(kon.x - sk.x, kon.z - sk.z);
  if (ey.durum === 'sandik') {
    sk.isik.material.opacity = 0.35 + 0.25 * Math.sin(t * 3); sk.aci += (0 - sk.aci) * Math.min(1, dt * 4); sk.hinge.rotation.x = sk.aci;
    acBtn.classList.toggle('acik', dc < 3.6 && sk.pop >= 1);
  } else acBtn.classList.remove('acik');
  if (ey.durum === 'acilis') {
    ey.dT += dt; const d = ey.dT;
    sk.aci = -1.95 * eyYumusak(d / 0.9); sk.hinge.rotation.x = sk.aci;
    sk.huzme.material.opacity = 0.35 * eyYumusak(d / 0.8) * (1 - eyYumusak((d - 2.6) / 0.8)); sk.isik.material.opacity = 0.8;
    if (d > 0.7) {
      hd.root.visible = true; const p = eyYumusak((d - 0.7) / 2.1);
      hd.root.position.set(sk.x, 0.7 + 1.9 * p, sk.z); hd.root.scale.setScalar(0.05 + 0.45 * p); hd.root.rotation.y = 0; hd.tilt.rotation.x = 0;
      ey.spin += dt * (3.2 - 2.4 * p); hd.spin.rotation.y = ey.spin; hd.set(Math.min(1, hd.lit + dt * 0.8));
    }
    if (d > 3.1) { ey.durum = 'incele'; ey.incele = true; ey.flip = false; hdUI.classList.add('acik'); cevirBtn.textContent = 'Çevir'; }
  } else if (ey.durum === 'incele') {
    kamera.getWorldDirection(eyV);
    const uz = ey.flip ? 1.55 : 1.75, k = Math.min(1, dt * 4);
    const tx = kamera.position.x + eyV.x * uz, ty = kamera.position.y + eyV.y * uz - (ey.flip ? 0.55 : 0.5), tz = kamera.position.z + eyV.z * uz;
    hd.root.position.x += (tx - hd.root.position.x) * k; hd.root.position.y += (ty - hd.root.position.y) * k; hd.root.position.z += (tz - hd.root.position.z) * k;
    const sc = hd.root.scale.x + ((ey.flip ? 0.62 : 0.5) - hd.root.scale.x) * k; hd.root.scale.setScalar(sc);
    const yh = Math.atan2(-eyV.x, -eyV.z); let fy = yh - hd.root.rotation.y; fy = Math.atan2(Math.sin(fy), Math.cos(fy)); hd.root.rotation.y += fy * k;
    hd.tilt.rotation.x += ((ey.flip ? -Math.PI / 2 : -0.14 + ey.dTilt) - hd.tilt.rotation.x) * k;
    if (ey.flip) { ey.spin = ey.spin % (Math.PI * 2); if (ey.spin > Math.PI) ey.spin -= Math.PI * 2; ey.spin += (0 - ey.spin) * k; ey.dSpin = 0; }
    else { ey.spin += dt * 0.45 + ey.dSpin; ey.dSpin = 0; }
    hd.spin.rotation.y = ey.spin; hd.set(1);
    const metin = ey.flip ? 'Altında yazan yazıya bak.' : 'Parmağınla çevirip her yerine bak.';
    if (yonKutu.textContent !== metin) yonKutu.textContent = metin; yonKutu.classList.add('acik');
  } else if (ey.durum === 'geri') {
    const k = Math.min(1, dt * 2.6);
    hd.root.position.x += (sk.x - hd.root.position.x) * k; hd.root.position.y += (0.75 - hd.root.position.y) * k; hd.root.position.z += (sk.z - hd.root.position.z) * k;
    hd.root.scale.setScalar(Math.max(0.05, hd.root.scale.x + (0.05 - hd.root.scale.x) * k)); ey.spin += dt * 3; hd.spin.rotation.y = ey.spin;
    hd.tilt.rotation.x += (0 - hd.tilt.rotation.x) * k;
    ey.dT += dt;
    if (ey.dT > 1.3) { hd.root.visible = false; hd.set(0); sk.aci += (0 - sk.aci) * Math.min(1, dt * 3); sk.hinge.rotation.x = sk.aci; sk.huzme.material.opacity *= 0.9;
      if (Math.abs(sk.aci) < 0.05) { sk.aci = 0; sk.hinge.rotation.x = 0; sk.huzme.material.opacity = 0; ey.durum = 'sandik'; } }
  } else if (ey.durum === 'ucus' || ey.durum === 'asili') {
    const hy = 3.4 + (ey.durum === 'asili' ? Math.sin(t * 1.1) * 0.18 : 0), k = Math.min(1, dt * (ey.durum === 'ucus' ? 1.15 : 3));
    hd.root.position.x += (EX - hd.root.position.x) * k; hd.root.position.y += (hy - hd.root.position.y) * k; hd.root.position.z += (EZ - hd.root.position.z) * k;
    hd.root.scale.setScalar(hd.root.scale.x + (0.66 - hd.root.scale.x) * k);
    let fy = -hd.root.rotation.y; fy = Math.atan2(Math.sin(fy), Math.cos(fy)); hd.root.rotation.y += fy * k;
    hd.tilt.rotation.x += (0 - hd.tilt.rotation.x) * k;
    ey.spin += dt * 0.5; hd.spin.rotation.y = ey.spin; hd.set(1); hd.halo.material.opacity = 0.6 + 0.25 * Math.sin(t * 2);
    if (ey.durum === 'ucus' && Math.hypot(hd.root.position.x - EX, hd.root.position.y - 3.4, hd.root.position.z - EZ) < 0.3) {
      ey.durum = 'asili'; kalpPatlat(); ey.finalYazi = true; ey.finalBitis = simdi + 9000;
    }
  }
  if (ey.finalYazi) { if (simdi < ey.finalBitis) { yaziKutu.textContent = 'İyi ki o gün, iyi ki sen.'; yaziKutu.classList.add('acik'); } else { ey.finalYazi = false; yaziKutu.classList.remove('acik'); } }
}
acBtn.addEventListener('click', () => {
  if (ey.durum !== 'sandik') return;
  ey.durum = 'acilis'; ey.dT = 0; ey.kilit = true; acBtn.classList.remove('acik'); ey.geceHedef = Math.max(ey.geceHedef, 0.97);
  const sk = ey.sandik; kon.oto = { yaw: Math.atan2(-(sk.x - kon.x), -(sk.z - kon.z)), pitch: -0.25 };
  gicirti(1.8); kalpPatlat(); setTimeout(eyZilSesi, 700);
});
cevirBtn.addEventListener('click', () => { if (ey.durum !== 'incele') return; ey.flip = !ey.flip; cevirBtn.textContent = ey.flip ? 'Geri çevir' : 'Çevir'; });
geriBtn.addEventListener('click', () => {
  if (ey.durum !== 'incele') return;
  ey.durum = 'geri'; ey.dT = 0; ey.incele = false; ey.kilit = false; ey.flip = false; hdUI.classList.remove('acik'); yonKutu.classList.remove('acik');
});
tamamBtn.addEventListener('click', () => {
  if (ey.durum !== 'incele') return;
  ey.durum = 'ucus'; ey.incele = false; ey.kilit = false; ey.flip = false; hdUI.classList.remove('acik'); ey.geceHedef = 1; yonKutu.classList.remove('acik'); eyZilSesi();
});
function eyKusSesi() {
  try {
    if (!sesBagl) return;
    const c = sesBagl, t = c.currentTime, n = 2 + Math.floor(Math.random() * 3), f0 = 2200 + Math.random() * 1600;
    for (let i = 0; i < n; i++) {
      const o = c.createOscillator(), g = c.createGain(), t0 = t + i * 0.13;
      o.type = 'sine'; o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(f0 * 1.35, t0 + 0.06); o.frequency.exponentialRampToValueAtTime(f0 * 0.9, t0 + 0.1);
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.022, t0 + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.11);
      o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + 0.13);
    }
  } catch (e) {}
}
eyBtn.addEventListener('click', () => {
  if (!ey.aktif) return;
  if (ey.bisik) { ey.bisik = false; kon.vx = 0; kon.vz = 0; return; }
  if (ey.yakinBisik >= 0) { ey.bisik = true; ey.bindi = true; ey.bisikNo = ey.yakinBisik; kon.vx = 0; kon.vz = 0; }
});

// ---------- Kapadokya: peri bacaları etrafında ATV turu ----------
const KX = 6000, KZ = -3000, KP_MERKEZ = 13.5, KP_TUR0 = 15, KP_TUR1 = 27, KP_DUVAR = 36;
const KP_FOTO = ['foto/kapadokya-1.jpg', 'foto/kapadokya-2.jpg', 'foto/kapadokya-3.jpg', 'video/kapadokya-1.mp4', 'foto/kapadokya-5.jpg', 'foto/kapadokya-6.jpg', 'foto/kapadokya-7.jpg', 'foto/kapadokya-8.jpg', 'foto/kapadokya-9.jpg', 'video/kapadokya-2.mp4', 'foto/kapadokya-11.jpg'];   // sırayla duvara dizilir; .mp4 olanlar video
const KP_KAPI_TH = (KP_FOTO.length + 1) * Math.PI * 2 / (KP_FOTO.length + 2);
const kp = { aktif: false, hazir: false, grup: null, durum: 'yok', kilit: false, atv: false, atvG: null, teker: [], kask: [], sektor: new Array(16).fill(false), sektorSay: 0, altin: 0, altinHedef: 0,
  kapiD: null, foto: [], toz: [], havaToz: [], hizCarp: 1, tozSira: 0, sonToz: 0, gok2: null, gunes: null, hemi: null, gun: null, t0: 0, ok: null, parla: null, bulut: [], yazi: '', yaziBitis: 0, girildi: false, yakin: -1, son: -1, tur: false };
const atvBtn = document.getElementById('atvBtn');
const KP_TEPE = [[1.05, 1.3, 0.16], [2.05, -1.15, 0.17], [3.5, 1.1, 0.15], [4.55, -1.0, 0.16]];   // [açı, yükseklik (+ rampa, − çukur), genişlik]
function kpYuk(x, z) {   // tur yolundaki hafif inişli çıkışlı arazi
  const dx = x - KX, dz = z - KZ, r = Math.hypot(dx, dz); if (r < 12 || r > 30) return 0;
  const th = Math.atan2(dx, dz); let h = 0;
  KP_TEPE.forEach(f => { const d = Math.atan2(Math.sin(th - f[0]), Math.cos(th - f[0])); h += f[1] * Math.exp(-d * d / (2 * f[2] * f[2])); });
  return h * yumusak(12, 16, r) * (1 - yumusak(26, 30, r));
}
function kpKapiAcisi(x, z) { return Math.abs(Math.atan2(Math.sin(Math.atan2(x - KX, z - KZ) - KP_KAPI_TH), Math.cos(Math.atan2(x - KX, z - KZ) - KP_KAPI_TH))); }
function kpKaya(rx, ry, rz, tohum, renk1, renk2, kapRenk) {   // peri bacası tarzı oyuklu kaya kütlesi
  const geo = new THREE.IcosahedronGeometry(1, 8), p = geo.attributes.position, renk = new Float32Array(p.count * 3), c1 = new THREE.Color(renk1), c2 = new THREE.Color(renk2), ck = new THREE.Color(kapRenk), c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i); const y01 = (y + 1) / 2, taper = 1 - 0.38 * y01 * y01;
    const n = 0.1 * Math.sin(x * 5.3 + tohum) * Math.sin(z * 4.1 + tohum * 1.7) + 0.07 * Math.sin(y * 9 + x * 3 + tohum) + 0.04 * Math.sin(x * 17 + z * 13 + tohum);
    const ny = y < -0.88 ? -0.88 : y;
    p.setXYZ(i, x * rx * taper * (1 + n), ny * ry, z * rz * taper * (1 + n));
    const kat = 0.5 + 0.5 * Math.sin(y * 16 + n * 6);
    c.copy(c1).lerp(c2, kat * 0.8); if (y01 > 0.84) c.lerp(ck, Math.min(1, (y01 - 0.84) * 9)); c.multiplyScalar(1 - Math.max(0, -n) * 1.6);
    renk[i * 3] = c.r; renk[i * 3 + 1] = c.g; renk[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(renk, 3)); geo.computeVertexNormals();
  return new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true }));
}
function kpAtvYap() {   // kırmızı ATV: ön tarafı yerel −z'ye bakar
  const g = new THREE.Group(), M = (r, k, s) => new THREE.MeshPhongMaterial({ color: r, shininess: k || 20, specular: s || 0x222222 });
  const kirmizi = M(0xc62828, 60, 0x663333), siyah = M(0x18181b, 20), gumus = M(0xc9ccd2, 80);
  const kt = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); g.add(m); return m; };
  kt(0.95, 0.34, 1.7, kirmizi, 0, 0.55, 0);                    // gövde / depo
  kt(1.0, 0.12, 0.7, kirmizi, 0, 0.62, -0.8).rotation.x = 0.12;  // ön çamurluk
  kt(0.6, 0.12, 0.7, siyah, 0, 0.78, 0.35);                    // koltuk
  kt(0.9, 0.04, 0.55, siyah, 0, 0.7, 0.95);                    // arka sepet
  [[-0.42, 0.6], [0.42, 0.6]].forEach(p => { kt(0.03, 0.2, 0.03, siyah, p[0], 0.8, 0.95 + 0.02); });
  const gidon = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.85, 8), siyah); gidon.rotation.z = Math.PI / 2; gidon.position.set(0, 1.0, -0.38); g.add(gidon);
  kt(0.05, 0.4, 0.05, siyah, 0, 0.85, -0.38);
  const far = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfff1c0 })); far.position.set(0, 0.7, -1.02); g.add(far);
  [[-0.7, -0.62], [0.7, -0.62], [-0.7, 0.68], [0.7, 0.68]].forEach(t => {
    const w = new THREE.Group(); w.position.set(t[0], 0.36, t[1]); g.add(w);
    const lastik = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.3, 18), siyah); lastik.rotation.z = Math.PI / 2; w.add(lastik);
    for (let k = 0; k < 10; k++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.07), M(0x2a2a2e)); const a = k * Math.PI / 5; b.position.set(0, Math.sin(a) * 0.37, Math.cos(a) * 0.37); b.rotation.x = -a; w.add(b); }
    const jant = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.31, 14), gumus); jant.rotation.z = Math.PI / 2; w.add(jant);
    kp.teker.push(w);
  });
  return g;
}
function kpKaskYap(renk, r) {
  const g = new THREE.Group();
  const kabuk = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.58), new THREE.MeshPhongMaterial({ color: renk, shininess: 110, specular: 0xffffff })); g.add(kabuk);
  const siper = new THREE.Mesh(new THREE.SphereGeometry(r * 1.04, 14, 6, -Math.PI / 2 - 0.95, 1.9, Math.PI * 0.34, Math.PI * 0.16), new THREE.MeshPhongMaterial({ color: 0x15151c, shininess: 160, specular: 0xffffff })); siper.position.y = -0.002; g.add(siper);
  [-Math.PI / 2 - 0.18, Math.PI / 2 - 0.18].forEach(ph => { const serit = new THREE.Mesh(new THREE.SphereGeometry(r * 1.02, 18, 4, ph, 0.36, 0, Math.PI * 0.5), new THREE.MeshPhongMaterial({ color: 0xf2e6c2, shininess: 40 })); g.add(serit); });
  return g;
}

function kpKur() {
  if (kp.hazir) return; kp.hazir = true;
  const g = new THREE.Group(); g.visible = false; sahne.add(g); kp.grup = g;
  let sd = 31; const rnd = () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; };
  const tuval = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const P = (th, r) => [KX + Math.sin(th) * r, KZ + Math.cos(th) * r];
  const dm = new THREE.Object3D();
  // gökyüzü: gün ortası mavisi + üstüne binen altın saat gökyüzü
  const gok = (renkler) => { const c = tuval(8, 256), x = c.getContext('2d'), gr = x.createLinearGradient(0, 0, 0, 256); renkler.forEach(s => gr.addColorStop(s[0], s[1])); x.fillStyle = gr; x.fillRect(0, 0, 8, 256); return new THREE.CanvasTexture(c); };
  const kubbe = new THREE.Mesh(new THREE.SphereGeometry(1500, 24, 14), new THREE.MeshBasicMaterial({ map: gok([[0, '#2a76db'], [0.28, '#58a3ea'], [0.44, '#a7d0f0'], [0.5, '#d8e9f3'], [0.52, '#c9b48a'], [1, '#8b7452']]), side: THREE.BackSide, fog: false, depthWrite: false }));
  kubbe.position.set(KX, 0, KZ); kubbe.renderOrder = -3; g.add(kubbe);
  kp.gok2 = new THREE.Mesh(new THREE.SphereGeometry(1490, 24, 14), new THREE.MeshBasicMaterial({ map: gok([[0, '#27508f'], [0.3, '#7b79ad'], [0.43, '#f0a263'], [0.5, '#fbd09a'], [0.52, '#c9996a'], [1, '#6b4a38']]), side: THREE.BackSide, fog: false, depthWrite: false, transparent: true, opacity: 0 }));
  kp.gok2.position.set(KX, 0, KZ); kp.gok2.renderOrder = -2; g.add(kp.gok2);
  const sc = tuval(256, 256), sx = sc.getContext('2d'), sg = sx.createRadialGradient(128, 128, 0, 128, 128, 128);
  sg.addColorStop(0, 'rgba(255,252,235,1)'); sg.addColorStop(0.16, 'rgba(255,240,200,1)'); sg.addColorStop(0.22, 'rgba(255,214,150,.6)'); sg.addColorStop(0.55, 'rgba(255,190,130,.2)'); sg.addColorStop(1, 'rgba(255,180,120,0)'); sx.fillStyle = sg; sx.fillRect(0, 0, 256, 256);
  kp.gunes = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(sc), fog: false, depthWrite: false, transparent: true })); kp.gunes.scale.set(520, 520, 1); g.add(kp.gunes);
  const bc = tuval(256, 128), bx = bc.getContext('2d');
  [[70, 78, 46], [118, 60, 54], [170, 72, 50], [210, 84, 34], [120, 90, 46]].forEach(b => { const rg = bx.createRadialGradient(b[0], b[1], 0, b[0], b[1], b[2]); rg.addColorStop(0, 'rgba(255,255,255,.95)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); bx.fillStyle = rg; bx.fillRect(0, 0, 256, 128); });
  const bdoku = new THREE.CanvasTexture(bc);
  for (let i = 0; i < 12; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: bdoku, fog: false, depthWrite: false, transparent: true, opacity: 0.85 })); const a = rnd() * 6.28, r = 500 + rnd() * 800, w = 300 + rnd() * 260; s.scale.set(w, w * 0.4, 1); s.position.set(KX + Math.cos(a) * r, 190 + rnd() * 200, KZ + Math.sin(a) * r); g.add(s); kp.bulut.push(s); }
  // zemin: kum-toprak
  const zc = tuval(256, 256), zx = zc.getContext('2d'); zx.fillStyle = '#c9aa7a'; zx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 3200; i++) { zx.fillStyle = ['#d3b787', '#bd9d6c', '#c4a374', '#dbc397'][i % 4]; zx.fillRect(rnd() * 256, rnd() * 256, 1 + rnd() * 3, 1 + rnd() * 3); }
  const zd = new THREE.CanvasTexture(zc); zd.wrapS = zd.wrapT = THREE.RepeatWrapping; zd.repeat.set(220, 220);
  const zemin = new THREE.Mesh(new THREE.RingGeometry(30, 1300, 64, 1), new THREE.MeshLambertMaterial({ map: zd })); zemin.rotation.x = -Math.PI / 2; zemin.position.set(KX, 0, KZ); g.add(zemin);
  const orta = new THREE.Mesh(new THREE.CircleGeometry(12.2, 48), new THREE.MeshLambertMaterial({ color: 0xc9aa7a })); orta.rotation.x = -Math.PI / 2; orta.position.set(KX, 0, KZ); g.add(orta);
  // tur yolu: iniş-çıkışlı halka (doku: kum zemin, toprak yol, tekerlek izleri)
  const hc = tuval(1024, 1024), hx = hc.getContext('2d'), pm = 1024 / 60; hx.fillStyle = '#c9aa7a'; hx.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 9000; i++) { hx.fillStyle = ['#d3b787', '#bd9d6c', '#c4a374', '#dbc397'][i % 4]; hx.fillRect(rnd() * 1024, rnd() * 1024, 1 + rnd() * 4, 1 + rnd() * 4); }
  hx.strokeStyle = '#bd9a68'; hx.lineWidth = (KP_TUR1 - KP_TUR0) * pm; hx.beginPath(); hx.arc(512, 512, (KP_TUR0 + KP_TUR1) / 2 * pm, 0, 7); hx.stroke();
  for (let i = 0; i < 7000; i++) { const a = rnd() * 6.283, r = KP_TUR0 + rnd() * (KP_TUR1 - KP_TUR0); hx.fillStyle = ['#c7a672', '#b08e5c', '#cdb07c'][i % 3]; hx.fillRect(512 + Math.cos(a) * r * pm, 512 + Math.sin(a) * r * pm, 2 + rnd() * 3, 2 + rnd() * 3); }
  hx.strokeStyle = '#9a7a4f'; hx.globalAlpha = 0.8; hx.lineWidth = 0.28 * pm; [17.2, 18.4, 21.2, 22.4, 24.6].forEach(r => { hx.beginPath(); hx.arc(512, 512, r * pm, 0, 7); hx.stroke(); }); hx.globalAlpha = 1;
  const hg = new THREE.RingGeometry(12, 30, 360, 18); hg.rotateX(-Math.PI / 2); { const pp = hg.attributes.position; for (let i = 0; i < pp.count; i++) pp.setY(i, kpYuk(KX + pp.getX(i), KZ + pp.getZ(i))); hg.computeVertexNormals(); }
  const halka = new THREE.Mesh(hg, new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(hc) })); halka.position.set(KX, 0.01, KZ); g.add(halka);
  // kapıya giden toprak patika
  { const yk = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 12), new THREE.MeshLambertMaterial({ color: 0xbd9a68, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })); yk.rotation.x = -Math.PI / 2; yk.rotation.z = -KP_KAPI_TH + Math.PI; const pr = 31; yk.position.set(KX + Math.sin(KP_KAPI_TH) * pr, 0.03, KZ + Math.cos(KP_KAPI_TH) * pr); yk.rotation.set(-Math.PI / 2, 0, 0); yk.rotation.order = 'YXZ'; yk.rotation.y = KP_KAPI_TH; g.add(yk); }
  // ortadaki büyük kaya (fotoğraftaki gibi oyuklu), yanında daha küçük bej kaya
  const ana = kpKaya(7.2, 9.4, 6.6, 1.3, 0xb99a76, 0xa4845f, 0x6f5645); ana.position.set(KX + 0.5, 9.4 * 0.88, KZ - 0.5); g.add(ana);
  const kucuk = kpKaya(3.8, 5.0, 3.6, 4.2, 0xc4aa88, 0xb0936f, 0x8a7358); kucuk.position.set(KX - 8.6, 5.0 * 0.88, KZ + 2.5); g.add(kucuk);
  const oyukM = new THREE.MeshLambertMaterial({ color: 0x3a2a20 });
  for (let i = 0; i < 9; i++) { const th = rnd() * 6.28, y = 2.5 + rnd() * 11, yl = (y - 9.4 * 0.88) / 9.4, y01 = (yl + 1) / 2, rr = 7.2 * (1 - 0.38 * y01 * y01) * Math.sqrt(Math.max(0.05, 1 - yl * yl)) * 0.96; const o = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), oyukM); o.scale.set(0.7 + rnd() * 0.6, 0.9 + rnd() * 0.8, 0.85); o.position.set(KX + 0.5 + Math.sin(th) * rr, y, KZ - 0.5 + Math.cos(th) * rr * 0.92); o.lookAt(KX + 0.5, y, KZ - 0.5); g.add(o); }
  // peri bacaları
  const pt = [[0, 0], [1.05, 0], [0.98, 0.6], [0.72, 3.0], [0.46, 5.6], [0.36, 7.4], [0.32, 8.0]].map(a => new THREE.Vector2(a[0], a[1]));
  const bacaG = new THREE.LatheGeometry(pt, 14);
  const dc = tuval(64, 256), dxx = dc.getContext('2d'); dxx.fillStyle = '#c8ad88'; dxx.fillRect(0, 0, 64, 256);
  for (let y = 0; y < 256; y += 6) { dxx.fillStyle = 'rgba(' + (rnd() < 0.5 ? '120,90,60' : '230,205,170') + ',' + (0.1 + rnd() * 0.15) + ')'; dxx.fillRect(0, y, 64, 2 + rnd() * 3); }
  const bacaM = new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(dc) }), basM = new THREE.MeshLambertMaterial({ color: 0x5c4637 });
  const bacaList = [[-11, -3, 0.9], [-9.5, -8.5, 0.75], [-3, -11.5, 1.0], [5.5, -11, 0.85], [10.5, -6, 1.05], [11.5, 1.5, 0.8], [9.5, 8, 0.95], [3.5, 11, 0.7], [-4.5, 10.5, 0.9], [-12, 5.5, 0.7], [0.5, -9.2, 0.6], [-13.1, -8, 0.6]];
  bacaList.forEach((b, i) => { const sc = b[2] * (0.9 + rnd() * 0.3), m = new THREE.Mesh(bacaG, bacaM); m.scale.set(sc, sc, sc); m.position.set(KX + b[0], 0, KZ + b[1]); m.rotation.y = rnd() * 6; g.add(m);
    const k = new THREE.Mesh(new THREE.SphereGeometry(0.62, 10, 8), basM); k.scale.set(1, 0.52, 1); k.position.set(KX + b[0], 8.0 * sc + 0.05, KZ + b[1]); k.scale.multiplyScalar(sc); g.add(k); });
  // tüf kayalık tepecikler (krem-beyaz) ve uzak mesalar
  const krem = new THREE.MeshLambertMaterial({ color: 0xe6d8bf });
  for (let i = 0; i < 26; i++) { const a = rnd() * 6.28, r = 12 + rnd() * 2 + (i % 2) * 18 + rnd() * 6; if (r > KP_TUR0 - 1.5 && r < KP_TUR1 + 1) continue; if (r > 24 && Math.abs(Math.atan2(Math.sin(a - KP_KAPI_TH), Math.cos(a - KP_KAPI_TH))) < 0.2) continue; const s = 1.5 + rnd() * 3, m = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 7), krem); m.scale.set(s * 1.8, s * 0.7, s * 1.3); m.position.set(KX + Math.sin(a) * r, 0.1, KZ + Math.cos(a) * r); m.rotation.y = rnd() * 3; g.add(m); }
  for (let i = 0; i < 14; i++) { const a = i / 14 * 6.28 + rnd() * 0.3, r = 420 + rnd() * 380, s = 90 + rnd() * 120, m = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), new THREE.MeshLambertMaterial({ color: [0xc8a982, 0xd6bd98, 0xb89572][i % 3] })); m.scale.set(s * 1.7, s * 0.4, s); m.position.set(KX + Math.cos(a) * r, 0, KZ + Math.sin(a) * r); m.rotation.y = rnd() * 3; g.add(m); }
  // vadi duvarı (fotoğrafların asıldığı kaya cephe) + tepesinde kaya kütleleri
  const dk = tuval(512, 256), dx3 = dk.getContext('2d'); dx3.fillStyle = '#c9ad86'; dx3.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 260; i++) { dx3.fillStyle = 'rgba(' + (rnd() < 0.5 ? '120,88,58' : '236,214,180') + ',' + (0.05 + rnd() * 0.13) + ')'; dx3.fillRect(rnd() * 512, rnd() * 40, 1 + rnd() * 5, 60 + rnd() * 200); }
  for (let y = 0; y < 256; y += 14) { dx3.fillStyle = 'rgba(110,80,52,' + (0.05 + rnd() * 0.1) + ')'; dx3.fillRect(0, y, 512, 1 + rnd() * 3); }
  const dd = new THREE.CanvasTexture(dk); dd.wrapS = dd.wrapT = THREE.RepeatWrapping; dd.repeat.set(10, 1);
  const duvar = new THREE.Mesh(new THREE.CylinderGeometry(KP_DUVAR + 0.2, KP_DUVAR + 0.2, 26, 80, 1, true), new THREE.MeshLambertMaterial({ map: dd, side: THREE.DoubleSide })); duvar.position.set(KX, 13, KZ); g.add(duvar);
  for (let i = 0; i < 34; i++) { const a = i / 34 * 6.28 + rnd() * 0.1, s = 3 + rnd() * 5, m = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshLambertMaterial({ color: [0xb89572, 0xc9ad86, 0xa88562][i % 3] })); m.scale.set(s, s * (0.8 + rnd() * 1.2), s); m.position.set(KX + Math.sin(a) * (KP_DUVAR + 1), 25 + rnd() * 3, KZ + Math.cos(a) * (KP_DUVAR + 1)); m.rotation.y = rnd() * 3; g.add(m); }
  // kuru çalılar
  const cal = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.5, 0), new THREE.MeshLambertMaterial({ color: 0xffffff }), 160);
  for (let i = 0; i < 160; i++) { const a = rnd() * 6.28, r = 12.5 + rnd() * 22; if ((r > KP_TUR0 - 0.5 && r < KP_TUR1 + 0.5) || (r > 24 && Math.abs(Math.atan2(Math.sin(a - KP_KAPI_TH), Math.cos(a - KP_KAPI_TH))) < 0.2)) { i--; continue; } dm.position.set(KX + Math.sin(a) * r, 0.25 + kpYuk(KX + Math.sin(a) * r, KZ + Math.cos(a) * r), KZ + Math.cos(a) * r); dm.rotation.set(rnd(), rnd(), rnd()); dm.scale.set(0.8 + rnd(), 0.45 + rnd() * 0.5, 0.8 + rnd()); dm.updateMatrix(); cal.setMatrixAt(i, dm.matrix); cal.setColorAt(i, new THREE.Color([0x8c7a4a, 0x6b5b38, 0xa69258, 0x7d6c40][i % 4])); }
  g.add(cal);
  // ATV
  kp.atvG = kpAtvYap(); kp.atvG.position.set(KX, 0, KZ + 19.2); g.add(kp.atvG);
  // kasklar (yerde)
  [[0xff6fa5, 0.095], [0x23356b, 0.082], [0x23356b, 0.082]].forEach((k, i) => { const kg = kpKaskYap(k[0], k[1]); kg.position.set(KX + [-0.8, 0, 0.8][i], 0.07, KZ + 21.6); kg.rotation.set(0, i * 0.7, 0); kg.scale.setScalar(2.6); g.add(kg); kp.kask.push({ g: kg, hedef: [[-0.36, 0.66, 0], [0.16, 0.545, 0], [0.56, 0.545, 0]][i], bas: null, bit: false, git: false, st: 0, parla: null }); });
  // ATV'yi gösteren ok ve parıltı
  const pl = tuval(128, 128), px = pl.getContext('2d'), pg = px.createRadialGradient(64, 64, 0, 64, 64, 64); pg.addColorStop(0, 'rgba(255,214,150,.9)'); pg.addColorStop(1, 'rgba(255,200,120,0)'); px.fillStyle = pg; px.fillRect(0, 0, 128, 128);
  const pdoku = new THREE.CanvasTexture(pl);
  kp.parla = new THREE.Sprite(new THREE.SpriteMaterial({ map: pdoku, fog: false, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending, opacity: 0 })); kp.parla.scale.set(4.2, 4.2, 1); kp.parla.position.set(KX, 0.9, KZ + 19.2); g.add(kp.parla);
  kp.kask.forEach(k => { const p = new THREE.Sprite(new THREE.SpriteMaterial({ map: pdoku, fog: false, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending, opacity: 0.6 })); p.scale.set(2.6, 2.6, 1); p.position.set(k.g.position.x, 0.5, k.g.position.z); g.add(p); k.parla = p; });
  kp.ok = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.6, 4), new THREE.MeshBasicMaterial({ color: 0xffd98a, fog: false })); kp.ok.rotation.x = Math.PI; kp.ok.visible = false; g.add(kp.ok);
  // toz bulutları
  const tc = tuval(64, 64), tx = tc.getContext('2d'), tg = tx.createRadialGradient(32, 32, 0, 32, 32, 32); tg.addColorStop(0, 'rgba(214,190,150,.7)'); tg.addColorStop(1, 'rgba(214,190,150,0)'); tx.fillStyle = tg; tx.fillRect(0, 0, 64, 64);
  const tdoku = new THREE.CanvasTexture(tc);
  for (let i = 0; i < 150; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tdoku, depthWrite: false, transparent: true, opacity: 0, fog: true })); s.visible = false; g.add(s); kp.toz.push({ s, t: 9, x: 0, y: 0, z: 0, vx: 0, vz: 0, boy: 1 }); }
  for (let i = 0; i < 26; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tdoku, depthWrite: false, transparent: true, opacity: 0.1, fog: true })); const a = rnd() * 6.28, r = 14 + rnd() * 20, w = 9 + rnd() * 9; s.scale.set(w, w * 0.45, 1); s.position.set(KX + Math.sin(a) * r, 1.2 + rnd() * 2.5, KZ + Math.cos(a) * r); g.add(s); kp.havaToz.push({ s, f: rnd() * 6 }); }
  // fotoğraf çerçeveleri (kaya cephede)
  const FW = 4.4, FH = 3.6, FY = 4.9, lc = tuval(128, 128), lx = lc.getContext('2d'), lg = lx.createRadialGradient(64, 64, 0, 64, 64, 64); lg.addColorStop(0, 'rgba(255,214,150,.9)'); lg.addColorStop(1, 'rgba(255,200,120,0)'); lx.fillStyle = lg; lx.fillRect(0, 0, 128, 128);
  const ldoku = new THREE.CanvasTexture(lc);
  KP_FOTO.forEach((dosya, i) => {
    const th = (i + 1) * Math.PI * 2 / (KP_FOTO.length + 2), R = KP_DUVAR + 0.12, px0 = KX + Math.sin(th) * R, pz0 = KZ + Math.cos(th) * R, rot = th + Math.PI, ic = Math.sin(th), ic2 = Math.cos(th);
    const cer = new THREE.Mesh(new THREE.BoxGeometry(FW + 0.34, FH + 0.34, 0.14), new THREE.MeshLambertMaterial({ color: 0x6a4a2c })); cer.position.set(px0 + ic * 0.07, FY, pz0 + ic2 * 0.07); cer.rotation.y = rot; g.add(cer);
    const yc = tuval(512, 512), yx = yc.getContext('2d'), yg = yx.createLinearGradient(0, 0, 0, 512); yg.addColorStop(0, '#79b3ea'); yg.addColorStop(1, '#e8b27c'); yx.fillStyle = yg; yx.fillRect(0, 0, 512, 512); yx.fillStyle = 'rgba(255,240,225,.85)'; yx.font = '170px serif'; yx.textAlign = 'center'; yx.textBaseline = 'middle'; yx.fillText('♥', 256, 256);
    const net = new THREE.Mesh(new THREE.PlaneGeometry(FW, FH), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(yc), color: 0x666666, fog: false })); net.position.set(px0 - ic * 0.005, FY, pz0 - ic2 * 0.005); net.rotation.y = rot; g.add(net);
    const kayit = { net, bul: { material: { color: new THREE.Color(), opacity: 1 } }, px: px0 - ic * 5, pz: pz0 - ic2 * 5 }; kp.foto.push(kayit);
    const lamba = new THREE.Sprite(new THREE.SpriteMaterial({ map: ldoku, fog: false, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending, opacity: 0.35 })); lamba.scale.set(5, 5, 1); lamba.position.set(px0 - ic * 0.8, FY + FH / 2 + 0.9, pz0 - ic2 * 0.8); g.add(lamba);
    if (/\.mp4$/.test(dosya)) {
      const v = document.createElement('video'); v.src = dosya; v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.setAttribute('muted', ''); v.preload = 'auto';
      v.addEventListener('loadeddata', () => { if (v.paused) v.currentTime = 0.1; });
      v.addEventListener('loadedmetadata', () => { const oran = v.videoWidth / v.videoHeight, gen = Math.min(6.2, FH * oran); net.scale.x = gen / FW; cer.scale.x = (gen + 0.34) / (FW + 0.34); });
      const vt = new THREE.VideoTexture(v); vt.minFilter = THREE.LinearFilter; vt.magFilter = THREE.LinearFilter; vt.generateMipmaps = false;
      net.material.map = vt; net.material.needsUpdate = true; kayit.video = v; kayit.oynuyor = false;
    } else if (dosya) new THREE.TextureLoader().load(dosya, tex => {
      tex.anisotropy = 8; const oran = tex.image.width / tex.image.height, gen = Math.min(6.2, FH * oran);
      net.material.map = tex; net.material.needsUpdate = true; net.scale.x = gen / FW; cer.scale.x = (gen + 0.34) / (FW + 0.34);
      const bcv = tuval(18, Math.max(8, Math.round(18 / oran))); bcv.getContext('2d').drawImage(tex.image, 0, 0, bcv.width, bcv.height);
      const bt = new THREE.CanvasTexture(bcv); bt.magFilter = THREE.LinearFilter; bt.minFilter = THREE.LinearFilter;
      const bul = new THREE.Mesh(new THREE.PlaneGeometry(gen, FH), new THREE.MeshBasicMaterial({ map: bt, color: 0x444444, transparent: true, fog: false })); bul.position.set(px0 - ic * 0.01, FY, pz0 - ic2 * 0.01); bul.rotation.y = rot; g.add(bul); kayit.bul = bul;
    }, undefined, () => {});
  });
  // tur sonunda açılan kapı (kaya cephede), şimdilik arkası boş
  { const R = KP_DUVAR + 0.1, kd = { th: KP_KAPI_TH, x: KX + Math.sin(KP_KAPI_TH) * R, z: KZ + Math.cos(KP_KAPI_TH) * R, acik: false, aci: 0, hinge: null, panel: null, kilit: null };
    kp.kapiD = kd; const kg = new THREE.Group(); kg.position.set(kd.x, 0, kd.z); kg.rotation.y = KP_KAPI_TH + Math.PI; kg.scale.setScalar(1.7); g.add(kg);
    const tas = new THREE.MeshLambertMaterial({ color: 0x8f7355 });
    [-1, 1].forEach(y => { const k = new THREE.Mesh(new THREE.BoxGeometry(0.26, 2.7, 0.2), tas); k.position.set(y * 0.78, 1.3, 0.06); kg.add(k); });
    const ust = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.26, 0.2), tas); ust.position.set(0, 2.6, 0.06); kg.add(ust);
    const kemer = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.13, 8, 20, Math.PI), tas); kemer.position.set(0, 2.62, 0.06); kg.add(kemer);
    const pk = tuval(512, 1024), pkx = pk.getContext('2d'), pkg = pkx.createRadialGradient(256, 520, 10, 256, 520, 560); pkg.addColorStop(0, '#fff6dc'); pkg.addColorStop(0.5, '#ffc98a'); pkg.addColorStop(1, '#c7607a'); pkx.fillStyle = pkg; pkx.fillRect(0, 0, 512, 1024);
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 2.4), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(pk), fog: false })); panel.position.set(0, 1.2, -0.03); panel.visible = false; kg.add(panel); kd.panel = panel;
    const dk2 = tuval(512, 1024), d2 = dk2.getContext('2d'), dt2 = new THREE.CanvasTexture(dk2);
    function kapiCiz() { d2.fillStyle = '#4e2a1c'; d2.fillRect(0, 0, 512, 1024); for (let i = 0; i < 12; i++) { d2.fillStyle = 'rgba(0,0,0,.2)'; d2.fillRect(i * 43, 0, 3, 1024); } d2.fillStyle = '#2a2a2e'; [160, 520, 880].forEach(y => d2.fillRect(0, y, 512, 22));
      const al = d2.createLinearGradient(0, 0, 512, 1024); al.addColorStop(0, '#fff3cf'); al.addColorStop(0.5, '#d9a94f'); al.addColorStop(1, '#f7e2a6'); d2.fillStyle = al; d2.textAlign = 'center'; d2.textBaseline = 'middle'; d2.font = '78px "Great Vibes", cursive'; d2.fillText('Henüz yazılmamış', 256, 250); d2.fillText('sayfalar,', 256, 345); d2.fillText('birlikte', 256, 470); d2.fillText('yazacağız.', 256, 565); d2.font = '170px serif'; d2.fillText('♥', 256, 780); dt2.needsUpdate = true; }
    kapiCiz(); if (document.fonts && document.fonts.load) document.fonts.load('100px "Great Vibes"', 'Henüz yazılmamış sayfalar birlikte yazacağız').then(kapiCiz).catch(() => {});
    const hg = new THREE.Group(); hg.position.set(-0.65, 0, 0.06); kg.add(hg); kd.hinge = hg;
    const kanat = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 2.35), new THREE.MeshBasicMaterial({ map: dt2, color: 0xcfcfcf, fog: false, side: THREE.DoubleSide })); kanat.position.set(0.65, 1.175, 0); hg.add(kanat); }
  // ışıklar
  kp.hemi = new THREE.HemisphereLight(0xdfeeff, 0xb59870, 1.0); kp.hemi.visible = false; sahne.add(kp.hemi);
  kp.gun = new THREE.DirectionalLight(0xfff2e0, 0.9); kp.gun.position.set(KX - 300, 560, KZ - 1000); kp.gun.target.position.set(KX, 0, KZ); sahne.add(kp.gun.target); kp.gun.visible = false; sahne.add(kp.gun);
  g.traverse(o => { if (o.isInstancedMesh) o.frustumCulled = false; });
}

function kpAc() {
  if (kp.aktif || kp.bekle) return; kp.bekle = true; kpKur();
  gecisKutu.classList.add('acik');
  setTimeout(() => {
    ey.aktif = false; ey.bisik = false; ey.kilit = false; ey.grup.visible = false; [ey.hemi, ey.gun].forEach(l => { l.visible = false; }); ey.mumIsik.forEach(l => { l.visible = false; });
    soru5.classList.remove('acik'); eyBtn.classList.remove('acik'); acBtn.classList.remove('acik'); hdUI.classList.remove('acik'); yaziKutu.classList.remove('acik');
    kp.aktif = true; kp.girildi = true; kp.grup.visible = true; kp.hemi.visible = true; kp.gun.visible = true; kp.durum = 'giris'; kp.kilit = true; kp.t0 = performance.now() / 1000;
    sahne.fog = new THREE.FogExp2(0xcde3f2, 0.0019); sahne.background = new THREE.Color(0xcde3f2); kamera.far = 3200; kamera.updateProjectionMatrix();
    kon.x = KX; kon.z = KZ + 23.8; kon.vx = 0; kon.vz = 0; kon.yaw = 0; kon.pitch = -0.1; kon.oto = null; ikiliYon = 0; ikili.visible = true;
    kp.sonIsik = -1; gecisKutu.classList.remove('acik');
  }, 650);
}
function kpSinir() {
  const dx = kon.x - KX, dz = kon.z - KZ, r = Math.hypot(dx, dz);
  const ic = KP_MERKEZ + 1.2, dis = kpKapiAcisi(kon.x, kon.z) < 0.09 ? KP_DUVAR - 0.9 : KP_DUVAR - 2.5;
  if (r < ic) { const k = ic / (r || 1); kon.x = KX + dx * k; kon.z = KZ + dz * k; }
  else if (r > dis) { const k = dis / r; kon.x = KX + dx * k; kon.z = KZ + dz * k; }
}
function kpYaz(metin) { if (kp.yazi !== metin) { kp.yazi = metin; yonKutu.textContent = metin; } yonKutu.classList.add('acik'); }
function kpToz(x, z, buyuk) { const p = kp.toz[kp.tozSira = (kp.tozSira + 1) % kp.toz.length]; p.t = 0; p.x = x; p.y = 0.2 + Math.random() * 0.3 + kpYuk(x, z); p.z = z; p.vx = (Math.random() - 0.5) * 1.2 + 0.8; p.vz = (Math.random() - 0.5) * 1.2; p.boy = (buyuk ? 1.6 : 1) * (0.9 + Math.random() * 0.6); p.s.visible = true; }
const kpV = new THREE.Vector3();
function kpGuncelle(dt, simdi) {
  if (!kp.aktif) {   // Eymir'deki açık kapıdan içeri girince Kapadokya'ya geç
    const kd = ey.kapiD;
    if (ey.aktif && kd && kd.acik && kd.aci < -1.2 && !kp.girildi && Math.hypot(kon.x - kd.x, kon.z - kd.z) < 1.9) kpAc();
    return;
  }
  const t = simdi / 1000, gec = t - kp.t0;
  // bulutlar, güneş, altın saat
  kp.bulut.forEach(b => { b.position.x += 3 * dt; if (b.position.x > KX + 1300) b.position.x = KX - 1300; });
  kp.altin += (kp.altinHedef - kp.altin) * Math.min(1, dt * 0.25);
  if (Math.abs(kp.altin - kp.sonIsik) > 0.002) {
    kp.sonIsik = kp.altin; const a = kp.altin;
    kp.gok2.material.opacity = a; kp.gunes.position.set(KX - 300, 560 - 430 * a, KZ - 1000); kp.gunes.material.color.setRGB(1, 1 - 0.18 * a, 1 - 0.42 * a);
    kp.hemi.color.setRGB(0.87 + 0.13 * a, 0.93 - 0.07 * a, 1 - 0.3 * a); kp.hemi.groundColor.setRGB(0.71 - 0.1 * a, 0.6 - 0.1 * a, 0.44 - 0.08 * a); kp.hemi.intensity = 1.0 - 0.2 * a;
    kp.gun.position.y = 560 - 430 * a; kp.gun.color.setRGB(1, 0.95 - 0.28 * a, 0.88 - 0.48 * a); kp.gun.intensity = 0.9 - 0.05 * a;
    sahne.fog.color.setRGB(0.8 + 0.15 * a, 0.89 - 0.12 * a, 0.95 - 0.39 * a); sahne.background.copy(sahne.fog.color);
    kp.bulut.forEach(b => b.material.color.setRGB(1, 1 - 0.16 * a, 1 - 0.34 * a));
  }
  // giriş sahnesi: yazı → kasklar yerden kalkıp harflerin başına → ATV'ye bin
  if (kp.durum === 'giris') { kpYaz('Kaskları tak.'); if (gec > 2.6) { kp.durum = 'kask'; kp.kilit = false; } }
  else if (kp.durum === 'kask') {
    let bitti = 0;
    if (!kp.tetik && kp.kask.some(q => Math.hypot(kon.x - q.g.position.x, kon.z - q.g.position.z) < 1.2)) {   // birinin üstüne gidince üçü birden takılır
      kp.tetik = true; gicirti(0.5); kp.kask.forEach((q, j) => { q.git = true; q.bas = q.g.position.clone(); q.st = t + j * 0.22; });
    }
    kp.kask.forEach((k, i) => {
      if (k.bit) { bitti++; return; }
      if (!k.git) {
        k.parla.material.opacity = 0.35 + 0.4 * (0.5 + 0.5 * Math.sin(t * 4 + i)); k.g.position.y = 0.07 + 0.05 * Math.sin(t * 3 + i); k.g.rotation.y += dt * 0.8;
        return;
      }
      k.parla.visible = false;
      const p = sinir((t - k.st) / 1.5, 0, 1);
      govde.updateWorldMatrix(true, false); kpV.set(k.hedef[0], k.hedef[1], k.hedef[2]); govde.localToWorld(kpV);
      const e = p * p * (3 - 2 * p);
      k.g.position.set(k.bas.x + (kpV.x - k.bas.x) * e, k.bas.y + (kpV.y - k.bas.y) * e + Math.sin(p * Math.PI) * 1.4, k.bas.z + (kpV.z - k.bas.z) * e);
      k.g.rotation.y = (1 - e) * 9; k.g.scale.setScalar(2.6 - 1.8 * e);
      if (p >= 1) { govde.add(k.g); k.g.position.set(k.hedef[0], k.hedef[1], k.hedef[2]); k.g.rotation.set(0, 0, 0); k.g.scale.setScalar(1); k.bit = true; }
    });
    kpYaz(kp.tetik ? 'Kasklar takılıyor...' : 'Kaskların üzerine yürü, üçünü birden tak.');
    if (bitti === kp.kask.length) { kp.durum = 'bin'; kp.kilit = false; kp.bt = t; }
  } else if (kp.durum === 'bin') {
    kpYaz("ATV'ye bin! En yakın ATV'nin yanına git.");
    const dalga = 0.5 + 0.5 * Math.sin(t * 5); kp.parla.material.opacity = 0.2 + 0.5 * dalga; kp.parla.position.set(kp.atvG.position.x, 0.9, kp.atvG.position.z);
    kp.ok.visible = true; kp.ok.position.set(kp.atvG.position.x, 2.5 + 0.25 * Math.sin(t * 4), kp.atvG.position.z); kp.ok.rotation.y = t * 2;
    if (kp.atv) { kp.durum = 'tur'; kp.yaziBitis = simdi + 4500; kp.ok.visible = false; kp.parla.material.opacity = 0; }
  } else if (kp.durum === 'tur') {
    if (simdi < kp.yaziBitis) kpYaz('Peri bacalarının etrafında bir tur at.');
  }
  // ATV: bin / in düğmesi
  const ud = Math.hypot(kon.x - kp.atvG.position.x, kon.z - kp.atvG.position.z);
  if (kp.durum !== 'giris' && kp.durum !== 'kask') {
    atvBtn.textContent = kp.atv ? 'İn' : "ATV'ye bin"; atvBtn.classList.toggle('acik', kp.atv || ud < 3.4);
  } else atvBtn.classList.remove('acik');
  const hiz = Math.hypot(kon.vx, kon.vz);
  if (kp.atv) {
    const yuk = kpYuk(kon.x, kon.z), fx = -Math.sin(ikiliYon), fz = -Math.cos(ikiliYon), egim = (kpYuk(kon.x + fx * 0.9, kon.z + fz * 0.9) - kpYuk(kon.x - fx * 0.9, kon.z - fz * 0.9)) / 1.8;
    kp.atvG.rotation.order = 'YXZ'; kp.atvG.position.set(kon.x, yuk, kon.z); kp.atvG.rotation.y = ikiliYon; kp.atvG.rotation.x += (Math.atan(egim) - kp.atvG.rotation.x) * Math.min(1, dt * 8); ikili.position.y = 0.62 + yuk;
    kp.hizCarp += (sinir(1 - egim * 1.6, 0.6, 1.35) - kp.hizCarp) * Math.min(1, dt * 3);
    kp.teker.forEach(w => { w.rotation.x -= hiz * dt / 0.36; });
    if (hiz > 1.2 && simdi - kp.sonToz > 38) { kp.sonToz = simdi; const bx = Math.sin(ikiliYon), bz = Math.cos(ikiliYon), yan = (Math.random() - 0.5) * 1.1; kpToz(kon.x + bx * 1.2 + bz * yan, kon.z + bz * 1.2 - bx * yan, hiz > 5); kpToz(kon.x + bx * 1.6 - bz * yan, kon.z + bz * 1.6 + bx * yan, true); }
    if (surus.motorSes && sesBagl) { const m = surus.motorSes, n = Math.min(1, hiz / 7.2); m.o.frequency.setTargetAtTime(44 + n * 110, sesBagl.currentTime, 0.06); m.o2.frequency.setTargetAtTime(22 + n * 55, sesBagl.currentTime, 0.06); m.f.frequency.setTargetAtTime(280 + n * 900, sesBagl.currentTime, 0.08); m.g.gain.setTargetAtTime(0.04 + 0.07 * n, sesBagl.currentTime, 0.08); }
  } else { ikili.position.y = kpYuk(kon.x, kon.z); kp.hizCarp = 1; if (hiz > 0.8 && simdi - kp.sonToz > 260) { kp.sonToz = simdi; kpToz(kon.x - kon.vx * 0.2, kon.z - kon.vz * 0.2, false); } }
  kp.toz.forEach(p => { if (p.t >= 1.9) { p.s.visible = false; return; } p.t += dt; const k = p.t / 1.9; p.x += p.vx * dt; p.z += p.vz * dt; p.s.position.set(p.x, p.y + k * 1.6, p.z); const sz = (1.4 + k * 4.4) * p.boy; p.s.scale.set(sz, sz, 1); p.s.material.opacity = 0.62 * (1 - k) * (1 - k * 0.3); });
  kp.havaToz.forEach(h => { h.s.position.x += (0.9 + 0.4 * Math.sin(t * 0.3 + h.f)) * dt; if (h.s.position.x > KX + 36) h.s.position.x = KX - 36; h.s.material.opacity = 0.08 + 0.05 * Math.sin(t * 0.5 + h.f); });
  // tur: yürünen yönler işaretlenir
  { const dx = kon.x - KX, dz = kon.z - KZ, r = Math.hypot(dx, dz);
    if (kp.durum === 'tur' && r > KP_TUR0 - 2 && r < KP_TUR1 + 3) { const sk = Math.floor((((Math.atan2(dx, dz) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2)) * 16) % 16; if (!kp.sektor[sk]) { kp.sektor[sk] = true; kp.sektorSay++; } }
    const kd = kp.kapiD;
    if (kp.durum === 'tur') { if (!kp.tur) kp.altinHedef = Math.min(0.85, kp.sektorSay / 16 * 0.85); }
    if (!kd.acik && kp.sektorSay >= 15 && kp.durum === 'tur') { kd.acik = true; kd.panel.visible = true; gicirti(1.6); kalpPatlat(); kp.altinHedef = 1; kp.tur = true; kp.yaziBitis = simdi + 6000; kp.yaziKapi = 'Tur tamam! Kapı açıldı.'; }
    kd.aci += ((kd.acik ? -1.9 : 0) - kd.aci) * Math.min(1, dt * 1.8); kd.hinge.rotation.y = kd.aci;
    if (kp.yaziKapi && simdi < kp.yaziBitis) kpYaz(kp.yaziKapi);
    else if (kp.durum === 'tur' && !kd.acik && Math.hypot(kon.x - kd.x, kon.z - kd.z) < 9) kpYaz('Önce vadiyi tam tur at. Tur: %' + Math.round(kp.sektorSay / 16 * 100));
  }
  // fotoğraflar yaklaşınca netleşir
  kp.foto.forEach(f => {
    const uz = Math.hypot(kon.x - f.px, kon.z - f.pz), p = 0.3 + 0.7 * yumusak(34, 14, uz); f.net.material.color.setRGB(p, p, p); f.bul.material.color.setRGB(p, p, p); f.bul.material.opacity = 1 - yumusak(26, 12, uz);
    if (f.video) { const olsun = uz < 17; if (olsun !== f.oynuyor) { f.oynuyor = olsun; if (olsun) { const pr = f.video.play(); if (pr && pr.catch) pr.catch(() => {}); } else f.video.pause(); } }
  });
}
atvBtn.addEventListener('click', () => {
  if (!kp.aktif || kp.kilit) return;
  if (kp.atv) { kp.atv = false; kon.vx = 0; kon.vz = 0; kon.x += Math.cos(ikiliYon) * 1.3; kon.z -= Math.sin(ikiliYon) * 1.3; motorSesiDur(); return; }
  if (Math.hypot(kon.x - kp.atvG.position.x, kon.z - kp.atvG.position.z) < 3.4) { kp.atv = true; kon.vx = 0; kon.vz = 0; motorSesiBasla(); }
});

// ---------- Son oda: "Henüz yazılmamış sayfalar" (bilerek boş, birlikte yazacağımız anılar için) ----------
const HX = 9000, HZ = -3000, YO_YARI = 7, YO_YUK = 6;
const YO_KARELER = [   // dosya: fotoğrafı gelince 'foto/oda5-1.jpg' gibi yazılır
  { x: -1, z: -4.2, yazi: 'Bir sonraki gezimiz', w: 1.9, h: 1.3, dosya: null }, { x: -1, z: -0.4, yazi: 'Henüz çekilmedi', w: 1.2, h: 1.7, dosya: null }, { x: -1, z: 3.4, yazi: 'Birlikte güleceğimiz bir gün', w: 1.9, h: 1.3, dosya: null },
  { x: 1, z: -4.2, yazi: 'Yeni bir yer, yeni bir biz', w: 1.2, h: 1.7, dosya: null }, { x: 1, z: -0.4, yazi: 'Yıl dönümümüz', w: 1.9, h: 1.3, dosya: null }, { x: 1, z: 3.4, yazi: 'Sana söz verdiğim bir yer', w: 1.2, h: 1.7, dosya: null }
];
const MEKTUP = ['Gülüm,', '', 'Buz pistinde düşmelerimden Kapadokya\'ya kadar her odada bir anımız vardı.', '', 'Bu oda boş, çünkü seni her yeni güzel günde buraya yeni bir kapıyla getireceğim.', '', 'Henüz yazılmamış sayfalar, birlikte yazacağız.', '', '— Mehmetnur', '', 'Devamı bizde.'];
const yo = { aktif: false, hazir: false, grup: null, bekle: false, yildiz: [], yildizSay: 0, tavan: null, hemi: null, isik: [], isikSay: 0, fener: null, sonYazi: false, yaziBitis: 0, kutuNok: null, kare: [], mum: null, giris: 0 };
const defterBtn = document.getElementById('defterBtn');
function yoKur() {
  if (yo.hazir) return; yo.hazir = true;
  const g = new THREE.Group(); g.visible = false; sahne.add(g); yo.grup = g;
  let sd = 77; const rnd = () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; };
  const tuval = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const M = (r, k, sp) => new THREE.MeshPhongMaterial({ color: r, shininess: k || 10, specular: sp || 0x111111 });
  const kt = (w, h, d, mat, x, y, z, ust) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); (ust || g).add(m); return m; };
  const gold = (x, w) => { const gr = x.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#fff3cf'); gr.addColorStop(0.5, '#e0b45a'); gr.addColorStop(1, '#f7e2a6'); return gr; };
  const levha = (metin, w, h, px, font, renk) => { const c = tuval(w, h), x = c.getContext('2d'), d = new THREE.CanvasTexture(c); function ciz() { x.clearRect(0, 0, w, h); x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = px + 'px ' + font; x.shadowColor = 'rgba(80,50,10,.55)'; x.shadowBlur = px * 0.12; x.fillStyle = renk || gold(x, w); x.fillText(metin, w / 2, h / 2); d.needsUpdate = true; } ciz(); if (document.fonts && document.fonts.load) document.fonts.load(px + 'px "Great Vibes"', metin).then(ciz).catch(() => {}); return d; };
  const A = YO_YARI;
  // zemin: açık meşe tahta
  const zc = tuval(512, 512), zx = zc.getContext('2d'); zx.fillStyle = '#b98a58'; zx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 8; i++) { zx.fillStyle = ['#c39562', '#b2824f', '#bd8f5c'][i % 3]; zx.fillRect(0, i * 64, 512, 62); zx.fillStyle = 'rgba(70,40,15,.45)'; zx.fillRect(0, i * 64 + 62, 512, 2); for (let k = 0; k < 40; k++) { zx.fillStyle = 'rgba(90,55,20,' + (0.05 + rnd() * 0.1) + ')'; zx.fillRect(rnd() * 512, i * 64 + rnd() * 60, 20 + rnd() * 120, 1); } zx.fillStyle = 'rgba(70,40,15,.4)'; zx.fillRect(((i * 211) % 512), i * 64, 2, 62); }
  const zd = new THREE.CanvasTexture(zc); zd.wrapS = zd.wrapT = THREE.RepeatWrapping; zd.repeat.set(3, 3); zd.anisotropy = 4;
  const zemin = new THREE.Mesh(new THREE.PlaneGeometry(A * 2, A * 2), new THREE.MeshLambertMaterial({ map: zd })); zemin.rotation.x = -Math.PI / 2; zemin.position.set(HX, 0, HZ); g.add(zemin);
  // duvarlar: krem, altta lambri
  const dc = tuval(1024, 512), dx = dc.getContext('2d'), dg = dx.createLinearGradient(0, 0, 0, 512); dg.addColorStop(0, '#f5ecdc'); dg.addColorStop(1, '#eadcc4'); dx.fillStyle = dg; dx.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 1400; i++) { dx.fillStyle = 'rgba(160,130,90,' + (0.02 + rnd() * 0.03) + ')'; dx.fillRect(rnd() * 1024, rnd() * 340, 2, 8 + rnd() * 30); }
  dx.fillStyle = '#cdb694'; dx.fillRect(0, 330, 1024, 182); dx.fillStyle = '#d9c4a2'; dx.fillRect(0, 320, 1024, 14); dx.fillStyle = gold(dx, 1024); dx.fillRect(0, 332, 1024, 4);
  for (let i = 0; i < 4; i++) { dx.strokeStyle = 'rgba(110,80,45,.55)'; dx.lineWidth = 3; dx.strokeRect(i * 256 + 28, 366, 200, 116); dx.strokeStyle = 'rgba(255,240,210,.5)'; dx.strokeRect(i * 256 + 34, 372, 188, 104); }
  const dd = new THREE.CanvasTexture(dc); dd.wrapS = dd.wrapT = THREE.RepeatWrapping; dd.repeat.set(3, 1); dd.anisotropy = 4; const duvM = new THREE.MeshLambertMaterial({ map: dd });
  kt(A * 2 + 0.4, YO_YUK, 0.2, duvM, HX, YO_YUK / 2, HZ - A - 0.1); kt(A * 2 + 0.4, YO_YUK, 0.2, duvM, HX, YO_YUK / 2, HZ + A + 0.1); kt(0.2, YO_YUK, A * 2, duvM, HX - A - 0.1, YO_YUK / 2, HZ); kt(0.2, YO_YUK, A * 2, duvM, HX + A + 0.1, YO_YUK / 2, HZ);
  // tavan: gece gökyüzü, soluk yıldızlar
  const tc = tuval(1024, 1024), tx = tc.getContext('2d'), tg = tx.createRadialGradient(512, 512, 40, 512, 512, 740); tg.addColorStop(0, '#1d2a55'); tg.addColorStop(0.6, '#121a3a'); tg.addColorStop(1, '#0a0f24'); tx.fillStyle = tg; tx.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 420; i++) { tx.fillStyle = 'rgba(255,244,214,' + (0.15 + rnd() * 0.4) + ')'; const r = 0.8 + rnd() * 1.6; tx.beginPath(); tx.arc(rnd() * 1024, rnd() * 1024, r, 0, 7); tx.fill(); }
  yo.tavan = new THREE.Mesh(new THREE.PlaneGeometry(A * 2, A * 2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(tc), side: THREE.DoubleSide, fog: false })); yo.tavan.rotation.x = Math.PI / 2; yo.tavan.position.set(HX, YO_YUK, HZ); g.add(yo.tavan);
  // altın silme (kornişler)
  const kornis = M(0xd6b160, 70, 0xffeeb0); [[0, -A, A * 2, 0.12], [0, A, A * 2, 0.12]].forEach(k => kt(k[2], 0.14, 0.14, kornis, HX + k[0], YO_YUK - 0.07, HZ + k[1])); [-A, A].forEach(x => kt(0.14, 0.14, A * 2, kornis, HX + x, YO_YUK - 0.07, HZ));
  // yuvarlak halı
  const hc = tuval(512, 512), hx = hc.getContext('2d'), hg = hx.createRadialGradient(256, 256, 20, 256, 256, 250); hg.addColorStop(0, '#f6e7d3'); hg.addColorStop(0.7, '#ecd5b6'); hg.addColorStop(1, '#d9b88c'); hx.fillStyle = hg; hx.beginPath(); hx.arc(256, 256, 250, 0, 7); hx.fill();
  [225, 190, 150, 100].forEach((r, i) => { hx.strokeStyle = ['#c48a8a', '#b8935a', '#9c7a8a', '#d6a87a'][i]; hx.lineWidth = 6; hx.beginPath(); hx.arc(256, 256, r, 0, 7); hx.stroke(); });
  for (let k = 0; k < 24; k++) { const a = k / 24 * 6.283; hx.fillStyle = '#c98f94'; hx.beginPath(); hx.arc(256 + Math.cos(a) * 170, 256 + Math.sin(a) * 170, 7, 0, 7); hx.fill(); }
  const hali = new THREE.Mesh(new THREE.CircleGeometry(3.3, 48), new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(hc), transparent: true })); hali.rotation.x = -Math.PI / 2; hali.position.set(HX, 0.012, HZ + 0.5); g.add(hali);
  // pufflar (pembe ve lacivert)
  [[-1.2, 1.6, 0xe58aa8], [1.0, 2.2, 0x2b3f7a]].forEach(p => { const pf = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.48, 0.34, 20), M(p[2], 20)); pf.position.set(HX + p[0], 0.17, HZ + p[1]); g.add(pf); const ust = new THREE.Mesh(new THREE.SphereGeometry(0.44, 16, 10, 0, 6.283, 0, 1.5), M(p[2], 20)); ust.scale.set(1, 0.35, 1); ust.position.set(HX + p[0], 0.33, HZ + p[1]); g.add(ust); });
  // ana yazı (karşı duvar)
  const bas = new THREE.Mesh(new THREE.PlaneGeometry(10.5, 3.4), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, fog: false }));
  { const c = tuval(2048, 660), x = c.getContext('2d'), d = new THREE.CanvasTexture(c); const ciz = () => { x.clearRect(0, 0, 2048, 660); x.textAlign = 'center'; x.textBaseline = 'middle'; x.shadowColor = 'rgba(255,210,120,.7)'; x.shadowBlur = 36; x.fillStyle = gold(x, 2048); x.font = '260px "Great Vibes", cursive'; x.fillText('Burası boş. Bilerek.', 1024, 230); x.shadowBlur = 8; x.shadowColor = 'rgba(70,40,10,.5)'; x.font = '78px "Great Vibes", cursive'; x.fillStyle = '#7a5530'; x.fillText('Çünkü seninle yaşayacağımız en güzel anılar henüz yazılmadı.', 1024, 520); d.needsUpdate = true; }; ciz(); if (document.fonts && document.fonts.load) document.fonts.load('200px "Great Vibes"', 'Burası boş Bilerek').then(ciz).catch(() => {}); bas.material.map = d; }
  bas.position.set(HX, 3.5, HZ - A + 0.01); g.add(bas);
  // karşı duvarda kapı izi (giriş kapısı arkada, güney duvarında)
  kt(1.5, 2.5, 0.12, M(0x5a3220, 20), HX, 1.25, HZ + A - 0.03); kt(1.7, 0.12, 0.2, kornis, HX, 2.56, HZ + A - 0.05); [-0.8, 0.8].forEach(d => kt(0.1, 2.56, 0.2, kornis, HX + d, 1.28, HZ + A - 0.05));
  // boş çerçeveler ve altyazıları
  const parla = (() => { const c = tuval(128, 128), x = c.getContext('2d'), r = x.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,214,150,.85)'); r.addColorStop(1, 'rgba(255,200,120,0)'); x.fillStyle = r; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
  YO_KARELER.forEach((k, i) => {
    const wallX = HX + k.x * (A - 0.04), rot = k.x < 0 ? Math.PI / 2 : -Math.PI / 2, pz = HZ + k.z, FY = 2.55, ic = -k.x;
    const cer = new THREE.Mesh(new THREE.BoxGeometry(0.1, k.h + 0.28, k.w + 0.28), M(0xd6b160, 80, 0xffeeb0)); cer.position.set(wallX + ic * 0.02, FY, pz); g.add(cer);
    const ic1 = tuval(512, 512), x = ic1.getContext('2d'); x.fillStyle = '#efe4d0'; x.fillRect(0, 0, 512, 512); for (let n = 0; n < 700; n++) { x.fillStyle = 'rgba(190,160,120,' + (0.04 + rnd() * 0.06) + ')'; x.fillRect(rnd() * 512, rnd() * 512, 3, 1); }
    x.strokeStyle = 'rgba(200,160,100,.55)'; x.lineWidth = 6; x.setLineDash([14, 12]); x.strokeRect(34, 34, 444, 444); x.setLineDash([]); x.fillStyle = 'rgba(210,150,150,.35)'; x.font = '220px serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('♥', 256, 270);
    const net = new THREE.Mesh(new THREE.PlaneGeometry(k.w, k.h), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(ic1), color: 0xdcdcdc })); net.position.set(wallX + ic * 0.075, FY, pz); net.rotation.y = rot; g.add(net);
    if (k.dosya) new THREE.TextureLoader().load(k.dosya, tex => { tex.anisotropy = 8; const oran = tex.image.width / tex.image.height, gen = Math.min(2.4, k.h * oran); net.material.map = tex; net.material.color.set(0xffffff); net.material.needsUpdate = true; net.scale.x = gen / k.w; }, undefined, () => {});
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.4), new THREE.MeshBasicMaterial({ map: levha(k.yazi, 768, 128, 70, '"Great Vibes", cursive'), transparent: true, depthWrite: false })); pl.position.set(wallX + ic * 0.075, FY - k.h / 2 - 0.42, pz); pl.rotation.y = rot; g.add(pl);
    const l = new THREE.Sprite(new THREE.SpriteMaterial({ map: parla, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending, opacity: 0.45 })); l.scale.set(2.6, 2.6, 1); l.position.set(wallX + ic * 0.5, FY + k.h / 2 + 0.55, pz); g.add(l); yo.kare.push({ l, net, f: rnd() * 6 });
    const ap = kt(0.1, 0.34, 0.1, M(0x4a3a2a, 30), wallX + ic * 0.12, FY + k.h / 2 + 0.55, pz); ap.rotation.z = 0;   // küçük aplik
  });
  // levha: her yıldız bir anı
  const yp = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.5), new THREE.MeshBasicMaterial({ map: levha('Her yıldız bir anı.', 1024, 170, 96, '"Great Vibes", cursive'), transparent: true, depthWrite: false })); yp.position.set(HX - A + 0.08, 4.85, HZ - 0.4); yp.rotation.y = Math.PI / 2; g.add(yp);
  // dünya haritası/yolculuk haritası (güney duvarda, kapının solunda)
  { const c = tuval(1024, 640), x = c.getContext('2d'); const pg = x.createLinearGradient(0, 0, 1024, 640); pg.addColorStop(0, '#efdcb4'); pg.addColorStop(1, '#e2c895'); x.fillStyle = pg; x.fillRect(0, 0, 1024, 640);
    for (let i = 0; i < 5; i++) { x.strokeStyle = 'rgba(150,110,60,.25)'; x.lineWidth = 2; x.beginPath(); for (let k = 0; k <= 60; k++) { const a = k / 60 * 6.283, r = 80 + i * 44 + Math.sin(a * 3 + i) * 22; const px = 512 + Math.cos(a) * r * 1.5, py = 330 + Math.sin(a) * r * 0.85; k ? x.lineTo(px, py) : x.moveTo(px, py); } x.closePath(); x.stroke(); }
    x.strokeStyle = 'rgba(120,70,30,.8)'; x.lineWidth = 5; x.setLineDash([4, 14]); x.lineCap = 'round'; x.beginPath(); x.moveTo(250, 420); x.quadraticCurveTo(400, 250, 560, 330); x.quadraticCurveTo(700, 400, 820, 210); x.stroke(); x.setLineDash([]);
    const pin = (px, py, renk) => { x.fillStyle = renk; x.beginPath(); x.arc(px, py, 20, 0, 7); x.fill(); x.fillStyle = '#fff4dc'; x.beginPath(); x.arc(px, py, 8, 0, 7); x.fill(); };
    pin(250, 420, '#c4463e'); pin(560, 330, '#c4463e'); x.strokeStyle = 'rgba(214,150,70,.9)'; x.lineWidth = 6; x.beginPath(); x.arc(820, 210, 28, 0, 7); x.stroke(); pin(820, 210, '#d6a043');
    x.fillStyle = '#5a3a1e'; x.font = '66px "Great Vibes", cursive'; x.textAlign = 'center'; x.fillText('Eymir', 250, 485); x.fillText('Kapadokya', 560, 395); x.fillStyle = '#9a5f1e'; x.font = '70px "Great Vibes", cursive'; x.fillText('Sıradaki durak: ?', 820, 150); x.strokeStyle = 'rgba(100,60,25,.7)'; x.lineWidth = 10; x.strokeRect(14, 14, 996, 612);
    const mp = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.25), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c) })); mp.position.set(HX - 4.2, 2.5, HZ + A - 0.07); mp.rotation.y = Math.PI; g.add(mp);
    kt(3.8, 2.45, 0.08, M(0x6b4527, 20), HX - 4.2, 2.5, HZ + A - 0.03); }
  // ortada yuvarlak masa, üstünde açık defter, kalem ve mum
  const masa = new THREE.Group(); masa.position.set(HX, 0, HZ - 3.3); g.add(masa);
  const ceviz = M(0x4a2a16, 70, 0x886644); const mt = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.07, 32), ceviz); mt.position.y = 0.8; masa.add(mt);
  const ay = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.18, 0.78, 12), ceviz); ay.position.y = 0.4; masa.add(ay); const tb = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.55, 0.05, 24), ceviz); tb.position.y = 0.025; masa.add(tb);
  const sayfa = (sol) => { const c = tuval(256, 340), x = c.getContext('2d'); x.fillStyle = '#fbf3e2'; x.fillRect(0, 0, 256, 340); for (let i = 0; i < 12; i++) { x.fillStyle = 'rgba(150,120,90,.25)'; x.fillRect(24, 60 + i * 22, 208, 1.5); } if (sol) { x.fillStyle = '#5a3a1e'; x.font = '44px "Great Vibes", cursive'; x.textAlign = 'left'; x.fillText('Gülüm,', 30, 50); x.font = '24px "Caveat", cursive'; x.fillStyle = 'rgba(90,60,30,.8)'; ['Buradan sonrasını', 'birlikte yazacağız.'].forEach((t, i) => x.fillText(t, 30, 100 + i * 28)); } return new THREE.CanvasTexture(c); };
  [[-0.17, 0.12], [0.17, -0.12]].forEach((p, i) => { const sf = new THREE.Mesh(new THREE.BoxGeometry(0.33, 0.014, 0.44), [M(0xefe6d2), M(0xefe6d2), new THREE.MeshPhongMaterial({ map: sayfa(i === 0) }), M(0xd9ccb0), M(0xefe6d2), M(0xefe6d2)]); sf.position.set(p[0], 0.846, 0); sf.rotation.z = p[1]; masa.add(sf); });
  kt(0.04, 0.03, 0.46, M(0x6b3f2a, 30), 0, 0.842, 0, masa); const kalem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.2, 6), M(0xb5842c, 60)); kalem.rotation.z = Math.PI / 2; kalem.rotation.y = 0.5; kalem.position.set(0.42, 0.845, 0.3); masa.add(kalem);
  const mumG = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.14, 10), M(0xfff0d2, 10)); mumG.position.set(-0.5, 0.905, -0.35); masa.add(mumG);
  yo.mum = new THREE.Sprite(new THREE.SpriteMaterial({ map: parla, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending, opacity: 0.8 })); yo.mum.scale.set(1.2, 1.2, 1); yo.mum.position.set(-0.5, 1.0, -0.35); masa.add(yo.mum);
  const alev = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.07, 6), new THREE.MeshBasicMaterial({ color: 0xffb347 })); alev.position.set(-0.5, 1.012, -0.35); masa.add(alev); yo.alev = alev;
  // tripod üstünde fotoğraf makinesi ve kartı
  { const tg2 = new THREE.Group(); tg2.position.set(HX + 4.9, 0, HZ + 4.6); g.add(tg2); const ma = M(0x2a2a2e, 30, 0x555555);
    [0, 1, 2].forEach(i => { const a = i * Math.PI * 2 / 3 + 0.4, ac = Math.cos(a), as = Math.sin(a), ba = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.012, 1.45, 6), ma); ba.position.set(ac * 0.28, 0.72, as * 0.28); ba.rotation.z = -ac * 0.19; ba.rotation.x = as * 0.19; tg2.add(ba); });
    kt(0.14, 0.08, 0.14, ma, 0, 1.46, 0, tg2); kt(0.3, 0.2, 0.15, M(0x1f1f23, 40, 0x666666), 0, 1.62, 0, tg2); const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.09, 0.16, 16), M(0x0e0e11, 80, 0xaaaaaa)); lens.rotation.x = Math.PI / 2; lens.position.set(0, 1.62, 0.15); tg2.add(lens); const cam = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8), new THREE.MeshPhongMaterial({ color: 0x1b2a4a, shininess: 150, specular: 0xffffff })); cam.scale.set(1, 1, 0.4); cam.position.set(0, 1.62, 0.235); tg2.add(cam);
    kt(0.06, 0.04, 0.05, M(0xc4463e, 60), 0.1, 1.74, 0, tg2); const kart = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.5), new THREE.MeshBasicMaterial({ map: levha('Birlikte çekeceklerimiz buraya.', 768, 340, 62, '"Great Vibes", cursive', '#7a5530'), transparent: true, side: THREE.DoubleSide })); kart.position.set(0, 1.05, 0.12); kart.rotation.y = -0.4; tg2.add(kart);
    const kb = kt(1.1, 0.5, 0.01, M(0xfaf0dc, 10), 0, 1.05, 0.115, tg2); kb.rotation.y = -0.4; }
  // üç sıra kıvrımlı ışık dizisi (fener telleri)
  { const N = 60, p = new Float32Array(N * 3 * 3); let n = 0; const dizi = (a, b, sag) => { for (let i = 0; i < N; i++) { const t = i / (N - 1); p[n++] = a[0] + (b[0] - a[0]) * t; p[n++] = a[1] + Math.sin(t * 24) * 0.0 - Math.sin(Math.PI * ((t * 6) % 1)) * sag; p[n++] = a[2] + (b[2] - a[2]) * t; } };
    dizi([HX - A + 0.2, YO_YUK - 0.35, HZ - A + 0.2], [HX + A - 0.2, YO_YUK - 0.35, HZ - A + 0.2], 0.3); dizi([HX - A + 0.2, YO_YUK - 0.35, HZ - A + 0.2], [HX - A + 0.2, YO_YUK - 0.35, HZ + A - 0.2], 0.3); dizi([HX + A - 0.2, YO_YUK - 0.35, HZ - A + 0.2], [HX + A - 0.2, YO_YUK - 0.35, HZ + A - 0.2], 0.3);
    const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.BufferAttribute(p, 3)); yo.fener = new THREE.Points(fg, new THREE.PointsMaterial({ size: 9, sizeAttenuation: false, color: 0xffd98a, transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); g.add(yo.fener); }
  // ışıklar
  yo.hemi = new THREE.HemisphereLight(0xffe6c8, 0x6b5240, 0.85); yo.hemi.visible = false; sahne.add(yo.hemi);
  [[HX, 3.2, HZ + 0.5, 0.9, 16], [HX, 1.6, HZ - 3.3, 1.0, 7]].forEach(l => { const pl = new THREE.PointLight(0xffc88a, l[3], l[4], 1.6); pl.position.set(l[0], l[1], l[2]); pl.visible = false; sahne.add(pl); yo.isik.push(pl); });
  yo.yildizDoku = parla;
}

function yoAc() {
  if (yo.aktif || yo.bekle) return; yo.bekle = true; yoKur();
  gecisKutu.classList.add('acik');
  setTimeout(() => {
    kp.aktif = false; kp.grup.visible = false; kp.hemi.visible = false; kp.gun.visible = false; if (kp.atv) { kp.atv = false; motorSesiDur(); } atvBtn.classList.remove('acik');
    kp.kask.forEach(k => { k.g.visible = false; }); ikili.position.y = 0; yonKutu.classList.remove('acik');
    yo.aktif = true; yo.grup.visible = true; yo.hemi.visible = true; yo.isik.forEach(l => { l.visible = true; });
    sahne.fog = new THREE.FogExp2(0x1c1622, 0.004); sahne.background = new THREE.Color(0x1c1622); kamera.far = 300; kamera.updateProjectionMatrix();
    kon.x = HX; kon.z = HZ + 5.3; kon.vx = 0; kon.vz = 0; kon.yaw = 0; kon.pitch = -0.12; kon.oto = null; ikiliYon = 0; ikili.visible = true;
    yo.giris = performance.now(); yo.ipucuBitis = yo.giris + 9000; gecisKutu.classList.remove('acik');
  }, 650);
}
function yoSinir() {
  const A = YO_YARI - 0.7;
  kon.x = sinir(kon.x, HX - A, HX + A); kon.z = sinir(kon.z, HZ - A, HZ + A);
  engelleriItele(kon, 0.35, false, [{ x: HX, z: HZ - 3.3, r: 1.0 }, { x: HX - 1.2, z: HZ + 1.6, r: 0.5 }, { x: HX + 1.0, z: HZ + 2.2, r: 0.5 }, { x: HX + 4.9, z: HZ + 4.6, r: 0.5 }]);
}
function yoZil(n) {
  try { if (!sesBagl) return; const c = sesBagl, t = c.currentTime, f = [880, 988, 1175, 1319, 1568, 1760][n % 6] * (1 + (n % 3) * 0.01);
    [f, f * 1.5].forEach((fr, i) => { const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = fr; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(i ? 0.03 : 0.07, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.3); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + 1.4); }); } catch (e) {}
}
function yoYildizEkle(x, y, z) {
  const doku = yo.yildizDoku, s = new THREE.Sprite(new THREE.SpriteMaterial({ map: doku, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending, opacity: 0.95, fog: false }));
  s.position.set(x, y - 0.05, z); s.scale.set(0.01, 0.01, 1); yo.grup.add(s);
  const ç = new THREE.Mesh(new THREE.OctahedronGeometry(0.07, 0), new THREE.MeshBasicMaterial({ color: 0xfff3c4, fog: false })); ç.position.set(x, y - 0.06, z); ç.scale.set(1, 1.7, 1); yo.grup.add(ç);
  yo.yildiz.push({ s, c: ç, t: 0, f: Math.random() * 6 }); if (yo.yildiz.length > 90) { const e = yo.yildiz.shift(); yo.grup.remove(e.s); yo.grup.remove(e.c); }
  yo.yildizSay++; yoZil(yo.yildizSay);
}
let yoDokun0 = null;
canvas.addEventListener('pointerdown', e => { yoDokun0 = { x: e.clientX, y: e.clientY, t: performance.now() }; });
canvas.addEventListener('pointerup', e => {
  const d0 = yoDokun0; yoDokun0 = null;
  if (!yo.aktif || !d0 || Math.hypot(e.clientX - d0.x, e.clientY - d0.y) > 12 || performance.now() - d0.t > 500 || fotoBak.classList.contains('acik')) return;
  const rc = new THREE.Raycaster(); rc.setFromCamera(new THREE.Vector2((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1), kamera);
  const h = rc.intersectObject(yo.tavan); if (!h.length) return;
  yoYildizEkle(h[0].point.x, YO_YUK - 0.04, h[0].point.z);
  if (yo.yildizSay === 7 && !yo.sonYazi) { yo.sonYazi = true; yo.yaziBitis = performance.now() + 7000; }
});
function yoMektupResmi() {   // defterdeki mektubu kâğıt gibi çizer
  const c = document.createElement('canvas'); c.width = 900; c.height = 1200; const x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 1200); g.addColorStop(0, '#fcf6e8'); g.addColorStop(1, '#f1e5ce'); x.fillStyle = g; x.fillRect(0, 0, 900, 1200);
  for (let i = 0; i < 18; i++) { x.fillStyle = 'rgba(150,120,90,.22)'; x.fillRect(70, 200 + i * 52, 760, 2); } x.fillStyle = 'rgba(210,120,120,.4)'; x.fillRect(58, 0, 3, 1200);
  x.fillStyle = '#4b2f18'; x.textBaseline = 'alphabetic'; let y = 130;
  MEKTUP.forEach((s, i) => {
    if (i === 0) { x.font = '110px "Great Vibes", cursive'; x.fillText(s, 90, y); y += 100; return; }
    if (s === '') { y += 26; return; }
    const imza = s.startsWith('—'), son = s === 'Devamı bizde.';
    x.font = imza ? '78px "Great Vibes", cursive' : (son ? '96px "Great Vibes", cursive' : '44px "Caveat", "Great Vibes", cursive'); x.fillStyle = son ? '#a86a1e' : '#4b2f18'; x.textAlign = imza ? 'right' : (son ? 'center' : 'left');
    if (imza || son) { x.fillText(s, imza ? 800 : 450, y + 10); y += 84; return; }
    const kel = s.split(' '); let satir = '';
    kel.forEach(k => { const t = satir ? satir + ' ' + k : k; if (x.measureText(t).width > 720 && satir) { x.fillText(satir, 90, y); y += 56; satir = k; } else satir = t; });
    x.fillText(satir, 90, y); y += 56;
  });
  return c.toDataURL('image/jpeg', 0.9);
}
defterBtn.addEventListener('click', () => {
  const kutu = fotoBak.querySelector('.fg'); kutu.innerHTML = ''; const im = new Image(); im.src = yoMektupResmi(); im.alt = ''; im.style.borderColor = '#c9a96a'; kutu.appendChild(im);
  fotoBak.classList.add('acik'); fotoAcildi = performance.now(); defterBtn.classList.remove('acik');
});
const yoV = new THREE.Vector3();
function yoGuncelle(dt, simdi) {
  if (!yo.aktif) {   // Kapadokya'daki açık kapıdan girince
    const kd = kp.kapiD;
    if (kp.aktif && kd && kd.acik && kd.aci < -1.2 && Math.hypot(kon.x - kd.x, kon.z - kd.z) < 1.9) yoAc();
    return;
  }
  const t = simdi / 1000;
  yo.kare.forEach(k => { k.l.material.opacity = 0.35 + 0.15 * Math.sin(t * 1.3 + k.f); });
  if (yo.mum) { yo.mum.material.opacity = 0.65 + 0.2 * Math.sin(t * 9) + 0.1 * Math.sin(t * 23); yo.alev.scale.set(1, 1.1 + 0.2 * Math.sin(t * 11), 1); }
  yo.fener.material.opacity = 0.8 + 0.15 * Math.sin(t * 2.3);
  yo.yildiz.forEach(y => { y.t += dt; const p = Math.min(1, y.t / 0.6), e = p < 1 ? 1.2 * Math.sin(p * Math.PI * 0.5) : 1 + 0.1 * Math.sin(t * 3 + y.f); y.s.scale.set(1.5 * e, 1.5 * e, 1); y.c.rotation.y += dt * 1.5; });
  // ipuçları
  if (simdi < yo.ipucuBitis) { const m = 'Yukarı bak, tavana dokun: her yıldız bir anı.'; if (yonKutu.textContent !== m) yonKutu.textContent = m; yonKutu.classList.add('acik'); }
  else if (yo.sonYazi && simdi < yo.yaziBitis) { const m = 'Devamı bizde. ♥'; if (yonKutu.textContent !== m) yonKutu.textContent = m; yonKutu.classList.add('acik'); }
  defterBtn.classList.toggle('acik', Math.hypot(kon.x - HX, kon.z - (HZ - 3.3)) < 2.6 && !fotoBak.classList.contains('acik'));
}

// geçtikten sonra arkandaki kapı kendiliğinden kapanır; geri dönersen açılır (mantık değişmez, sadece görünüm ve ses)
function kapilariKapat() {
  if (kon.x > 40 || kon.z < -30 || kon.z > 6) return;   // sadece ana odalarda
  if (kapi2.acik) {
    if (!kapi2.kapandi && kon.x > ODA_X + 1.3 && kon.z < ODA2_Z1 + 0.5) { kapi2.kapandi = true; kapiSesi(); }
    else if (kapi2.kapandi && kon.x < ODA_X + 0.5) { kapi2.kapandi = false; gicirti(1.0); }
  }
  if (K3.acik) {
    if (!K3.kapandi && kon.z > ODA2_Z1 + 1.4 && kon.x > 8) { K3.kapandi = true; kapiSesi(); }
    else if (K3.kapandi && kon.z < ODA2_Z1 + 0.5 && kon.z > -24.5 && kon.x > 8) { K3.kapandi = false; gicirti(1.0); }
  }
}
function kare(simdi) {
  requestAnimationFrame(kare);
  const dt = Math.min(0.05, (simdi - onceki) / 1000);
  onceki = simdi;

  if (basladi) {
    // yön
    let ileri = kon.joyY, yan = kon.joyX;
    const t = kon.tus;
    if (t['w'] || t['arrowup']) ileri += 1;
    if (t['s'] || t['arrowdown']) ileri -= 1;
    if (t['d']) yan += 1;
    if (t['a']) yan -= 1;
    if (t['arrowleft']) { kon.yaw += 1.6 * dt; kon.dragX -= 280 * dt; kon.bakToplam += 500 * dt; sonBakZaman = performance.now(); }
    if (t['arrowright']) { kon.yaw -= 1.6 * dt; kon.dragX += 280 * dt; kon.bakToplam += 500 * dt; sonBakZaman = performance.now(); }
    if (performance.now() < kon.donuk || surus.oturuyor || park.aktif || ey.kilit || kp.kilit) { ileri = 0; yan = 0; kon.vx = 0; kon.vz = 0; }  // odaya girince yazıyı okusun / koltukta otururken yürümez
    const hiz = kp.atv ? 7.2 * kp.hizCarp : (ey.bisik ? 5.4 : 2.2);
    const sy = Math.sin(kon.yaw), cy = Math.cos(kon.yaw);
    let mx = -sy * ileri + cy * yan, mz = -cy * ileri - sy * yan;
    const ml = Math.hypot(mx, mz);
    if (ml > 1) { mx /= ml; mz /= ml; }
    const kay = kp.atv ? 5 : ((BUZ && odadaMi && patenGiyildi) ? 2.2 : 14);       // buz üstünde yavaş hızlanır, yavaş durur
    kon.vx += (mx * hiz - kon.vx) * Math.min(1, dt * kay);
    kon.vz += (mz * hiz - kon.vz) * Math.min(1, dt * kay);
    kon.x += kon.vx * dt;
    kon.z += kon.vz * dt;
    // adım sesi: sadece kapıya kadar, koridorda
    if (kon.z > KAPI_Z + 0.2 && ogr >= 1) {
      adimBirik += Math.hypot(kon.vx, kon.vz) * dt;
      if (adimBirik > 0.8) { adimBirik = 0; adimSesi(); }
    } else adimBirik = 0;
    yurume = Math.min(1, Math.max(ml, Math.hypot(kon.vx, kon.vz) / hiz));
    if (ml > 0.08) {
      const hedef = Math.atan2(-mx, -mz);
      let fark = hedef - ikiliYon;
      fark = Math.atan2(Math.sin(fark), Math.cos(fark));
      ikiliYon += fark * Math.min(1, dt * 9);
    }

    // sınırlar
    if (yo.aktif) yoSinir(); else if (kp.aktif) kpSinir(); else if (ey.aktif) eySinir();
    else if (K3.acik && kon.z > ODA2_Z1 - 0.2 && kon.x > 2.5) {
      // gül kapısının ötesi: hol ve üçüncü oda
      if (kon.z < HOL3_Z1 + 0.2) kon.x = sinir(kon.x, K3.x - 0.45, K3.x + 0.45);
      else { kon.x = sinir(kon.x, R3.x0 + 0.7, R3.x1 - 0.7); kon.z = Math.min(kon.z, R3.z1 - 0.7); engelleriItele(kon, 0.4, false, ENGELLER3); }
    } else if (kapi2.acik && kon.x > ODA_X + 0.3) {
      // kapının ötesi: hol ve ikinci oda
      if (kon.x < HOL_SON + 0.2) kon.z = sinir(kon.z, HOL_Z - 0.45, HOL_Z + 0.45);
      else { kon.z = sinir(kon.z, ODA2_Z0 + 0.7, (K3.acik && Math.abs(kon.x - K3.x) < 0.5) ? ODA2_Z1 + 0.5 : ODA2_Z1 - 0.7); kon.x = Math.min(kon.x, ODA2_X1 - 0.7); }
      if (patenTakili) kon.x = Math.min(kon.x, HOL_SON - 0.4);   // patenle odaya giremez
      if (kon.x > HOL_SON) engelleriItele(kon, 0.4, false);
    } else if (kon.z > KAPI_Z + 0.4) {
      kon.x = sinir(kon.x, -KOR_X + 0.5, KOR_X - 0.5);
      kon.z = Math.min(kon.z, KOR_BAS - 0.3);
    } else if (kon.z > KAPI_Z - 1.8) {
      if (!kapiAcik) kon.z = KAPI_Z + 0.4;
      else kon.x = sinir(kon.x, -AC_GEN / 2 + 0.45, AC_GEN / 2 - 0.45);
    } else {
      const kapida = kapi2.acik && Math.abs(kon.z - HOL_Z) < 0.5;
      if (!kapida) kon.x = sinir(kon.x, -ODA_X + 0.7, ODA_X - 0.7);
      kon.z = Math.max(kon.z, ODA_SON + 1);
    }

    // kapı
    if (!kapiAcik) {
      // koridordan yaklaşınca ya da odadan kapıya dönünce açılır
      if (kon.z < KAPI_Z + 3.2 && kon.z > KAPI_Z - 2.0 && kon.x < ODA_X && kapiHazir()) { kapiAcik = true; gicirti(1.3); if (!hazirSesCalindi) { hazirSesCalindi = true; sesCal('hazir'); } }
    } else if (!KAPILAR_ACIK && kon.z < KAPI_Z - 3.4) {
      // odaya iyice girince arkasından kapanır
      kapiAcik = false;
      kapiSesi();
    }
    const hedefAci = kapiAcik ? Math.PI * 0.5 : 0;
    kapiAci += (hedefAci - kapiAci) * Math.min(1, dt * 2.2);
    kapiMenteşe.rotation.y = kapiAci;

    // oda: müzik ve ışık
    const icerde = kon.z < KAPI_Z - 0.6 && kon.x < ODA_X + 0.3;
    if (icerde && !ilkGiris) { ilkGiris = true; kon.donuk = performance.now() + 1700; kon.vx = 0; kon.vz = 0; }
    if (icerde !== odadaMi) { odadaMi = icerde; muzikHedef = icerde ? 0.85 : 0; }
    const fotoUz = Math.hypot(kon.x, kon.z - FOTO_Z);
    const yakin = icerde ? yumusak(10, 3.2, fotoUz) : 0;
    odaIsik.intensity = 0.12 + 0.35 * yakin;
    if (fotoNet) {
      const parlak = 0.12 + 0.88 * yakin;
      fotoNet.material.color.setRGB(parlak, parlak, parlak);
      fotoBulanik.material.color.setRGB(parlak, parlak, parlak);
      fotoBulanik.material.opacity = 1 - yumusak(7, 3.6, fotoUz);
    }
    videoGuncelle(icerde, dt);
    soruGuncelle(icerde);
    yonergeGuncelle(icerde, dt, fotoUz);
    ogrGuncelle(dt);
    const yaziGerek = icerde && fotoUz < 4.6;
    if (yaziGerek !== yaziAcik) {
      yaziAcik = yaziGerek;
      yaziKutu.textContent = ODA1.yazi;
      yaziKutu.classList.toggle('acik', yaziAcik);
    }
  }

  // fotoğraf yanı oklar: odadayken yumuşakça yanıp söner
  yanOklar.forEach(o => { const dalga = Math.pow(0.5 + 0.5 * Math.sin(simdi / 380 - o.k * 0.9), 2); const gor = ((asama === 1 && o.yon < 0) || (asama === 2 && o.yon > 0)) && (performance.now() - yonZaman < 9000); o.mat.opacity = odadaMi ? (gor ? 0.06 + 0.6 * dalga : 0.03 + 0.12 * dalga) : 0; });

  // zemin okları: kapı açılınca silik silik yanıp söner
  zeminOklar.forEach(o => { o.mat.opacity = kapiAcik ? 0.03 + 0.3 * Math.pow(0.5 + 0.5 * Math.sin(simdi / 430 - o.k * 0.9), 2) : 0; });

  if (sonrakiKapiIsik) sonrakiKapiIsik.material.opacity = (kapi2.acik ? 0.6 : 0.22) + 0.16 * Math.sin(simdi / 900);
  kapi2.aci += (((kapi2.acik && !kapi2.kapandi) ? -1.9 : 0) - kapi2.aci) * Math.min(1, dt * 1.6);
  if (kapi2.hinge) kapi2.hinge.rotation.y = kapi2.aci;
  if (kapi2.glow) kapi2.glow.material.opacity = 0.3 * Math.min(1, Math.abs(kapi2.aci) / 1.2);

  // okların nabzı
  const nabiz = 0.7 + 0.3 * Math.sin(simdi / 350);
  matOk.color.setRGB(0.91 * nabiz, 0.7 * nabiz, 0.37 * nabiz);

  if (basladi && !ey.aktif && !kp.aktif && !yo.aktif && kon.z < KAPI_Z + 6) yaprakDok(dt, simdi / 1000);
  if (!ey.aktif && !kp.aktif && !yo.aktif && K3.acik && kon.z > ODA2_Z1 && kon.x > 2.5) { cocukFotoGuncelle(); motorGuncelle(dt); motorOklar.forEach(o => { o.mat.opacity = 0.04 + 0.2 * Math.pow(0.5 + 0.5 * Math.sin(simdi / 420 - o.k * 0.8), 2); }); }
  if (!ey.aktif && !kp.aktif && !yo.aktif && kon.x > ODA_X) { ruzgarGuluGuncelle(dt, simdi / 1000); k3Guncelle(simdi); vantilatorGuncelle(simdi / 1000); masaGuncelle(); dolapGuncelle(simdi / 1000); sahisOklar.forEach(o => { o.mat.opacity = 0.04 + 0.2 * Math.pow(0.5 + 0.5 * Math.sin(simdi / 420 - o.k * 0.8), 2); }); ampulGuncelle(simdi / 1000); cocukFotoGuncelle(); if (kon.x > ODA_X + 1.5) balonGuncelle(dt, simdi / 1000); }

  // mum titremesi
  const zaman = simdi / 1000;
  mumlar.forEach(m => {
    const n = 0.88 + 0.08 * Math.sin(zaman * 9 + m.faz) + 0.06 * Math.sin(zaman * 23 + m.faz * 2);
    m.alev.scale.set(n, 1.9 * n, n);
    if (m.isik) m.isik.intensity = m.guc * n;
  });

  // ikinci odanın şarkısı
  const oda3te = K3.acik && kon.z > ODA2_Z1 + 0.3 && kon.x > 2.5;
  muzik2Hedef = (kapi2.acik && kon.x > ODA_X + 1.0 && !oda3te && !ey.aktif && !kp.aktif && !yo.aktif) ? 0.85 : 0;
  // 4. odanın kapısı açıkken ona yaklaşınca Serseri kesilir, Çoban Yıldızı başlar
  const dorduncu = ey.aktif || (oda3te && kapiT.acik && Math.hypot(kon.x - kapiT.x, kon.z - kapiT.z) < 4.5);
  muzik3Hedef = (dorduncu || !oda3te) ? 0 : 0.85;
  muzik4Hedef = dorduncu ? (ey.aktif ? 0.65 + 0.35 * ey.gece : 0.6) : 0;
  if (dorduncu && !ey.sarkiBasladi) { ey.sarkiBasladi = true; try { if (muzik4) muzik4.currentTime = 0; } catch (e) {} }
  if (!dorduncu) ey.sarkiBasladi = false;
  // Kapadokya: İki Yabancı (girişte baştan başlar, ATV'de biraz kısılır)
  muzik5Hedef = yo.aktif ? 0.4 : (kp.aktif ? (kp.atv ? 0.55 : 0.8) : 0);
  if (kp.aktif && !kp.sarkiBasladi) { kp.sarkiBasladi = true; try { if (muzik5) muzik5.currentTime = 0; } catch (e) {} }
  if (muzik5) { const v5 = muzik5.volume; muzik5.volume = sinir(v5 + (muzik5Hedef - v5) * Math.min(1, dt * 1.0), 0, 1); }
  if (muzik4) { const v4 = muzik4.volume; muzik4.volume = sinir(v4 + (muzik4Hedef - v4) * Math.min(1, dt * (dorduncu ? 1.6 : 1.2)), 0, 1); }
  if (muzik3) { const v3 = muzik3.volume; muzik3.volume = sinir(v3 + (muzik3Hedef - v3) * Math.min(1, dt * (muzik3Hedef === 0 ? 2.5 : 0.7)), 0, 1); }
  if (muzik2) { const v2 = muzik2.volume; muzik2.volume = sinir(v2 + (muzik2Hedef - v2) * Math.min(1, dt * 0.7), 0, 1); }

  // müzik yumuşak geçiş
  if (muzik && muzikVar) {
    const v = muzik.volume;
    muzik.volume = sinir(v + (muzikHedef - v) * Math.min(1, dt * 0.7), 0, 1);
  }

  // otomatik bakma
  if (kon.oto && bakId === null) {
    const f = Math.atan2(Math.sin(kon.oto.yaw - kon.yaw), Math.cos(kon.oto.yaw - kon.yaw));
    kon.yaw += f * Math.min(1, dt * 2.4);
    kon.pitch += (kon.oto.pitch - kon.pitch) * Math.min(1, dt * 2.4);
    if (Math.abs(f) < 0.02) kon.oto = null;
  }

  // karakter animasyonu
  yurumeFaz += dt * 7 * yurume;
  egim += ((-0.12 * yurume) - egim) * Math.min(1, dt * 6);
  govde.position.y = (surus.oturuyor ? 0.56 : 0.19) + Math.sin(simdi / 700) * 0.03 + Math.abs(Math.sin(yurumeFaz)) * 0.025 * yurume;
  govde.rotation.x = egim;
  patenler.forEach(p => { p.g.position.z = Math.sin(yurumeFaz + p.faz) * 0.07 * yurume; });
  govde.rotation.z = Math.sin(yurumeFaz) * 0.045 * yurume + Math.sin(simdi / 1100) * 0.015;
  ikili.position.set(kon.x, 0, kon.z);
  ikili.rotation.y = ikiliYon;
  ikiliKalp.position.y = 0.33 + Math.sin(simdi / 450) * 0.025;
  halolar.forEach((h, k) => { h.material.opacity = 0.1 + 0.04 * Math.sin(simdi / 600 + k * 2); });
  if (basladi) zerreGuncelle(dt, kon.x, kon.z, ikiliYon, yurume > 0.15);

  patenGuncelle(simdi);
  patenCikarGuncelle(simdi);

  if (K3.acik) surusGuncelle(dt, simdi);
  if (K3.acik && kon.x > 2.5 && kon.z > ODA2_Z1) kapiPGuncelle(dt);
  if (K3.acik && kon.x > 2.5 && kon.z > ODA2_Z1) kapiTGuncelle(dt);
  eyGuncelle(dt, simdi);
  kapilariKapat();
  kpGuncelle(dt, simdi);
  yoGuncelle(dt, simdi);
  if (park.aktif) parkGuncelle(dt, simdi);

  // kamera: karakterin arkasında, bakış yönünün tersinde
  const cp = Math.cos(kon.pitch), sp = Math.sin(kon.pitch);
  const bx = -Math.sin(kon.yaw) * cp, by = sp, bz = -Math.cos(kon.yaw) * cp;
  const D = kp.atv ? 3.6 : 2.4, hx = kon.x, hy = 0.85 + (kp.atv ? 0.75 : 0) + (kp.aktif ? kpYuk(kon.x, kon.z) : 0), hz = kon.z;
  let cx = hx - bx * D, cy2 = hy - by * D, cz = hz - bz * D;
  if (yo.aktif) {
    cx = sinir(cx, HX - YO_YARI + 0.3, HX + YO_YARI - 0.3); cz = sinir(cz, HZ - YO_YARI + 0.3, HZ + YO_YARI - 0.3);
  } else if (kp.aktif) {
    const rx = cx - KX, rz = cz - KZ, rr = Math.hypot(rx, rz);
    if (rr > KP_DUVAR - 0.8) { cx = KX + rx * (KP_DUVAR - 0.8) / rr; cz = KZ + rz * (KP_DUVAR - 0.8) / rr; }
  } else if (ey.aktif) {
    const rx = cx - EX, rz = cz - EZ, rr = Math.hypot(rx, rz);
    if (rr > EY_DUVAR - 0.7) { cx = EX + rx * (EY_DUVAR - 0.7) / rr; cz = EZ + rz * (EY_DUVAR - 0.7) / rr; }
  } else if (K3.acik && kon.z > ODA2_Z1 - 0.2 && kon.x > 2.5) {
    if (cz < HOL3_Z1) { cx = sinir(cx, K3.x - 0.7, K3.x + 0.7); cz = Math.max(cz, ODA2_Z1 - 3.0); }
    else { cx = sinir(cx, R3.x0 + 0.2, R3.x1 - 0.2); cz = sinir(cz, HOL3_Z1 + 0.1, R3.z1 - 0.2); }
  } else if (kapi2.acik && kon.x > ODA_X + 0.3) {
    cx = sinir(cx, ODA_X + 0.15, ODA2_X1 - 0.2);
    cz = cx < HOL_SON ? sinir(cz, HOL_Z - 0.7, HOL_Z + 0.7) : sinir(cz, ODA2_Z0 + 0.2, ODA2_Z1 - 0.2);
  } else if (cz > KAPI_Z + 0.1) { cx = sinir(cx, -KOR_X + 0.2, KOR_X - 0.2); cz = Math.min(cz, KOR_BAS - 0.15); }
  else if (cz > KAPI_Z - 0.6) { cx = sinir(cx, -AC_GEN / 2 + 0.15, AC_GEN / 2 - 0.15); }
  else { cx = sinir(cx, -ODA_X + 0.2, ODA_X - 0.2); cz = Math.max(cz, ODA_SON + 0.3); }
  cy2 = sinir(cy2, 0.25, yo.aktif ? 5.5 : ((ey.aktif || kp.aktif) ? 14 : (kapi2.acik && kon.x > ODA_X + 0.3) ? 2.9 : (cz > KAPI_Z ? YUKSEK - 0.2 : ODA_Y - 0.2)));
  if (park.aktif) {
    const fx = Math.cos(park.h), fz = -Math.sin(park.h);
    const gor = park.gorunum || 0;
    if (gor === 0) { kamera.fov += ((Math.min(88, 74 + park.v * 0.7)) - kamera.fov) * Math.min(1, dt * 3); kamera.updateProjectionMatrix(); }
    if (gor === 2) {
      // harita: tüm İREM yazısı görünsün, kuzey yukarıda (yazı okunur)
      kamera.fov += (60 - kamera.fov) * Math.min(1, dt * 4); kamera.updateProjectionMatrix();
      const asp = window.innerWidth / window.innerHeight, ft = Math.tan(kamera.fov * Math.PI / 360);
      const yar = 208 * PARK_OLCEK / 2 + 14, yuk = 100 * PARK_OLCEK / 2 + 12;
      const hh = Math.max(yar / (ft * asp), yuk / ft);
      kamera.up.set(0, 0, -1);
      kamera.position.set(ARX, hh, ARZ - 5 + 0.01); kamera.lookAt(ARX, 0, ARZ - 5);
    } else if (gor === 1) {
      // yukarıdan: motorun yönü ekranda hep yukarı, böylece direksiyon doğal kalır
      kamera.fov += (62 - kamera.fov) * Math.min(1, dt * 4); kamera.updateProjectionMatrix();
      kamera.up.set(fx, 0, fz);
      kamera.position.set(park.x, 42, park.z); kamera.lookAt(park.x + fx * 0.001, 0, park.z + fz * 0.001);
    } else {
      kamera.up.set(0, 1, 0);
      let tx = park.x - fx * 6.2, tz = park.z - fz * 6.2;
      if (!park.kam) park.kam = new THREE.Vector3(tx, 3.4, tz);
      const kk = 1 - Math.exp(-dt * 6);
      park.kam.x += (tx - park.kam.x) * kk; park.kam.y += ((3.4 + park.y * 0.6) - park.kam.y) * kk; park.kam.z += (tz - park.kam.z) * kk;
      kamera.position.copy(park.kam);
      kamera.lookAt(park.x + fx * 3.5, 0.6 + park.y * 0.6, park.z + fz * 3.5);
    }
    park.kubbe.position.copy(kamera.position);
  } else if (surus.oturuyor) {
    // sürüş kamerası: motorun biraz arkasında ve yukarısında, ön tarafa (gidon, ön teker) ve çevreye bakar
    const fx = Math.cos(surus.h), fz = -Math.sin(surus.h);
    let tx = surus.x - fx * 3.0, tz = surus.z - fz * 3.0;
    tx = sinir(tx, R3.x0 + 0.3, R3.x1 - 0.3); tz = sinir(tz, R3.z0 + 0.2, R3.z1 - 0.3);
    if (!surus.kam) surus.kam = new THREE.Vector3(tx, 2.4, tz);
    const k = 1 - Math.exp(-dt * 5);
    surus.kam.x += (tx - surus.kam.x) * k; surus.kam.y += (2.4 - surus.kam.y) * k; surus.kam.z += (tz - surus.kam.z) * k;
    kamera.position.copy(surus.kam);
    kamera.lookAt(surus.x + fx * 1.6, 0.45, surus.z + fz * 1.6);
  } else {
    kamera.position.set(cx, cy2, cz);
    kamera.lookAt(hx, hy + 0.15, hz);
  }
  renderer.render(sahne, kamera);
}
requestAnimationFrame(kare);

document.getElementById('basla').addEventListener('click', () => {
  basladi = true;
  muzikKur();
  ogrBasla();
  try { sesBagl = new (window.AudioContext || window.webkitAudioContext)(); if (sesBagl.resume) sesBagl.resume(); adimlariYukle(); } catch (e) { sesBagl = null; }
  document.getElementById('giris').classList.add('gizli');
  setTimeout(() => document.getElementById('ipucu').classList.add('gizli'), 7000);
});

document.addEventListener('visibilitychange', () => {
  if (!muzik) return;
  if (document.hidden) { muzik.pause(); if (muzik2) muzik2.pause(); if (muzik3) muzik3.pause(); if (muzik4) muzik4.pause(); if (muzik5) muzik5.pause(); }
  else if (basladi) { const p = muzik.play(); if (p && p.catch) p.catch(() => {}); if (muzik2) { const q = muzik2.play(); if (q && q.catch) q.catch(() => {}); } if (muzik3) { const r = muzik3.play(); if (r && r.catch) r.catch(() => {}); } if (muzik4) { const r4 = muzik4.play(); if (r4 && r4.catch) r4.catch(() => {}); } if (muzik5) { const r5 = muzik5.play(); if (r5 && r5.catch) r5.catch(() => {}); } }
});
