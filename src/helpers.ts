import axios, { AxiosPromise, AxiosResponse } from 'axios';
export { AxiosResponse as AxiosResponse };

const serversCombined: string[][] = [
  ['https://tycoon-w8r4q4.users.cfx.re','http://server.tycoon.community:30169'],
  ['https://tycoon-2epova.users.cfx.re','http://server.tycoon.community:30122'],
  //['https://tycoon-2epovd.users.cfx.re','http://server.tycoon.community:30123'],
  //['https://tycoon-wdrypd.users.cfx.re','http://server.tycoon.community:30124'],
  //['https://tycoon-njyvop.users.cfx.re','http://server.tycoon.community:30125'],
];

interface TtOptions {
  endpoint?: string;
  givenServer?: number;
  timeout?: number;
  options?: { [ key:string ]: any };
  wholeURL?: string;
}

export const allServers = serversCombined.map((element) => {
  return element[1];
});

/**
 * Make a request to TT or any other URL with caching.
 * @param args   
 *endpoint: Tycoon endpoint to use: number

  givenServer: int 1-5 if server is predetermined: number

  timeout: Timeout in ms: number (default: 4000)

  options: Any axios options: {}

  wholeURL: Just use the caching of TT() with a whole differnt url: string

 * @returns Typical Axios response- assign it a type along it's variable declaration
 */
export async function TT(args: TtOptions): Promise<AxiosResponse<any>> {
  const server = args.wholeURL || (args.givenServer? await getAliveServer(args.givenServer): await getAliveServer());
  const url = args.wholeURL || (server +  args.endpoint);

  let data;
  try {
    data = await axios.get(url, {
      headers: {
        'X-Tycoon-Key': process.env.TYCOONTOKEN,
      },
      timeout: args.timeout || 4000,
      ...args.options,
    });
  } catch(error: any) {
    // eslint-disable-next-line no-unsafe-optional-chaining
    if (error?.isAxiosError && (error?.code || error?.response?.status).toString() === '429') {
      data = await TT(args);
    }
    throw error;
  }
  return data;
}

export async function TtAll(endpoint: string, servers?: string[]): Promise<AxiosResponse<any>[]>{
  try {
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
  } catch(err) {
    console.error(err);
  }
}

export async function getAliveServer(id?: number): Promise<string> {
  if (id) {
    return allServers[id - 1]; //? will be based on 'real' numbers, e.g. 1 being s1.
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