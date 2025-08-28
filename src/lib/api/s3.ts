import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({ ignoreAttributes: false });
type SpecialInit = RequestInit & { searchParams?: Record<string, string> };

export default class {
  constructor(
    private readonly endpoint: string, // goes like https://[account id].r2.cloudflarestorage.com
    private readonly bucket: string,
    private readonly accessKeyId: string,
    private readonly secretAccessKey: string,
    private readonly region: string = "auto",
    private readonly service: string = "s3",
  ) {}

  private async fetch(path: string, init: SpecialInit = {}) {
    const url = new URL(`${this.endpoint}/${this.bucket}/${path}`);
    const date = new Date();
    const amzdate = date.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const datestamp = amzdate.slice(0, 8);

    const method = init.method || "GET";
    const searchParams = (init.searchParams as Record<string, string>) || {};
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    // Task 1: Create canonical request
    const encodedPath = path
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
    const canonicalUri = `/${this.bucket}/${encodedPath}`;
    const canonicalQuerystring = Array.from(url.searchParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");

    const payloadHash = "UNSIGNED-PAYLOAD";

    const canonicalHeaders = {
      host: url.host,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzdate,
    };
    const signedHeaders = Object.keys(canonicalHeaders).sort().join(";");

    const canonicalRequest = [
      method,
      canonicalUri,
      canonicalQuerystring,
      Object.entries(canonicalHeaders)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}:${v}`)
        .join("\n"),
      "",
      signedHeaders,
      payloadHash,
    ].join("\n");

    // Task 2: Create string to sign
    const algorithm = "AWS4-HMAC-SHA256";
    const credentialScope = [datestamp, this.region, this.service, "aws4_request"].join("/");
    const stringToSign = [
      algorithm,
      amzdate,
      credentialScope,
      await this.hash(canonicalRequest),
    ].join("\n");

    // Task 3: Calculate signature
    const signature = await this.getSignature(datestamp, stringToSign);

    // Task 4: Create authorization header
    const authorization = `${algorithm} Credential=${this.accessKeyId}/${credentialScope},SignedHeaders=${signedHeaders},Signature=${signature}`;

    const response = await fetch(url, {
      ...init,
      headers: {
        ...canonicalHeaders,
        Authorization: authorization,
        ...init.headers,
      },
    });

    if (!response.ok) {
      console.warn(await response.text());
      throw new Error(`R2 is ${response.status}ing`);
    }

    return response;
  }

  private async hash(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  private async getSignature(datestamp: string, stringToSign: string): Promise<string> {
    const encoder = new TextEncoder();

    async function hmac(
      key: Uint8Array<ArrayBuffer>,
      data: Uint8Array<ArrayBuffer>,
    ): Promise<ArrayBuffer> {
      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        key,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );
      return await crypto.subtle.sign("HMAC", cryptoKey, data);
    }

    async function stackedHmac(datas: Uint8Array<ArrayBuffer>[]) {
      let key = datas.shift()!;
      while (true) {
        const data = datas.shift();
        if (!data) break;
        key = new Uint8Array(await hmac(key, data));
      }
      return key;
    }

    const signature = await stackedHmac([
      encoder.encode("AWS4" + this.secretAccessKey),
      encoder.encode(datestamp),
      encoder.encode(this.region),
      encoder.encode(this.service),
      encoder.encode("aws4_request"),
      encoder.encode(stringToSign),
    ]);

    return Array.from(signature)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  async listFiles(prefix = "") {
    const response = await this.fetch("", {
      searchParams: { prefix, delimiter: "/" },
    });
    const xml = await response.text();
    const result = parser.parse(xml);

    // Transform S3 XML format to our desired format
    const listing = result.ListBucketResult;
    let commonPrefixes = listing.CommonPrefixes;
    if (!listing.CommonPrefixes) commonPrefixes = [];
    if (!Array.isArray(commonPrefixes)) commonPrefixes = [commonPrefixes];

    let contents = listing.Contents;
    if (!contents) contents = [];
    if (!Array.isArray(contents)) contents = [contents];

    return {
      files: [
        ...commonPrefixes.map((p: { Prefix: string }) => ({
          name: p.Prefix,
          type: "directory",
        })),
        ...contents.map((c: { Key: string; Size: number; LastModified: string }) => ({
          name: c.Key,
          type: "file",
          size: c.Size,
          modified: c.LastModified,
        })),
      ],
    };
  }

  async getFile(path: string) {
    const response = await this.fetch(path);
    return await response.text();
  }

  async putFile(path: string, content: string) {
    await this.fetch(path, {
      method: "PUT",
      body: content,
    });
  }

  async deleteFile(path: string) {
    await this.fetch(path, {
      method: "DELETE",
    });
  }
}
