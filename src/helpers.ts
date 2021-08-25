import axios, { AxiosPromise, AxiosResponse } from 'axios';
export { AxiosResponse as AxiosResponse };
export const allServers: string[] = [
  'https://tycoon-w8r4q4.users.cfx.re',
  'https://tycoon-2epova.users.cfx.re',
  'https://tycoon-2epovd.users.cfx.re',
  'https://tycoon-wdrypd.users.cfx.re',
  'https://tycoon-njyvop.users.cfx.re',
  'https://tycoon-2r4588.users.cfx.re',
  'https://tycoon-npl5oy.users.cfx.re',
  'https://tycoon-2vzlde.users.cfx.re',
  'https://tycoon-wmapod.users.cfx.re',
  'https://tycoon-wxjpge.users.cfx.re',
  'https://tycoon-2rkmr8.users.cfx.re',
];

export async function TtAll(endpoint: string, servers?: string[]): Promise<AxiosResponse<any>[]>{
  const sersRes:AxiosPromise[] = [];

  (servers || allServers).forEach(server => {
    sersRes.push(axios.get(endpoint, { baseURL: server, 
      timeout: 4000 }).catch(() => { return undefined; }));
  });

  const data = await Promise.allSettled(sersRes);

  const responses:AxiosResponse<any>[] = [];

  data.forEach((res) => {
    if (res.status === 'fulfilled') {
      responses.push((res as unknown as PromiseFulfilledResult<any> | null)?.value);
    } else responses.push(undefined);
  });
  return responses;
}