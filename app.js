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
sahne.fog = new THREE.FogExp2(ZEMIN, 0.045);
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

sahne.add(new THREE.AmbientLight(0x2a2030, 0.35));

const matZemin = new THREE.MeshLambertMaterial({ color: 0x2b1d17 });
const matDuvar = new THREE.MeshLambertMaterial({ color: 0x5a4636 });
const matOda = new THREE.MeshLambertMaterial({ color: 0x3a3340 });

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
const matKasa = new THREE.MeshLambertMaterial({ color: 0xb08a4f });
kutu(0.08, AC_YUK, 0.16, matKasa, -AC_GEN / 2, AC_YUK / 2, KAPI_Z);
kutu(0.08, AC_YUK, 0.16, matKasa, AC_GEN / 2, AC_YUK / 2, KAPI_Z);
kutu(AC_GEN + 0.08, 0.08, 0.16, matKasa, 0, AC_YUK, KAPI_Z);
const kapiMenteşe = new THREE.Group();
kapiMenteşe.position.set(-AC_GEN / 2, 0, KAPI_Z);
const kanat = new THREE.Mesh(new THREE.BoxGeometry(AC_GEN - 0.02, AC_YUK - 0.02, 0.06),
  new THREE.MeshLambertMaterial({ color: 0x7a4a2a }));
kanat.position.set(AC_GEN / 2, AC_YUK / 2, 0);
kapiMenteşe.add(kanat);
const kol = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), new THREE.MeshLambertMaterial({ color: 0xd9b56b }));
kol.position.set(AC_GEN - 0.15, 1.05, 0.06);
kapiMenteşe.add(kol);
sahne.add(kapiMenteşe);

// oda
const odaUzun = KAPI_Z - ODA_SON;
const odaOrta = (KAPI_Z + ODA_SON) / 2;
kutu(ODA_X * 2, 0.1, odaUzun, new THREE.MeshLambertMaterial({ color: 0x1d1820 }), 0, -0.05, odaOrta);
kutu(ODA_X * 2, 0.1, odaUzun, matOda, 0, ODA_Y + 0.05, odaOrta);
kutu(0.1, ODA_Y, odaUzun, matOda, -ODA_X - 0.05, ODA_Y / 2, odaOrta);
kutu(0.1, ODA_Y, odaUzun, matOda, ODA_X + 0.05, ODA_Y / 2, odaOrta);
kutu(ODA_X * 2, ODA_Y, 0.1, matOda, 0, ODA_Y / 2, ODA_SON - 0.05);
// kapı hizasındaki oda duvarı (koridor genişliği dışı)
kutu(ODA_X - KOR_X, ODA_Y, 0.1, matOda, -(KOR_X + (ODA_X - KOR_X) / 2), ODA_Y / 2, KAPI_Z - 0.06);
kutu(ODA_X - KOR_X, ODA_Y, 0.1, matOda, KOR_X + (ODA_X - KOR_X) / 2, ODA_Y / 2, KAPI_Z - 0.06);
kutu(KOR_X * 2, ODA_Y - YUKSEK, 0.1, matOda, 0, YUKSEK + (ODA_Y - YUKSEK) / 2, KAPI_Z - 0.06);

// koridor lambaları (sıcak, kısa menzilli ki odaya sızmasın)
[0, -5, -10].forEach(z => {
  const l = new THREE.PointLight(0xffc98a, 1.1, 8, 2);
  l.position.set(0, 2.6, z);
  sahne.add(l);
  const abajur = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffd9a8 }));
  abajur.position.copy(l.position);
  sahne.add(abajur);
});

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

  kutu(gen + 0.24, FOTO_YUK + 0.24, 0.06, new THREE.MeshLambertMaterial({ color: 0x1a1210 }), 0, FOTO_Y, ODA_SON - 0.0 + 0.0);
  fotoNet = new THREE.Mesh(new THREE.PlaneGeometry(gen, FOTO_YUK),
    new THREE.MeshBasicMaterial({ map: tex, color: 0x1f1f1f, fog: false }));
  fotoNet.position.set(0, FOTO_Y, FOTO_Z);
  sahne.add(fotoNet);
  fotoBulanik = new THREE.Mesh(new THREE.PlaneGeometry(gen, FOTO_YUK),
    new THREE.MeshBasicMaterial({ map: bulTex, color: 0x1f1f1f, transparent: true, fog: false }));
  fotoBulanik.position.set(0, FOTO_Y, FOTO_Z + 0.004);
  sahne.add(fotoBulanik);
});

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

