"use client";
import {useEffect,useState} from "react";
import {fetchClient} from "@/lib/fetch-client";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Switch} from "@/components/ui/switch";
import {toast} from "sonner";
import {Gift,Trash2,Plus,Loader2} from "lucide-react";
type GiftItem={product_id:number;variant_id:number|null;title?:string};
type Config={enabled:boolean;reward_valid_hours:number;coupon_codes:string[];gift_products:GiftItem[]};
type Options={coupons:{id:number;code:string;type:string;value:number}[];products:{id:number;title:string;has_variants:number;inventory_mode:string}[];variants:{id:number;option_label:string;size:string;color:string}[];selected:GiftItem[]};
const base=(process.env.NEXT_PUBLIC_API_BASE_URL||"http://127.0.0.1:8000/api/v1/admin/").replace(/\/$/,"");
export default function SpinnerPage(){
 const [config,setConfig]=useState<Config|null>(null),[options,setOptions]=useState<Options>({coupons:[],products:[],variants:[],selected:[]});
 const [search,setSearch]=useState(""),[productId,setProductId]=useState(""),[variantId,setVariantId]=useState(""),[code,setCode]=useState("");
 const [saving,setSaving]=useState(false),[error,setError]=useState("");
 useEffect(()=>{let active=true;fetchClient(base+"/spinner-settings").then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.message||"Unable to load spinner settings");if(active)setConfig(d.data);}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[]);
 useEffect(()=>{const controller=new AbortController();const timer=setTimeout(()=>{
  fetchClient(base+"/spinner-options?search="+encodeURIComponent(search)+"&product_id="+(productId||""),{signal:controller.signal}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.message||"Unable to load prizes");setOptions(d.data);}).catch(e=>{if(e.name!=="AbortError")setError(e.message);});
 },250);return()=>{clearTimeout(timer);controller.abort();};},[search,productId]);
 const product=options.products.find(p=>String(p.id)===productId);
 const requiresVariant=Boolean(product?.has_variants)||product?.inventory_mode==="shared_bulk";
 function addGift(){if(!config||!product||(requiresVariant&&!variantId))return;const gift={product_id:product.id,variant_id:requiresVariant?Number(variantId):null,title:product.title};
 if(config.gift_products.some(p=>p.product_id===gift.product_id&&p.variant_id===gift.variant_id))return;
 setConfig({...config,gift_products:[...config.gift_products,gift]});}
 async function save(){if(!config)return;setSaving(true);try{const r=await fetchClient(base+"/spinner-settings",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({...config,gift_products:config.gift_products.map(({product_id,variant_id})=>({product_id,variant_id}))})});const d=await r.json();if(!r.ok)throw new Error(d.errors?Object.values(d.errors).flat().join(" "):d.message);toast.success("Spinner settings saved");setError("");}catch(e){toast.error(e instanceof Error?e.message:"Unable to save");}finally{setSaving(false);}}
 if(!config)return <div className="p-6">{error||"Loading spinner settings…"}</div>;
 const count=config.coupon_codes.length+config.gift_products.length;
 return <div className="space-y-6"><div className="flex flex-wrap justify-between gap-4"><div><h1 className="text-3xl font-semibold">Spin & Win</h1><p className="text-sm text-muted-foreground mt-1">Choose existing coupons and products for your storefront homepage wheel.</p></div><Button onClick={save} disabled={saving}>{saving&&<Loader2 className="size-4 animate-spin"/>}Save settings</Button></div>
 {error&&<p role="alert" className="text-destructive">{error}</p>}
 <div className="rounded-xl border p-5 flex flex-wrap gap-6 justify-between items-center"><div><h2 className="font-semibold">Homepage spinner</h2><p className="text-sm text-muted-foreground">One spin per session. Each phone number can spin once every 24 hours.</p></div><Switch checked={config.enabled} onCheckedChange={enabled=>setConfig({...config,enabled})} aria-label="Enable homepage spinner"/></div>
 <div className="grid gap-4 md:grid-cols-3"><div className="rounded-xl border p-5"><span className="text-muted-foreground">Wheel items</span><p className="text-2xl font-semibold mt-2">{count} / 12</p></div><div className="rounded-xl border p-5"><label htmlFor="reward-hours" className="text-sm font-medium">Reward validity (hours)</label><Input id="reward-hours" type="number" min={1} max={168} className="mt-2" value={config.reward_valid_hours} onChange={e=>setConfig({...config,reward_valid_hours:Number(e.target.value)})}/></div><div className="rounded-xl border p-5 text-sm text-muted-foreground">Each available item has an equal chance. Expired coupons and unavailable gifts are excluded. A gift requires another paid item at checkout.</div></div>
 <div className="grid gap-6 lg:grid-cols-2"><section className="rounded-xl border p-5 space-y-4"><h2 className="font-semibold text-lg">Coupon prizes</h2><div className="flex gap-2"><select aria-label="Choose coupon" className="h-10 rounded-md border px-3 min-w-0 flex-1 bg-background" value={code} onChange={e=>setCode(e.target.value)}><option value="">Choose an existing coupon</option>{options.coupons.map(c=><option key={c.id} value={c.code}>{c.code} — {c.type==="percentage"?c.value+"%":"৳"+c.value}</option>)}</select><Button variant="outline" disabled={!code||count>=12||config.coupon_codes.includes(code)} onClick={()=>{setConfig({...config,coupon_codes:[...config.coupon_codes,code]});setCode("");}}><Plus className="size-4"/>Add</Button></div>
 {config.coupon_codes.map(c=><div key={c} className="flex items-center justify-between rounded-lg border p-3"><span className="font-medium">{c}</span><Button variant="ghost" size="icon" aria-label={"Remove "+c} onClick={()=>setConfig({...config,coupon_codes:config.coupon_codes.filter(x=>x!==c)})}><Trash2 className="size-4"/></Button></div>)}
 {!config.coupon_codes.length&&<p className="text-sm text-muted-foreground">No coupon prizes selected.</p>}</section>
 <section className="rounded-xl border p-5 space-y-4"><h2 className="font-semibold text-lg">Gift product prizes</h2><Input placeholder="Search existing products…" value={search} onChange={e=>{setSearch(e.target.value);setProductId("");setVariantId("");}}/>
 <select aria-label="Choose gift product" className="h-10 w-full rounded-md border px-3 bg-background" value={productId} onChange={e=>{setProductId(e.target.value);setVariantId("");}}><option value="">Choose a product</option>{options.products.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select>
 {requiresVariant&&<select aria-label="Choose variant or pack" className="h-10 w-full rounded-md border px-3 bg-background" value={variantId} onChange={e=>setVariantId(e.target.value)}><option value="">Choose variant / pack</option>{options.variants.map(v=><option key={v.id} value={v.id}>{v.option_label||[v.size,v.color].filter(Boolean).join(" / ")||"Variant #"+v.id}</option>)}</select>}
 <Button variant="outline" disabled={!product||count>=12||(requiresVariant&&!variantId)} onClick={addGift}><Gift className="size-4"/>Add gift product</Button>
 {config.gift_products.map((g,i)=><div key={g.product_id+":"+g.variant_id} className="flex items-center justify-between gap-3 rounded-lg border p-3"><div><p className="font-medium">{g.title||options.selected.find(x=>x.product_id===g.product_id)?.title||"Product #"+g.product_id}</p><p className="text-sm text-muted-foreground">Quantity: 1{g.variant_id?" · Variant / pack #"+g.variant_id:""}</p></div><Button variant="ghost" size="icon" aria-label="Remove gift" onClick={()=>setConfig({...config,gift_products:config.gift_products.filter((_,j)=>j!==i)})}><Trash2 className="size-4"/></Button></div>)}
 {!config.gift_products.length&&<p className="text-sm text-muted-foreground">No gift products selected.</p>}</section></div></div>;
}
