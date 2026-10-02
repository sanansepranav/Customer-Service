export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  // #region agent log
  fetch('http://127.0.0.1:7733/ingest/9a280877-1797-4a74-80f1-b2e2d7b5774a',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'363b59'},body:JSON.stringify({sessionId:'363b59',runId:'pre-fix',hypothesisId:'A',location:'src/lib/client.ts:api',message:'api response',data:{path,method:options?.method||'GET',status:res.status,ok:res.ok,error:(data as {error?:string}).error||null},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data as T;
}
