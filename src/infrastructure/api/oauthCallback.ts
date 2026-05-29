let pendingOAuthUrl: string | null = null;

export const oauthCallback = {
  setUrl: (url: string) => { pendingOAuthUrl = url; },
  getUrl: () => pendingOAuthUrl,
  clear: () => { pendingOAuthUrl = null; },
};
