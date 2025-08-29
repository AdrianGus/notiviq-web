export enum CampaignStatusEnum {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export enum CampaignScheduleModeEnum {
  ONE_TIME = 'ONE_TIME',
  RECURRING = 'RECURRING',
}

export enum CampaignScheduleIntervalEnum {
  FIVE_MINUTES = 'FIVE_MINUTES',
  TEN_MINUTES = 'TEN_MINUTES',
  THIRTY_MINUTES = 'THIRTY_MINUTES',
  ONE_HOUR = 'ONE_HOUR',
  THREE_HOURS = 'THREE_HOURS',
  SIX_HOURS = 'SIX_HOURS',
  ONE_DAY = 'ONE_DAY',
  ONE_WEEK = 'ONE_WEEK'
}

export const statusLabels: Record<string, string> = {
  DRAFT: "Rascunho",
  PUBLISHED: "Publicada",
}

export const scheduleModeLabels: Record<string, string> = {
  ONE_TIME: "Única",
  RECURRING: "Recorrente",
}

export const intervalLabels: Record<string, string> = {
  FIVE_MINUTES: "A cada 5 min",
  TEN_MINUTES: "A cada 10 min",
  THIRTY_MINUTES: "A cada 30 min",
  ONE_HOUR: "A cada 1h",
  THREE_HOURS: "A cada 3h",
  SIX_HOURS: "A cada 6h",
  ONE_DAY: "A cada 1 dia",
  ONE_WEEK: "Acada 1 semana",
}

export interface Campaign {
  id: string
  accountId: string
  status: CampaignStatusEnum
  title: string
  body: string
  icon: string
  image: string
  actions: { action: string; title: string; url: string }[]
  target: { tags: string[] }
  schedule: {
    mode: CampaignScheduleModeEnum;
    startAt: Date;
    interval?: CampaignScheduleIntervalEnum;
    endAt?: Date;
  }
  createdAt?: string
  updatedAt?: string
}
export interface Paginated<T> {
  items: T[]; total: number; page: number; size: number; totalPages: number
}

