/* global window, document, performance, PerformanceObserver, requestAnimationFrame */
import { chromium } from '@playwright/test'
import fs from 'node:fs/promises'
import process from 'node:process'
await fs.mkdir('artifacts/milestone-8',{recursive:true})
const results=[]
for(const constrained of process.env.PROFILE_MODE === 'desktop' ? [false] : [false,true]) {
 const browser=await chromium.launch({channel:'msedge',args:constrained?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:[]})
 try {
  const context=await browser.newContext({viewport:constrained?{width:390,height:844}:{width:1440,height:1000}})
  const page=await context.newPage(), session=await context.newCDPSession(page)
  if(constrained)await session.send('Emulation.setCPUThrottlingRate',{rate:4})
  const errors=[];page.on('pageerror',e=>errors.push(e.message))
  await page.goto('http://127.0.0.1:4186/stories/aluminum')
  await page.waitForSelector('canvas')
  await page.waitForTimeout(1800)
  await session.send('Performance.enable')
  const before=await session.send('Performance.getMetrics')
  await session.send('Tracing.start',{categories:'devtools.timeline,v8,blink.user_timing',transferMode:'ReturnAsStream'})
  const result=await page.evaluate(async()=>{
   const longTasks=[]
   const observer=new PerformanceObserver(list=>list.getEntries().forEach(e=>longTasks.push(e.duration)))
   observer.observe({type:'longtask',buffered:false})
   const chapters=[]
   for(const id of ['reveal','anatomy','section','electrolysis','tapping','casting']) {
    const section=document.getElementById(id),top=section.getBoundingClientRect().top+window.scrollY,height=section.offsetHeight
    window.scrollTo(0,top+height*.1)
    await new Promise(r=>window.setTimeout(r,400))
    const intervals=[];let last=performance.now();const started=last
    for(let i=0;i<24;i++) {
     await new Promise(requestAnimationFrame)
     const now=performance.now();intervals.push(now-last);last=now
     window.scrollTo(0,top+height*(.1+.85*i/23))
     if(now-started>3000)break
    }
    intervals.sort((a,b)=>a-b)
    chapters.push({id,frames:intervals.length,medianFrameMs:intervals[Math.floor(intervals.length*.5)],p95FrameMs:intervals[Math.floor(intervals.length*.95)],maxFrameMs:intervals.at(-1)})
   }
   observer.disconnect()
   const context=document.querySelector('canvas').getContext('webgl2'),extension=context.getExtension('WEBGL_debug_renderer_info')
   return {chapters,longTasks,gpu:extension?context.getParameter(extension.UNMASKED_RENDERER_WEBGL):'not exposed',resources:performance.getEntriesByType('resource').map(e=>({name:e.name,bytes:e.transferSize,duration:e.duration})),debugGlobals:!!window.__CELL_STORY__}
  })
  const after=await session.send('Performance.getMetrics')
  const done=new Promise(resolve=>session.once('Tracing.tracingComplete',resolve))
  await session.send('Tracing.end');const {stream}=await done
  let trace='';for(;;){const chunk=await session.send('IO.read',{handle:stream});trace+=chunk.data;if(chunk.eof)break}
  await session.send('IO.close',{handle:stream})
  const name=constrained?'software-gpu-mobile-cpu4':'desktop'
  await fs.writeFile(`artifacts/milestone-8/trace-${name}.json`,trace)
  const metrics=Object.fromEntries(after.metrics.map(m=>[m.name,m.value-(before.metrics.find(b=>b.name===m.name)?.value??0)]))
  results.push({name,...result,errors,metrics})
  await fs.writeFile('artifacts/milestone-8/performance.json',JSON.stringify(results,null,2))
 }finally{await browser.close()}
}
await fs.writeFile('artifacts/milestone-8/performance.json',JSON.stringify(results,null,2))
process.stdout.write(JSON.stringify(results.map(({name,chapters,longTasks,errors,debugGlobals})=>({name,chapters,longTasks,errors,debugGlobals})),null,2))
