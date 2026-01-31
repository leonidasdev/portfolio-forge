/**
 * Mock for next/server module
 */

export class NextRequest {
  url: string
  method: string
  private _body: BodyInit | null | undefined

  constructor(url: string, init?: RequestInit) {
    this.url = url
    this.method = init?.method || 'GET'
    this._body = init?.body
  }

  json() {
    if (this._body) {
      return Promise.resolve(JSON.parse(this._body as string))
    }
    return Promise.reject(new Error('No body'))
  }
}

class MockNextResponse {
  status: number
  ok: boolean
  data: unknown

  constructor(data: unknown, init?: { status?: number }) {
    this.data = data
    this.status = init?.status || 200
    this.ok = this.status < 400
  }

  json() {
    return Promise.resolve(this.data)
  }

  static json(data: unknown, init?: { status?: number }) {
    return new MockNextResponse(data, init)
  }
}

export const NextResponse = MockNextResponse
