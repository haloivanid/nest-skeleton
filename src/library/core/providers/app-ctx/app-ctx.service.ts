import { Injectable } from '@nestjs/common';
import { RequestedLang } from '@libs/enum';
import { AsyncLocalStorage } from 'node:async_hooks';

export class IApplicationContext {
  requestId: string;
  requestedLang: RequestedLang;
  actorId: string;
  ip: string;
  userAgent: string;
  timestamp: number;
}

@Injectable()
export class AppCtxService {
  private readonly als = new AsyncLocalStorage<IApplicationContext>();

  run(fn: () => void) {
    const store = new IApplicationContext();
    this.als.run(store, fn);
  }

  public get context(): IApplicationContext {
    const store = this.als.getStore();
    if (!store) {
      // Return empty/default if accessed outside of a request context (e.g. background jobs, tests without mock)
      // or optionally throw an error. For safety, returning a clean object or logging a warning is often better.
      // Given the previous implementation returned a default object, we'll try to match that safety or just return empty partial.
      return {} as IApplicationContext;
    }
    return store;
  }

  setRequestId(requestId: string) {
    const store = this.context;
    store.requestId = requestId;
  }

  setRequestedLang(lang?: string) {
    const store = this.context;
    store.requestedLang = lang ? RequestedLang[lang.toUpperCase() as keyof typeof RequestedLang] : RequestedLang.EN;
  }

  setActorId(actorId: string) {
    const store = this.context;
    store.actorId = actorId;
  }

  setIp(ip: string) {
    const store = this.context;
    store.ip = ip;
  }

  setUserAgent(userAgent: string) {
    const store = this.context;
    store.userAgent = userAgent;
  }

  setTimestamp(unixTime: number) {
    const store = this.context;
    store.timestamp = unixTime;
  }
}
