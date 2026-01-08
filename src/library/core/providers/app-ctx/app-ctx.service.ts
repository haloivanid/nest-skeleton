import { Injectable } from '@nestjs/common';
import { RequestedLang } from '@libs/enum';

class IApplicationContext {
  requestId: string;
  requestedLang: RequestedLang;
  actorId: string;
  ip: string;
  userAgent: string;
  timestamp: number;
}

@Injectable()
export class AppCtxService {
  private _context: IApplicationContext = new IApplicationContext();

  public get context(): IApplicationContext {
    return this._context;
  }

  setRequestId(requestId: string) {
    this._context.requestId = requestId;
  }

  setRequestedLang(lang?: string) {
    this._context.requestedLang = lang
      ? RequestedLang[lang.toUpperCase() as keyof typeof RequestedLang]
      : RequestedLang.EN;
  }

  setActorId(actorId: string) {
    this._context.actorId = actorId;
  }

  setIp(ip: string) {
    this._context.ip = ip;
  }

  setUserAgent(userAgent: string) {
    this._context.userAgent = userAgent;
  }

  setTimestamp(unixTime: number) {
    this._context.timestamp = unixTime;
  }

  reset() {
    this._context = {} as IApplicationContext;
  }
}
