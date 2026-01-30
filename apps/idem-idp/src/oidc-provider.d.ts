declare module 'oidc-provider' {
  export interface AdapterPayload {
    [key: string]: any;
  }

  export interface Adapter {
    upsert(id: string, payload: AdapterPayload, expiresIn: number): Promise<void>;
    find(id: string): Promise<AdapterPayload | undefined>;
    findByUserCode(userCode: string): Promise<AdapterPayload | undefined>;
    findByUid(uid: string): Promise<AdapterPayload | undefined>;
    consume(id: string): Promise<void>;
    destroy(id: string): Promise<void>;
    revokeByGrantId(grantId: string): Promise<void>;
  }

  export type AdapterFactory = (name: string) => Adapter;

  const Provider: any;
  export default Provider;
}
