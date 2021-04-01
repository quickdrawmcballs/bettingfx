// Sleeps for a given ms.
export function sleep(ms:number) : Promise<any> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function formatFloat(num:number) : string {
  return num.toLocaleString();
}