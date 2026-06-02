export interface EventData {
  id: string
  slug: string
  title: string
  shortDescription: string
  fullDescription: string | null
  flyerImageUrl: string
  eventDate: Date
  location: string
  qrCodeUrl: string | null
  publicUrl: string | null
  scanCount: number
  downloadCount: number
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateEventInput {
  title: string
  shortDescription: string
  fullDescription?: string
  flyerImageUrl: string
  eventDate: string
  location: string
}

export interface UpdateEventInput extends Partial<CreateEventInput> {
  isPublished?: boolean
}

export interface DashboardStats {
  totalEvents: number
  totalScans: number
  totalDownloads: number
}

export interface ActionResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}
