// Type-only — no runtime code, so importing this from either the CommonJS
// api/ build or the ESM src/ build is safe (erased at compile time).

export interface SiteMinderSite {
  id: number;
  bookingSite: string;
  hotelCode: string; // Hotel Code / Property ID
  rates: string;
  rateMultiplier: string;
  myChannel: boolean;
  mapped: boolean;
  enabled: boolean;
}

export interface SiteMinderData {
  connect: boolean;
  sites: SiteMinderSite[];
}
