// Basic in-memory store for POC. 
// In a real app, this would be Supabase/PostgreSQL.

export type ApiSchema = {
  url: string;
  method: string;
  schema: Record<string, string>; // { "key": "type" }
  timestamp: number;
};

export type DriftReport = {
  id: string;
  serviceName: string;
  endpoint: string;
  type: "BREAKING" | "WARNING" | "SAFE";
  message: string;
  diff: {
    expected: Record<string, string>;
    actual: Record<string, string>;
  };
  timestamp: number;
};

export type Settings = {
  whatsappNumber?: string;
  whatsappApiKey?: string;
  openaiApiKey?: string;
  geminiApiKey?: string;
  slackWebhook?: string;
  monitoringEnabled: boolean;
};

class Store {
  private static instance: Store;
  private baselines: Map<string, ApiSchema> = new Map();
  private reports: DriftReport[] = [];
  private settings: Settings = { 
    monitoringEnabled: true,
    geminiApiKey: "AIzaSyA7CBlihdC38UkrpS_Ao643lUMg950NbSI"
  };

  private constructor() {}

  public static getInstance(): Store {
    if (!Store.instance) {
      Store.instance = new Store();
    }
    return Store.instance;
  }

  getBaseline(endpoint: string) {
    return this.baselines.get(endpoint);
  }

  setBaseline(endpoint: string, schema: ApiSchema) {
    this.baselines.set(endpoint, schema);
  }

  getAllBaselines() {
    return Array.from(this.baselines.values());
  }

  addReport(report: DriftReport) {
    this.reports.unshift(report);
    if (this.reports.length > 50) this.reports.pop();
  }

  getReports() {
    return this.reports;
  }

  getSettings() {
    return this.settings;
  }

  updateSettings(newSettings: Partial<Settings>) {
    this.settings = { ...this.settings, ...newSettings };
  }
}

export const store = Store.getInstance();
