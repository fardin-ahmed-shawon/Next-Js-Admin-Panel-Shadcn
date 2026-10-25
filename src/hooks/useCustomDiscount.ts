"use client";
import useSWR from "swr";
import { fetchClient } from "@/lib/fetch-client";
export const discountApi = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/").replace(/\/$/, "");
export function useCustomDiscount() {
 const {data,error,isLoading,mutate}=useSWR(discountApi+"/custom-discount-availability",async url=>{const r=await fetchClient(url);if(!r.ok)throw Error("Unable to check discount limits");return (await r.json()).data;},{refreshInterval:30000,revalidateOnFocus:true});
 return {data,error,isLoading,mutate,canApply:!!data?.can_apply,enabled:!!data?.enabled,
  message:error?"Unable to check discount limits. Retry before applying a discount.":isLoading?"Checking discount limits…":!data?.enabled?"Custom discounts are disabled.":!data?.can_apply?"Daily discount allowance has been reached.":"Daily allowance remaining: "+(data?.daily_remaining==null?"Unlimited": "৳"+data.daily_remaining)+" · Your allowance: "+(data?.employee_daily_remaining==null?"Unlimited":"৳"+data.employee_daily_remaining),
  maxAmount:(subtotal:number,existing=0)=>Math.max(0,Math.min(subtotal,data?.order_limit==null?Infinity:data.order_limit_type==="percentage"?subtotal*Number(data.order_limit)/100:Number(data.order_limit),existing+(data?.daily_remaining??Infinity),existing+(data?.employee_daily_remaining??Infinity)))
 };
}
