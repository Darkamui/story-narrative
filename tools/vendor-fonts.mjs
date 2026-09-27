/* global fetch */
import fs from 'node:fs/promises'
import process from 'node:process'
import { Buffer } from 'node:buffer'
const root='public/fonts'
await fs.mkdir(root,{recursive:true})
const response=await fetch('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400..700&family=Manrope:wght@400..700&display=swap',{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'}})
if(!response.ok)throw Error(`Font stylesheet ${response.status}`)
const css=await response.text()
if(!css.includes("format('woff2')"))throw Error('Expected WOFF2 fonts; inspect provider response before vendoring')
const urls=[...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map(m=>m[1]))]
let local=css
for(const [i,url] of urls.entries()) {
 const r=await fetch(url);if(!r.ok)throw Error(`Font ${r.status}`)
 const name=`family-${i}.woff2`
 await fs.writeFile(`${root}/${name}`,Buffer.from(await r.arrayBuffer()))
 local=local.replaceAll(url,`./${name}`)
}
await fs.writeFile(`${root}/fonts.css`,local)
for(const name of ['dmsans','manrope']) {
 const r=await fetch(`https://raw.githubusercontent.com/google/fonts/main/ofl/${name}/OFL.txt`)
 if(!r.ok)throw Error(`License ${name}: ${r.status}`)
 await fs.writeFile(`${root}/${name}-OFL.txt`,await r.text())
}
process.stdout.write(`Vendored ${urls.length} font subsets and both OFL licenses.\n`)
