'use strict';
// İlk deneme: koridor + 1 kapı + 1 oda (1 fotoğraf, 1 şarkı)

const ODA1 = {
  foto: 'foto/oda1-1.jpg',
  yazi: 'Buzda ikimiz',
  sarki: 'muzik/kupa-kizi.mp3'
};

const canvas = document.getElementById('sahne');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
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

sahne.add(new THREE.AmbientLight(0x45354c, 0.62));

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
kutu(ODA_X * 2, 0.1, odaUzun, new THREE.MeshPhongMaterial({ specular: 0x110d08, shininess: 6,  color: 0x1d1723 }), 0, -0.05, odaOrta);
kutu(ODA_X * 2, 0.1, odaUzun, matOda, 0, ODA_Y + 0.05, odaOrta);
kutu(0.1, ODA_Y, odaUzun, matOda, -ODA_X - 0.05, ODA_Y / 2, odaOrta);
kutu(0.1, ODA_Y, odaUzun, matOda, ODA_X + 0.05, ODA_Y / 2, odaOrta);
kutu(ODA_X * 2, ODA_Y, 0.1, matOda, 0, ODA_Y / 2, ODA_SON - 0.05);
// kapı hizasındaki oda duvarı (koridor genişliği dışı)
kutu(ODA_X - KOR_X, ODA_Y, 0.1, matOda, -(KOR_X + (ODA_X - KOR_X) / 2), ODA_Y / 2, KAPI_Z - 0.06);
kutu(ODA_X - KOR_X, ODA_Y, 0.1, matOda, KOR_X + (ODA_X - KOR_X) / 2, ODA_Y / 2, KAPI_Z - 0.06);
kutu(KOR_X * 2, ODA_Y - YUKSEK, 0.1, matOda, 0, YUKSEK + (ODA_Y - YUKSEK) / 2, KAPI_Z - 0.06);

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
function duvarMum(x, y, z, rotY, isikGuc, menzil) {
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
  mumlar.push({ alev, isik, guc: isikGuc, faz: Math.random() * 10 });
}
// koridor: iki duvarda dönüşümlü
[[-1, 1.0, 1.6], [1, -2.0, 1.6], [-1, -5.0, 1.6], [1, -8.0, 1.6], [-1, -11.0, 1.6], [1, -14.0, 0]].forEach(k => {
  duvarMum(k[0] * KOR_X, 1.5, k[1], -k[0] * Math.PI / 2, k[2], 7);
});
// koridorun başı: uç duvarda
[-0.9, 0.9].forEach(x => duvarMum(x, 1.5, KOR_BAS, Math.PI, 0, 0));
// oda: fotoğraf duvarı
duvarMum(-1.6, 1.15, ODA_SON, 0, 1.5, 10);
duvarMum(1.6, 1.15, ODA_SON, 0, 1.5, 10);
[-3.0, 3.0, -4.6, 4.6].forEach(x => duvarMum(x, 1.15, ODA_SON, 0, 0, 0));
// oda: yan duvarlar (videoların iki yanında)
[-17.6, -18.9, -24.6, -25.7].forEach(z => {
  duvarMum(-ODA_X, 1.2, z, Math.PI / 2, 0, 0);
  if (z < -20) duvarMum(ODA_X, 1.2, z, -Math.PI / 2, 0, 0);
});
// oda: kapı tarafındaki duvar
[-4.0, -2.4, 2.4, 4.0].forEach(x => duvarMum(x, 1.5, KAPI_Z - 0.11, Math.PI, 0, 0));

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
    yanOklar.push({ mat, k });
  });
  // devamı: yan duvarda köşeden videoya doğru
  [-26.3, -25.6, -24.9, -24.2].forEach((z, n) => {
    const mat = new THREE.MeshBasicMaterial({ color: 0xe8b25f, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
    const ok = new THREE.Mesh(okGeo, mat);
    ok.scale.set(yon < 0 ? -0.7 : 0.7, 0.7, 1);
    ok.position.set(yon * (ODA_X - 0.01), 1.9, z);
    ok.rotation.y = -yon * Math.PI / 2;
    sahne.add(ok);
    yanOklar.push({ mat, k: 5 + n });
  });
});

