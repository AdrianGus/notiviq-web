export enum NotificationStatusEnum {
  SENT = 'SENT',
  FAILED = 'FAILED',
  SHOWN = 'SHOWN',
  CLICKED = 'CLICKED',
  CLOSED = 'CLOSED'
}

export type Notification = {
  id: string
  accountId: string
  campaignId: string
  subscriptionId: string
  status: NotificationStatusEnum
  attemptCount: number
  errorCode?: string
  errorMessage?: string
  sentAt?: string | Date
  failedAt?: string | Date
  shownAt?: string | Date
  clickedAt?: string | Date
  closedAt?: string | Date
  clickedAction?: string
  createdAt?: string | Date
  updatedAt?: string | Date
}

export const notificationStatusLabels: Record<NotificationStatusEnum, string> = {
  SENT: "Enviada",
  FAILED: "Falhou",
  SHOWN: "Exibida",
  CLICKED: "Clicada",
  CLOSED: "Fechada",
}