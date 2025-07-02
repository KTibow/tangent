export type Link = {
  // From local cryptography
  aesKey: CryptoKey; // 32 bytes - message en/decryption
  hmacKey: CryptoKey; // 32 bytes - message authentication
  ecdsaKey: CryptoKey; // ECDSA private key (use to request refresh)
  expiry: number;

  // From Google Messages
  authKey: string; // Base64
  mobile: {
    userId: number;
    sourceId: string;
    network: string;
  };
  browser: {
    userId: number;
    sourceId: string;
    network: string;
  };
};
export type Message = {
  announcement: boolean;
  id: string;
  author: string;
  timestamp: Date;
  reply: { id: string; text: string } | undefined;
  text: string;
};