// ---------- Tabloların yanından dökülen gül yaprakları ----------
const DOK_YER = [
  { x: -1.5, z: ODA_SON + 0.4, gx: 0.45, gz: 0.25 }, { x: 1.5, z: ODA_SON + 0.4, gx: 0.45, gz: 0.25 },
  { x: -5.05, z: -23.8, gx: 0.3, gz: 0.4 }, { x: -5.05, z: -19.4, gx: 0.3, gz: 0.4 },
  { x: 5.05, z: -23.0, gx: 0.3, gz: 0.4 }, { x: 5.05, z: -20.2, gx: 0.3, gz: 0.4 }
];
const DOK_N = 280;
const dokGeo = new THREE.SphereGeometry(0.06, 8, 6);
dokGeo.scale(1, 0.14, 0.72);
const dokGrup = new THREE.InstancedMesh(dokGeo, new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0x220a0a, shininess: 10 }), DOK_N);
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
let fotoNet = null, fotoBulanik = null, fotoIsik = null;
const odaIsik = new THREE.PointLight(0xfff0dc, 0, 16, 2);
odaIsik.position.set(0, 2.6, ODA_SON + 3);
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
  const isik = new THREE.PointLight(0xdfe8ff, 0, 9, 2);
  isik.position.set(yon * (ODA_X - 1.2), y, z);
  sahne.add(isik);
  videolar.push({ v, isik, ekran, x: ekran.position.x, z, oynuyor: false, parlak: 0.3 });
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
    const hedefP = olsun ? 1 : (icerde ? 0.3 : 0);
    o.parlak += (hedefP - o.parlak) * Math.min(1, dt * 3);
    o.ekran.material.color.setRGB(o.parlak, o.parlak, o.parlak);
    o.isik.intensity = 0.55 * o.parlak;
  });
}

// ---------- Soru tahtası: "Mehmetnur kaç kere kayıp düştü?" ----------
const SORU = {
  metin: 'Mehmetnur kaç kere kayıp düştü?',
  secenekler: ['4', '5', '6', 'Çok'],
  dogru: 'Çok',
  yanlis: {
    '4': 'Yok canım, daha fazla. Bir daha dene 😄',
    '5': 'Hayır hayır, saymayı bırakmıştım...',
    '6': 'Yaklaşmadı bile. Buz biliyor 🙈'
  },
  dogruMesaj: 'Bildin! Çok! Buz da, o çocuk da şahit.'
};
const SORU_X = -3.2, SORU_Z = -16.16, SORU_Y = 1.85;
let soruCozuldu = false;
const soruCan = document.createElement('canvas');
soruCan.width = 1024; soruCan.height = 768;
const soruDoku = new THREE.CanvasTexture(soruCan);
soruDoku.anisotropy = 4;
function soruCiz() {
  const x = soruCan.getContext('2d'), W = 1024, H = 768;
  x.clearRect(0, 0, W, H);
  x.fillStyle = '#1b1517'; x.fillRect(0, 0, W, H);
  const altin = x.createLinearGradient(0, 0, W, H);
  altin.addColorStop(0, '#fff3cf'); altin.addColorStop(0.5, '#d9a94f'); altin.addColorStop(1, '#f7e2a6');
  x.strokeStyle = altin; x.lineWidth = 8; x.strokeRect(24, 24, W - 48, H - 48);
  x.lineWidth = 3; x.strokeRect(46, 46, W - 92, H - 92);
  x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = altin;
  const font = (b) => b + 'px "Great Vibes", "Snell Roundhand", "Brush Script MT", cursive';
  const sar = (t, y, b, en) => { x.font = font(b); while (x.measureText(t).width > en && b > 30) { b -= 4; x.font = font(b); } x.fillText(t, W / 2, y); };
  if (!soruCozuldu) {
    sar('Bir soru', 150, 120, 700);
    sar('Mehmetnur', 330, 150, 760);
    sar('kaç kere', 470, 130, 760);
    sar('kayıp düştü?', 610, 130, 760);
    x.font = 'italic 34px Georgia, serif'; x.fillStyle = 'rgba(243,233,220,.7)';
    x.fillText('cevap için yaklaş', W / 2, 700);
  } else {
    sar('Cevap', 170, 130, 700);
    sar('Çok!', 400, 260, 760);
    x.fillStyle = '#e0556f'; x.font = '80px Georgia, serif';
    x.fillText('♥', W / 2, 640);
  }
  soruDoku.needsUpdate = true;
}
soruCiz();
if (document.fonts && document.fonts.load) document.fonts.load('100px "Great Vibes"', 'Bir soru Mehmetnur kaç kere kayıp düştü? Cevap Çok').then(soruCiz).catch(() => {});
const soruCerceve = new THREE.Mesh(new THREE.BoxGeometry(1.52, 1.17, 0.04),
  new THREE.MeshPhongMaterial({ color: 0x3a2a14, specular: 0x000000 }));
