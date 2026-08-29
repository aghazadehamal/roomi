export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type ProfileRow = {
  id: string
  name: string
  avatar_url: string | null
  city: string
  role_intent: string
  created_at: string
}

type ListingRow = {
  id: string
  user_id: string
  type: string
  title: string
  body: string
  city: string
  district: string
  price: number
  rooms: number
  gender_pref: string
  housing_kind: string
  status: string
  published_at: string
  expires_at: string
  created_at: string
}

type ListingPhotoRow = {
  id: string
  listing_id: string
  url: string
  sort_order: number
}

type ConversationRow = {
  id: string
  listing_id: string
  listing_owner_id: string
  guest_id: string
  created_at: string
  guest_last_read_at: string | null
  owner_last_read_at: string | null
}

type MessageRow = {
  id: string
  conversation_id: string
  sender_id: string
  body: string
  created_at: string
}

type BlockRow = {
  blocker_id: string
  blocked_id: string
  created_at: string
}

type ReportRow = {
  id: string
  reporter_id: string
  listing_id: string | null
  conversation_id: string | null
  reason: string
  body: string | null
  created_at: string
}

type SavedListingRow = {
  user_id: string
  listing_id: string
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow
        Insert: {
          id: string
          name?: string
          avatar_url?: string | null
          city?: string
          role_intent?: string
          created_at?: string
        }
        Update: Partial<ProfileRow>
        Relationships: []
      }
      listings: {
        Row: ListingRow
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          body: string
          city: string
          district: string
          price: number
          rooms: number
          gender_pref?: string
          housing_kind?: string
          status?: string
          published_at?: string
          expires_at: string
          created_at?: string
        }
        Update: Partial<ListingRow>
        Relationships: [
          {
            foreignKeyName: "listing_photos_listing_id_fkey"
            columns: ["id"]
            isOneToOne: false
            referencedRelation: "listing_photos"
            referencedColumns: ["listing_id"]
          },
        ]
      }
      listing_photos: {
        Row: ListingPhotoRow
        Insert: {
          id?: string
          listing_id: string
          url: string
          sort_order?: number
        }
        Update: Partial<ListingPhotoRow>
        Relationships: [
          {
            foreignKeyName: "listing_photos_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: ConversationRow
        Insert: {
          id?: string
          listing_id: string
          listing_owner_id: string
          guest_id: string
          created_at?: string
        }
        Update: Partial<ConversationRow>
        Relationships: []
      }
      messages: {
        Row: MessageRow
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          body: string
          created_at?: string
        }
        Update: Partial<MessageRow>
        Relationships: []
      }
      blocks: {
        Row: BlockRow
        Insert: {
          blocker_id: string
          blocked_id: string
          created_at?: string
        }
        Update: Partial<BlockRow>
        Relationships: []
      }
      reports: {
        Row: ReportRow
        Insert: {
          id?: string
          reporter_id: string
          listing_id?: string | null
          conversation_id?: string | null
          reason: string
          body?: string | null
          created_at?: string
        }
        Update: Partial<ReportRow>
        Relationships: []
      }
      saved_listings: {
        Row: SavedListingRow
        Insert: {
          user_id: string
          listing_id: string
          created_at?: string
        }
        Update: Partial<SavedListingRow>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      archive_expired_listings: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      sync_own_profile_name: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      count_unread_messages: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      list_conversations_for_user: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          peer_id: string
          peer_name: string
          listing_title: string
          listing_active: boolean
          last_message: string
          last_message_at: string
          unread: boolean
        }[]
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
