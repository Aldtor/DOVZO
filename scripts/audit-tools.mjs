// Run with PLAYWRIGHT_MODULE pointing to an installed playwright module.
import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const dir=process.env.AUDIT_DIR || '/tmp/dovzo-audit'; await fs.mkdir(dir,{recursive:true});
execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-f','lavfi','-i','testsrc=size=160x120:rate=10','-f','lavfi','-i','sine=frequency=440:sample_rate=44100','-t','2','-c:v','libvpx','-c:a','libvorbis','-y',`${dir}/sample.webm`]);
execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-f','lavfi','-i','sine=frequency=440:sample_rate=44100','-t','2','-y',`${dir}/sample.wav`]);
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox']});
const context=await browser.newContext({acceptDownloads:true}); const page=await context.newPage();page.setDefaultTimeout(12000);
const errors=[]; page.on('pageerror',e=>errors.push(e.message));
const pdf=await PDFDocument.create();pdf.addPage([200,300]);pdf.addPage([300,200]);await fs.writeFile(`${dir}/sample.pdf`,await pdf.save());
const zip=new JSZip();zip.file('hello.txt','Hello DOVZO');await fs.writeFile(`${dir}/sample.zip`,await zip.generateAsync({type:'nodebuffer'}));
await page.goto(process.env.AUDIT_URL || 'http://localhost:3000');
const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=120;c.height=80;const x=c.getContext('2d');x.fillStyle='#ff0000';x.fillRect(0,0,60,80);x.fillStyle='#0000ff';x.fillRect(60,0,60,80);return c.toDataURL();});
await fs.writeFile(`${dir}/sample.png`,Buffer.from(png.split(',')[1],'base64'));
const slugs=[...(await fs.readFile('src/components/tools/registry.ts','utf8')).matchAll(/^  "([^"]+)":/gm)].map(m=>m[1]);
const results=[];let region;
async function download(button){const promise=page.waitForEvent('download');await button.click();const d=await promise;const path=`${dir}/${Date.now()}-${d.suggestedFilename()}`;await d.saveAs(path);const bytes=await fs.readFile(path);assert(bytes.length>0);return {bytes,path};}
async function upload(names){await region.locator('input[type=file]').setInputFiles(names.map(n=>`${dir}/${n}`));}
async function textIncludes(text){await page.waitForFunction(t=>document.querySelector('.tool-workspace')?.innerText.includes(t),text);}
async function out(expected){await page.waitForFunction(t=>[...document.querySelectorAll('.tool-workspace textarea[readonly]')].some(e=>e.value===t),expected);}
const transforms={
 'case-converter':['Hello World','HELLO WORLD'],'duplicate-line-remover':['a\na\nb','a\nb'],'text-reverser':['abc','cba'],'text-sorter':['z\na','a\nz'],'slug-generator':['Café Hello!','cafe-hello'],
 'json-formatter':['{"a":1}','{\n  "a": 1\n}'],'json-minifier':['{ "a": 1 }','{"a":1}'],'base64-encoder':['Hello ✓',Buffer.from('Hello ✓').toString('base64')],'base64-decoder':[Buffer.from('Hello ✓').toString('base64'),'Hello ✓'],'url-encoder-decoder':['hello world','hello%20world']};
