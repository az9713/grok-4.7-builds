import puppeteer from 'puppeteer-core';
import { pathToFileURL, fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
const root = path.dirname(fileURLToPath(import.meta.url));
const arg = (k, d) => { const a = process.argv.find(x => x.startsWith('--'+k+'=')); return a ? a.split('=')[1] : d; };
const FPS = +arg('fps', 12), DURATION = 150;
const from = +arg('from', 0), to = Math.min(DURATION, +arg('to', DURATION));
const framesDir = path.resolve(root, 'frames');
const out = path.resolve(root, arg('out', 'out/film.mp4'));
const f0 = Math.round(from * FPS), f1 = Math.round(to * FPS);
const name = i => path.join(framesDir, 'f_'+String(i).padStart(5,'0')+'.jpg');
fs.mkdirSync(framesDir, { recursive: true });
fs.mkdirSync(path.dirname(out), { recursive: true });
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--mute-audio','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
page.on('pageerror', e => console.error('PAGE', e.message));
await page.evaluateOnNewDocument(() => { window.RENDER = true; });
await page.goto(pathToFileURL(path.join(root, 'index.html')).href, { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForFunction('window.studioReady === true', { timeout: 120000 });
const t0 = Date.now();
let done = 0;
for (let i = f0; i < f1; i++) {
  if (fs.existsSync(name(i)) && fs.statSync(name(i)).size > 1000) continue;
  await page.evaluate(t => window.renderFrame(t), i / FPS);
  const tmp = name(i)+'.part';
  await page.screenshot({ path: tmp, type: 'jpeg', quality: 85 });
  fs.renameSync(tmp, name(i));
  done++;
  if (done % 40 === 0) console.log('frame', i, 'rate', (done/((Date.now()-t0)/1000)).toFixed(2));
}
await browser.close();
const ff = spawnSync('ffmpeg', ['-y','-loglevel','error','-stats','-framerate',String(FPS),'-i', path.join(framesDir,'f_%05d.jpg'),
  '-i', path.join(root,'assets','score.wav'), '-t', String(DURATION),
  '-c:v','libx264','-pix_fmt','yuv420p','-crf','20','-c:a','aac','-shortest', out], { stdio: 'inherit' });
if (ff.status !== 0) process.exit(ff.status || 1);
console.log('wrote', out);
