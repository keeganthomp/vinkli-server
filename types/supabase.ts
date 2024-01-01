export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      booking: {
        Row: {
          artist_id: string;
          completed_at: string | null;
          created_at: string;
          duration: number | null;
          end_date: string | null;
          id: string;
          payment_intent_id: string | null;
          payment_link_id: string | null;
          payment_receive: boolean;
          start_date: string | null;
          status: Database['public']['Enums']['bookingStatus'];
          tattoo_id: string;
          type: Database['public']['Enums']['bookingType'];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          artist_id: string;
          completed_at?: string | null;
          created_at?: string;
          duration?: number | null;
          end_date?: string | null;
          id?: string;
          payment_intent_id?: string | null;
          payment_link_id?: string | null;
          payment_receive?: boolean;
          start_date?: string | null;
          status?: Database['public']['Enums']['bookingStatus'];
          tattoo_id: string;
          type?: Database['public']['Enums']['bookingType'];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          artist_id?: string;
          completed_at?: string | null;
          created_at?: string;
          duration?: number | null;
          end_date?: string | null;
          id?: string;
          payment_intent_id?: string | null;
          payment_link_id?: string | null;
          payment_receive?: boolean;
          start_date?: string | null;
          status?: Database['public']['Enums']['bookingStatus'];
          tattoo_id?: string;
          type?: Database['public']['Enums']['bookingType'];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'booking_artist_id_users_id_fk';
            columns: ['artist_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'booking_tattoo_id_tattoo_id_fk';
            columns: ['tattoo_id'];
            isOneToOne: false;
            referencedRelation: 'tattoo';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'booking_user_id_users_id_fk';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      tattoo: {
        Row: {
          color: Database['public']['Enums']['tattooColor'] | null;
          created_at: string;
          description: string | null;
          id: string;
          image_paths: string[];
          placement: string | null;
          style: Database['public']['Enums']['tattooStyle'] | null;
          title: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          color?: Database['public']['Enums']['tattooColor'] | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_paths?: string[];
          placement?: string | null;
          style?: Database['public']['Enums']['tattooStyle'] | null;
          title?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          color?: Database['public']['Enums']['tattooColor'] | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_paths?: string[];
          placement?: string | null;
          style?: Database['public']['Enums']['tattooStyle'] | null;
          title?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tattoo_user_id_users_id_fk';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      users: {
        Row: {
          created_at: string;
          email: string | null;
          has_onboarded_to_stripe: boolean | null;
          id: string;
          name: string | null;
          phone: string;
          stripe_account_id: string | null;
          stripe_customer_id: string | null;
          updated_at: string;
          user_type: Database['public']['Enums']['user_type'] | null;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          has_onboarded_to_stripe?: boolean | null;
          id: string;
          name?: string | null;
          phone: string;
          stripe_account_id?: string | null;
          stripe_customer_id?: string | null;
          updated_at?: string;
          user_type?: Database['public']['Enums']['user_type'] | null;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          has_onboarded_to_stripe?: boolean | null;
          id?: string;
          name?: string | null;
          phone?: string;
          stripe_account_id?: string | null;
          stripe_customer_id?: string | null;
          updated_at?: string;
          user_type?: Database['public']['Enums']['user_type'] | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      bookingStatus:
        | 'PENDING'
        | 'CONFIRMED'
        | 'COMPLETED'
        | 'REJECTED'
        | 'CANCELLED';
      bookingType: 'CONSULTATION' | 'TATTOO_SESSION';
      tattooColor: 'BLACK_AND_GREY' | 'COLOR';
      tattooStyle:
        | 'TRADITIONAL_AMERICAN'
        | 'REALISM'
        | 'TRIBAL'
        | 'NEW_SCHOOL'
        | 'JAPANESE_IREZUMI'
        | 'BLACKWORK'
        | 'DOTWORK'
        | 'WATERCOLOR';
      user_type: 'ARTIST' | 'CUSTOMER';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database['public']['Tables'] & Database['public']['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'] &
      Database['public']['Views'])
  ? (Database['public']['Tables'] &
      Database['public']['Views'])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
  ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
  ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database['public']['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof Database['public']['Enums']
  ? Database['public']['Enums'][PublicEnumNameOrOptions]
  : never;