for(const slug of slugs){errors.length=0;try{
 await page.goto(`${process.env.AUDIT_URL || 'http://localhost:3000'}/tools/${slug}`);region=page.locator('.tool-workspace');await region.waitFor();await page.waitForFunction(()=>[...document.querySelectorAll('.tool-workspace input, .tool-workspace textarea, .tool-workspace button')].some(el=>Object.keys(el).some(k=>k.startsWith('__reactProps'))));await page.waitForTimeout(550);
 if(transforms[slug]){await region.locator('textarea:not([readonly])').fill(transforms[slug][0]);await out(transforms[slug][1]);}
 else if(['image-compressor','image-resizer','image-cropper','image-converter','image-rotator','image-flipper'].includes(slug)){
 await upload(['sample.png']);if(slug==='image-resizer')await region.getByLabel('Width (px)').fill('60');if(slug==='image-cropper')await region.getByRole('button',{name:'1:1',exact:true}).click();
 const d=await download(region.getByRole('button',{name:'Download',exact:true}));const dimensions=await page.evaluate(async b64=>{const i=new Image();i.src='data:image/png;base64,'+b64;await i.decode();return [i.naturalWidth,i.naturalHeight];},d.bytes.toString('base64'));assert.deepEqual(dimensions,slug==='image-resizer'?[60,40]:slug==='image-cropper'?[80,80]:slug==='image-rotator'?[80,120]:[120,80]);}
 else if(slug==='image-to-base64'){await upload(['sample.png']);await out(png);}
 else if(slug==='base64-to-image'){await region.locator('textarea').fill(png);const d=await download(region.getByRole('button',{name:'Download',exact:true}));assert(d.bytes.equals(Buffer.from(png.split(',')[1],'base64')));const jpg=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=20;c.height=20;return c.toDataURL('image/jpeg').split(',')[1];});await region.locator('textarea').fill(jpg);const jpeg=await download(region.getByRole('button',{name:'Download',exact:true}));assert(jpeg.path.endsWith('.jpg'));assert.equal(jpeg.bytes.subarray(0,2).toString('hex'),'ffd8');await region.locator('textarea').fill('bad input');await region.getByRole('alert').waitFor();assert.equal(await region.getByRole('button',{name:'Download',exact:true}).count(),0);}
 else if(slug==='image-color-picker'){await upload(['sample.png']);await region.locator('canvas').press('Enter');await textIncludes('#FF0000');}
 else if(slug==='image-metadata-viewer'){await upload(['sample.png']);await textIncludes('120×80');}
 else if(slug.startsWith('pdf-')||slug==='images-to-pdf'){
 await upload(slug==='images-to-pdf'?['sample.png']:slug==='pdf-merger'?['sample.pdf','sample.pdf']:['sample.pdf']);
 const buttons={'pdf-merger':/Merge 2 PDFs/,'pdf-splitter':/Split into/,'pdf-page-extractor':/Extract pages/,'pdf-page-reorder':/Save new order/,'pdf-rotator':/Rotate & download/,'images-to-pdf':/Create PDF/,'pdf-to-images':/Download all/,'pdf-compressor':/^Download$/};
 if(slug==='pdf-compressor')await region.getByRole('button',{name:'Compress',exact:true}).click();
 if(slug==='pdf-page-reorder')await region.getByRole('button',{name:'Later',exact:true}).first().click();
 if(slug==='pdf-to-images'){await region.getByRole('button',{name:/Download all/}).waitFor();await region.getByLabel('Resolution').selectOption('1');await region.getByRole('button',{name:'Render at selected resolution'}).click();}
 const d=await download(region.getByRole('button',{name:buttons[slug]}));
 if(['pdf-splitter','pdf-to-images'].includes(slug)){const z=await JSZip.loadAsync(d.bytes);assert.equal(Object.values(z.files).filter(e=>!e.dir).length,2);for(const entry of Object.values(z.files)){const b=await entry.async('nodebuffer');if(slug==='pdf-splitter')assert.equal((await PDFDocument.load(b)).getPageCount(),1);else {assert.equal(b.subarray(1,4).toString(),'PNG');assert.equal(b.readUInt32BE(16),entry.name==='page-1.png'?200:300);}}}
 else {const doc=await PDFDocument.load(d.bytes);assert.equal(doc.getPageCount(),slug==='pdf-merger'?4:['pdf-page-extractor','images-to-pdf'].includes(slug)?1:2);if(slug==='pdf-rotator')assert.equal(doc.getPage(0).getRotation().angle,90);if(slug==='pdf-page-reorder')assert.equal(doc.getPage(0).getWidth(),300);}}
 else if(slug==='zip-creator'){await upload(['sample.png','sample.pdf']);const d=await download(region.getByRole('button',{name:/Create ZIP/}));assert.equal(Object.keys((await JSZip.loadAsync(d.bytes)).files).length,2);}
 else if(slug==='zip-extractor'){await upload(['sample.zip']);const d=await download(region.getByRole('button',{name:'Download hello.txt'}));assert.equal(d.bytes.toString(),'Hello DOVZO');}
 else if(slug==='file-information-viewer'){await upload(['sample.zip']);await textIncludes(createHash('sha256').update(await fs.readFile(`${dir}/sample.zip`)).digest('hex'));}
 else if(slug==='audio-trimmer'){await upload(['sample.wav']);const d=await download(region.getByRole('button',{name:'Download WAV'}));assert.equal(d.bytes.subarray(0,4).toString(),'RIFF');assert(d.bytes.length>44000);}
 else if(slug.startsWith('video-')){await upload(['sample.webm']);if(slug==='video-frame-extractor'){await region.getByRole('button',{name:'Capture current frame'}).click();const d=await download(region.getByRole('button',{name:/s · Download/}));assert.equal(d.bytes.subarray(1,4).toString(),'PNG');}else if(slug==='video-to-gif'){await region.getByRole('button',{name:'Create GIF'}).click();const d=await download(region.getByRole('button',{name:'Download GIF'}));assert.equal(d.bytes.subarray(0,3).toString(),'GIF');}else {const d=await download(region.getByRole('button',{name:'Trim & download'}));assert.equal(d.bytes.subarray(0,4).toString('hex'),'1a45dfa3');}}
 else if(slug==='word-counter'){await region.locator('textarea').fill('Hello cloud world.');await textIncludes('Words\n3');await textIncludes('Characters\n18');}
 else if(slug==='text-diff-checker'){await region.locator('textarea').nth(0).fill('old');await region.locator('textarea').nth(1).fill('new');await textIncludes('2 changed line(s)');}
 else if(slug==='lorem-ipsum-generator'){await region.getByLabel('Unit').selectOption('w');await region.getByRole('button',{name:'Generate',exact:true}).click();assert.equal((await region.locator('textarea').inputValue()).split(' ').length,3);}
 else if(slug==='json-validator'){await region.locator('textarea').fill('{"a":1}');await textIncludes('Valid JSON');await region.locator('textarea').fill('{');await region.getByRole('alert').waitFor();}
 else if(slug==='uuid-generator'){await region.getByRole('button',{name:'Generate',exact:true}).click();const ids=(await region.locator('textarea').inputValue()).split('\n');assert.equal(new Set(ids).size,5);ids.forEach(id=>assert.match(id,/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/));}
 else if(slug==='hash-generator'){await region.locator('textarea').fill('abc');await textIncludes(createHash('sha256').update('abc').digest('hex'));}
 else if(slug==='jwt-decoder'){await region.locator('textarea').fill(Buffer.from('{"alg":"HS256"}').toString('base64url')+'.'+Buffer.from('{"sub":"123"}').toString('base64url')+'.signature');await out('{\n  "sub": "123"\n}');}
 else if(slug==='regex-tester'){await textIncludes('2 match(es)');await region.getByLabel('Pattern', {exact:true}).fill('[');await region.getByRole('alert').waitFor();}
 else if(slug==='qr-code-generator'){const d=await download(region.getByRole('button',{name:'Download PNG'}));assert.equal(d.bytes.subarray(1,4).toString(),'PNG');}
 else if(slug==='barcode-generator'){const d=await download(region.getByRole('button',{name:'Download SVG'}));assert.match(d.bytes.toString(),/<svg/);}
 else if(slug==='password-generator'){const pw=await region.locator('code').innerText();assert.equal(pw.length,16);for(const re of [/[A-Z]/,/[a-z]/,/[0-9]/,/[^a-zA-Z0-9]/])assert.match(pw,re);}
 else if(slug==='random-number-generator'){await region.getByLabel('Min',{exact:true}).fill('7');await region.getByLabel('Max',{exact:true}).fill('7');await region.getByRole('button',{name:'Generate',exact:true}).click();await textIncludes('7');assert.equal(await region.getByRole('button',{name:'Copy',exact:true}).count(),1);}
 else if(slug==='random-color-generator'){assert.equal(await region.getByRole('button',{name:/Copy #[0-9a-f]{6}/}).count(),5);await region.getByRole('button',{name:'New palette'}).click();}
 else if(slug==='css-gradient-generator'){await textIncludes('linear-gradient(135deg');await region.getByLabel('Angle').fill('90');await textIncludes('linear-gradient(90deg');}
 else if(slug==='css-box-shadow-generator'){await region.getByLabel('Inset',{exact:true}).check();await textIncludes('box-shadow: inset');}
 else throw new Error('Missing functional test');
 assert.deepEqual(errors,[]);await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile horizontal overflow');await page.setViewportSize({width:1280,height:900});
 results.push({slug,status:'passed'});console.log('PASS',slug);
 }catch(e){results.push({slug,status:'failed',error:e.message});console.log('FAIL',slug,e.message.slice(0,250));await page.setViewportSize({width:1280,height:900});}}
await fs.writeFile(`${dir}/results.json`,JSON.stringify(results,null,2));await browser.close();console.log(`${results.filter(r=>r.status==='passed').length}/${slugs.length} passed`);if(results.some(r=>r.status==='failed'))process.exitCode=1;
