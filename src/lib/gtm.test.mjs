import test from 'node:test';
import assert from 'node:assert/strict';
import { parseGtmHead, parseGtmBody } from './gtm.ts';
test('preserves custom-host GTM loader javascript without replacing its container',()=>{
 const code="(function(w){w.dataLayer=w.dataLayer||[];var j=document.createElement('script');j.src='https://sst.example.test/loader.js?8=abc%3D';document.head.appendChild(j)})(window);";
 assert.equal(parseGtmHead('<!-- GTM --><script>'+code+'</script>')[0].content,code);
});
test('parses external scripts with spaced attributes',()=>{
 assert.deepEqual(parseGtmHead('<script async src = "https://example.test/tag.js" defer></script>')[0],{src:'https://example.test/tag.js',isAsync:true,isDefer:true,content:''});
});
test('handles encoded markup and raw javascript without corrupting operators',()=>{
 assert.equal(parseGtmHead('&lt;script&gt;window.dataLayer=[];&lt;/script&gt;')[0].content,'window.dataLayer=[];');
 assert.equal(parseGtmHead('if (1 < 2) window.ready = true;')[0].content,'if (1 < 2) window.ready = true;');
 assert.deepEqual(parseGtmHead('<div>not a script</div>'),[]);
});
test('renders only the contents of the noscript wrapper',()=>{
 const frame='<iframe src="https://sst.example.test/ns.html?id=GTM-TEST" height="0" width="0" style="display:none;visibility:hidden"></iframe>';
 assert.deepEqual(parseGtmBody('<!-- GTM --><noscript>'+frame+'</noscript>'),[frame]);
 assert.deepEqual(parseGtmHead(''),[]);assert.deepEqual(parseGtmBody(null),[]);
});


test('custom loader failure recovers once using the saved body container', async()=>{
 const { prepareGtmHead } = await import('./gtm.ts');
 const { runInNewContext } = await import('node:vm');
 const listeners={};const added=[];
 const document={addEventListener:(name,fn)=>listeners[name]=fn,removeEventListener:()=>{},createElement:()=>({}),head:{appendChild:s=>added.push(s)}};
 const scripts=prepareGtmHead('<script>window.originalRan=true;</script>','<noscript><iframe src="https://sst.example.test/ns.html?id=GTM-ABC123"></iframe></noscript>');
 const window={};runInNewContext(scripts[0].content,{document,window,URL});
 assert.equal(window.originalRan,true);assert.equal(added.length,0);
 listeners.error({target:{tagName:'IMG',src:'https://sst.example.test/image.png'}});
 listeners.error({target:{tagName:'SCRIPT',src:'https://other.test/tag.js'}});
 assert.equal(added.length,0);
 const event={target:{tagName:'SCRIPT',src:'https://sst.example.test/custom.js'}};
 listeners.error(event);listeners.error(event);
 assert.equal(added.length,1);assert.equal(added[0].src,'https://www.googletagmanager.com/gtm.js?id=GTM-ABC123');
});

test('standard GTM and missing or invalid container do not get a custom fallback',async()=>{
 const {prepareGtmHead}=await import('./gtm.ts');const head='<script>window.test=true;</script>';
 for(const body of ['', '<iframe src="https://sst.test/ns.html?id=invalid"></iframe>', '<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-ABC"></iframe>']) assert.deepEqual(prepareGtmHead(head,body),parseGtmHead(head));
});