// ---------- Kontrol ----------
const kon = { yaw: 0, pitch: 0, x: 0, z: 2, ileri: 0, yan: 0, joyX: 0, joyY: 0, tus: {} };
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
  kon.pitch = Math.max(-1.1, Math.min(1.1, kon.pitch));
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
    kon.x += (-sy * ileri + cy * yan) * hiz * dt;
    kon.z += (-cy * ileri - sy * yan) * hiz * dt;

    // sınırlar
    if (kon.z > KAPI_Z + 0.4) {
      kon.x = sinir(kon.x, -KOR_X + 0.3, KOR_X - 0.3);
      kon.z = Math.min(kon.z, KOR_BAS - 0.3);
    } else if (kon.z > KAPI_Z - 1.8) {
      if (!kapiAcik) kon.z = KAPI_Z + 0.4;
      else kon.x = sinir(kon.x, -AC_GEN / 2 + 0.25, AC_GEN / 2 - 0.25);
    } else {
      kon.x = sinir(kon.x, -ODA_X + 0.4, ODA_X - 0.4);
      kon.z = Math.max(kon.z, ODA_SON + 1);
    }

    // kapı
    if (!kapiAcik && kon.z < KAPI_Z + 3.2) kapiAcik = true;
    const hedefAci = kapiAcik ? Math.PI * 0.5 : 0;
    kapiAci += (hedefAci - kapiAci) * Math.min(1, dt * 2.2);
    kapiMenteşe.rotation.y = kapiAci;

    // oda: müzik ve ışık
    const icerde = kon.z < KAPI_Z - 0.6;
    if (icerde !== odadaMi) { odadaMi = icerde; muzikHedef = icerde ? 0.85 : 0; }
    const fotoUz = Math.hypot(kon.x, kon.z - FOTO_Z);
    const yakin = icerde ? yumusak(10, 3.2, fotoUz) : 0;
    odaIsik.intensity = 0.15 + 1.6 * yakin;
    if (fotoNet) {
      const parlak = 0.12 + 0.88 * yakin;
      fotoNet.material.color.setRGB(parlak, parlak, parlak);
      fotoBulanik.material.color.setRGB(parlak, parlak, parlak);
      fotoBulanik.material.opacity = 1 - yumusak(7, 3.6, fotoUz);
    }
    const yaziGerek = icerde && fotoUz < 4.6;
    if (yaziGerek !== yaziAcik) {
      yaziAcik = yaziGerek;
      yaziKutu.textContent = ODA1.yazi;
      yaziKutu.classList.toggle('acik', yaziAcik);
    }
  }

  // müzik yumuşak geçiş
  if (muzik && muzikVar) {
    const v = muzik.volume;
    muzik.volume = sinir(v + (muzikHedef - v) * Math.min(1, dt * 0.7), 0, 1);
  }

  kamera.position.set(kon.x, 1.6, kon.z);
  kamera.rotation.set(kon.pitch, kon.yaw, 0);
  renderer.render(sahne, kamera);
}
requestAnimationFrame(kare);

document.getElementById('basla').addEventListener('click', () => {
  basladi = true;
  muzikKur();
  document.getElementById('giris').classList.add('gizli');
  setTimeout(() => document.getElementById('ipucu').classList.add('gizli'), 7000);
});

document.addEventListener('visibilitychange', () => {
  if (!muzik) return;
  if (document.hidden) muzik.pause();
  else if (basladi) { const p = muzik.play(); if (p && p.catch) p.catch(() => {}); }
});