soruCerceve.position.set(SORU_X, SORU_Y, SORU_Z + 0.03);
sahne.add(soruCerceve);
const soruTahta = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.05),
  new THREE.MeshBasicMaterial({ map: soruDoku, color: 0x9a9a9a, fog: false }));
soruTahta.position.set(SORU_X, SORU_Y, SORU_Z - 0.0);
soruTahta.rotation.y = Math.PI;
sahne.add(soruTahta);

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
      soruCiz();
      kalpPatlat();
      soruBitisZ = performance.now() + 6000;
    } else {
      soruMesaj.textContent = SORU.yanlis[sc] || 'Bir daha dene.';
      soruMesaj.className = 'yanlis';
      b.classList.add('sal');
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
  const dx = SORU_X - kon.x, dz = SORU_Z - kon.z, uz = Math.hypot(dx, dz);
  const bak = (-Math.sin(kon.yaw) * dx - Math.cos(kon.yaw) * dz) / (uz || 1);
  let goster = icerde && uz < 4.8 && bak > (soruGorunur ? 0.2 : 0.45);
  if (soruCozuldu && performance.now() > soruBitisZ) goster = false;
  if (goster !== soruGorunur) { soruGorunur = goster; soruKart.classList.toggle('acik', goster); }
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
zeminYolu(0, -17.7, 0, -23.4, 7);          // fotoğrafa
zeminYolu(-0.8, -18.0, -4.0, -21.4, 5);    // sol videoya
zeminYolu(0.8, -18.0, 4.0, -21.4, 5);      // sağ videoya
zeminYolu(-1.2, -17.0, -2.7, -17.0, 3);    // soru tahtasına
zeminYolu(0.8, -17.7, 3.6, -18.5, 3);      // sonraki odaya kapıya

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
  g.position.set(ODA_X, 0, -18.7);
  g.rotation.y = -Math.PI / 2; // yüzü odaya (−x) bakar
  const kasaMat = new THREE.MeshPhongMaterial({ color: 0xb08a4f, specular: 0xfff0c0, shininess: 40, emissive: 0x2a1c06 });
  [-1, 1].forEach(y => {
    const k = new THREE.Mesh(new THREE.BoxGeometry(0.08, YUK + 0.1, 0.1), kasaMat);
    k.position.set(y * (GEN / 2 + 0.05), YUK / 2, 0.05); g.add(k);
  });
  const ust = new THREE.Mesh(new THREE.BoxGeometry(GEN + 0.18, 0.1, 0.1), kasaMat);
  ust.position.set(0, YUK + 0.05, 0.05); g.add(ust);
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
  const kanat = new THREE.Mesh(new THREE.PlaneGeometry(GEN, YUK), new THREE.MeshBasicMaterial({ map: doku, color: 0x8a8a8a, fog: false }));
  kanat.position.set(0, YUK / 2, 0.06);
  g.add(kanat);
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
function muzikKur() {
  muzik = new Audio(ODA1.sarki);
  muzik.loop = true;
  muzik.volume = 0;
  muzik.addEventListener('error', () => { muzikVar = false; });
  const p = muzik.play();
  if (p && p.catch) p.catch(() => {});
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
    const p = parilti(h[2], 0.55); p.position.set(h[0], h[1], 0); govde.add(p); halolar.push(p);
  });
  govde.position.y = 0.4;
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

// ---------- Kontrol ----------
const kon = { yaw: 0, pitch: -0.22, x: 0, z: 1.2, ileri: 0, yan: 0, joyX: 0, joyY: 0, tus: {} };
let basladi = false;

