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

export async function getAliveServer(id?: number): Promise<string> {
  if (id) {
    return allServers[id - 1][1]; //? will be based on 'real' numbers, e.g. 1 being s1.
  } 
  else {
    const allData = await TtAll('/status/alive');
    for (let i = 0; i < allData.length; i++) {
      const data = allData[i];
      if (data?.status === 204) return data.config.baseURL;
    }
    throw new Error('Cannot find an online server!');
  }
}