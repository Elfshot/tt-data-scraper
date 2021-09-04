import axios, { AxiosPromise, AxiosResponse } from 'axios';
export { AxiosResponse as AxiosResponse };

const serversCombined: string[][] = [
  ['https://tycoon-w8r4q4.users.cfx.re','http://server.tycoon.community:30169'],
  ['https://tycoon-2epova.users.cfx.re','http://server.tycoon.community:30122'],
  ['https://tycoon-2epovd.users.cfx.re','http://server.tycoon.community:30123'],
  ['https://tycoon-wdrypd.users.cfx.re','http://server.tycoon.community:30124'],
  ['https://tycoon-njyvop.users.cfx.re','http://server.tycoon.community:30125'],
];

export const allServers = serversCombined.map((element) => {
  return element[1];
});

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