window.addEventListener('keydown', e => { kon.tus[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', e => { kon.tus[e.key.toLowerCase()] = false; });

const joy = document.getElementById('joy'), joyTop = document.getElementById('joyTop');
let joyId = null, bakId = null, sonX = 0, sonY = 0;

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
  bakId = e.pointerId; sonX = e.clientX; sonY = e.clientY; canvas.setPointerCapture(e.pointerId);
  document.getElementById('ipucu').classList.add('gizli');
});
canvas.addEventListener('pointermove', e => {
  if (e.pointerId !== bakId) return;
  kon.yaw -= (e.clientX - sonX) * 0.005;
  kon.pitch -= (e.clientY - sonY) * 0.004;
  kon.pitch = Math.max(-0.85, Math.min(0.45, kon.pitch));
  sonX = e.clientX; sonY = e.clientY;
});
function bakBitir(e) { if (e.pointerId === bakId) bakId = null; }
canvas.addEventListener('pointerup', bakBitir);
canvas.addEventListener('pointercancel', bakBitir);

// ---------- Döngü ----------
const yaziKutu = document.getElementById('yazi');
let kapiAci = 0, kapiAcik = false, odadaMi = false, yaziAcik = false;
const sinir = (v, a, b) => Math.max(a, Math.min(b, v));
const yumusak = (a, b, v) => { const t = sinir((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
let onceki = performance.now();

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
    if (t['arrowleft']) kon.yaw += 1.6 * dt;
    if (t['arrowright']) kon.yaw -= 1.6 * dt;
    const hiz = 2.2;
    const sy = Math.sin(kon.yaw), cy = Math.cos(kon.yaw);
    let mx = -sy * ileri + cy * yan, mz = -cy * ileri - sy * yan;
    const ml = Math.hypot(mx, mz);
    if (ml > 1) { mx /= ml; mz /= ml; }
    kon.x += mx * hiz * dt;
    kon.z += mz * hiz * dt;
    yurume = Math.min(1, ml);
    if (ml > 0.08) {
      const hedef = Math.atan2(-mx, -mz);
      let fark = hedef - ikiliYon;
      fark = Math.atan2(Math.sin(fark), Math.cos(fark));
      ikiliYon += fark * Math.min(1, dt * 9);
    }

    // sınırlar
    if (kon.z > KAPI_Z + 0.4) {
      kon.x = sinir(kon.x, -KOR_X + 0.5, KOR_X - 0.5);
      kon.z = Math.min(kon.z, KOR_BAS - 0.3);
    } else if (kon.z > KAPI_Z - 1.8) {
      if (!kapiAcik) kon.z = KAPI_Z + 0.4;
      else kon.x = sinir(kon.x, -AC_GEN / 2 + 0.45, AC_GEN / 2 - 0.45);
    } else {
      kon.x = sinir(kon.x, -ODA_X + 0.7, ODA_X - 0.7);
      kon.z = Math.max(kon.z, ODA_SON + 1);
    }

    // kapı
    if (!kapiAcik) {
      // koridordan yaklaşınca ya da odadan kapıya dönünce açılır
      if (kon.z < KAPI_Z + 3.2 && kon.z > KAPI_Z - 2.0) kapiAcik = true;
    } else if (kon.z < KAPI_Z - 3.4) {
      // odaya iyice girince arkasından kapanır
      kapiAcik = false;
      kapiSesi();
    }
    const hedefAci = kapiAcik ? Math.PI * 0.5 : 0;
    kapiAci += (hedefAci - kapiAci) * Math.min(1, dt * 2.2);
    kapiMenteşe.rotation.y = kapiAci;

    // oda: müzik ve ışık
    const icerde = kon.z < KAPI_Z - 0.6;
    if (icerde !== odadaMi) { odadaMi = icerde; muzikHedef = icerde ? 0.85 : 0; }
    const fotoUz = Math.hypot(kon.x, kon.z - FOTO_Z);
    const yakin = icerde ? yumusak(10, 3.2, fotoUz) : 0;
    odaIsik.intensity = 0.55 + 1.4 * yakin;
    if (fotoNet) {
      const parlak = 0.12 + 0.88 * yakin;
      fotoNet.material.color.setRGB(parlak, parlak, parlak);
      fotoBulanik.material.color.setRGB(parlak, parlak, parlak);
      fotoBulanik.material.opacity = 1 - yumusak(7, 3.6, fotoUz);
    }
    videoGuncelle(icerde, dt);
    soruGuncelle(icerde);
    const yaziGerek = icerde && fotoUz < 4.6;
    if (yaziGerek !== yaziAcik) {
      yaziAcik = yaziGerek;
      yaziKutu.textContent = ODA1.yazi;
      yaziKutu.classList.toggle('acik', yaziAcik);
    }
  }

  // fotoğraf yanı oklar: odadayken yumuşakça yanıp söner
  yanOklar.forEach(o => { o.mat.opacity = odadaMi ? 0.06 + 0.6 * Math.pow(0.5 + 0.5 * Math.sin(simdi / 380 - o.k * 0.9), 2) : 0; });

  // zemin okları: kapı açılınca silik silik yanıp söner
  zeminOklar.forEach(o => { o.mat.opacity = kapiAcik ? 0.03 + 0.3 * Math.pow(0.5 + 0.5 * Math.sin(simdi / 430 - o.k * 0.9), 2) : 0; });

  if (sonrakiKapiIsik) sonrakiKapiIsik.material.opacity = 0.22 + 0.16 * Math.sin(simdi / 900);

  // okların nabzı
  const nabiz = 0.7 + 0.3 * Math.sin(simdi / 350);
  matOk.color.setRGB(0.91 * nabiz, 0.7 * nabiz, 0.37 * nabiz);

  if (basladi && kon.z < KAPI_Z + 6) yaprakDok(dt, simdi / 1000);

  // mum titremesi
  const zaman = simdi / 1000;
  mumlar.forEach(m => {
    const n = 0.88 + 0.08 * Math.sin(zaman * 9 + m.faz) + 0.06 * Math.sin(zaman * 23 + m.faz * 2);
    m.alev.scale.set(n, 1.9 * n, n);
    if (m.isik) m.isik.intensity = m.guc * n;
  });

  // müzik yumuşak geçiş
  if (muzik && muzikVar) {
    const v = muzik.volume;
    muzik.volume = sinir(v + (muzikHedef - v) * Math.min(1, dt * 0.7), 0, 1);
  }

  // karakter animasyonu
  yurumeFaz += dt * 7 * yurume;
  egim += ((-0.12 * yurume) - egim) * Math.min(1, dt * 6);
  govde.position.y = 0.4 + Math.sin(simdi / 700) * 0.035 + Math.abs(Math.sin(yurumeFaz)) * 0.025 * yurume;
  govde.rotation.x = egim;
  govde.rotation.z = Math.sin(yurumeFaz) * 0.045 * yurume + Math.sin(simdi / 1100) * 0.015;
  ikili.position.set(kon.x, 0, kon.z);
  ikili.rotation.y = ikiliYon;
  ikiliKalp.position.y = 0.33 + Math.sin(simdi / 450) * 0.025;
  halolar.forEach((h, k) => { h.material.opacity = 0.5 + 0.15 * Math.sin(simdi / 600 + k * 2); });
  if (basladi) zerreGuncelle(dt, kon.x, kon.z, ikiliYon, yurume > 0.15);

  // kamera: karakterin arkasında, bakış yönünün tersinde
  const cp = Math.cos(kon.pitch), sp = Math.sin(kon.pitch);
  const bx = -Math.sin(kon.yaw) * cp, by = sp, bz = -Math.cos(kon.yaw) * cp;
  const D = 2.4, hx = kon.x, hy = 0.85, hz = kon.z;
  let cx = hx - bx * D, cy2 = hy - by * D, cz = hz - bz * D;
  if (cz > KAPI_Z + 0.1) { cx = sinir(cx, -KOR_X + 0.2, KOR_X - 0.2); cz = Math.min(cz, KOR_BAS - 0.15); }
  else if (cz > KAPI_Z - 0.6) { cx = sinir(cx, -AC_GEN / 2 + 0.15, AC_GEN / 2 - 0.15); }
  else { cx = sinir(cx, -ODA_X + 0.2, ODA_X - 0.2); cz = Math.max(cz, ODA_SON + 0.3); }
  cy2 = sinir(cy2, 0.25, cz > KAPI_Z ? YUKSEK - 0.2 : ODA_Y - 0.2);
  kamera.position.set(cx, cy2, cz);
  kamera.lookAt(hx, hy + 0.15, hz);
  renderer.render(sahne, kamera);
}
requestAnimationFrame(kare);

document.getElementById('basla').addEventListener('click', () => {
  basladi = true;
  muzikKur();
  try { sesBagl = new (window.AudioContext || window.webkitAudioContext)(); if (sesBagl.resume) sesBagl.resume(); } catch (e) { sesBagl = null; }
  document.getElementById('giris').classList.add('gizli');
  setTimeout(() => document.getElementById('ipucu').classList.add('gizli'), 7000);
});

document.addEventListener('visibilitychange', () => {
  if (!muzik) return;
  if (document.hidden) muzik.pause();
  else if (basladi) { const p = muzik.play(); if (p && p.catch) p.catch(() => {}); }
});
