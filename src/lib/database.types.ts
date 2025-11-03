export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          image_url: string;
          is_active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string;
          image_url?: string;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string;
          image_url?: string;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          slug: string;
          description: string;
          price: number;
          image_url: string;
          is_active: boolean;
          is_featured: boolean;
          stock_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          slug: string;
          description?: string;
          price: number;
          image_url?: string;
          is_active?: boolean;
          is_featured?: boolean;
          stock_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          name?: string;
          slug?: string;
          description?: string;
          price?: number;
          image_url?: string;
          is_active?: boolean;
          is_featured?: boolean;
          stock_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_keys: {
        Row: {
          id: string;
          product_id: string;
          key_value: string;
          is_sold: boolean;
          sold_to_user_id: string | null;
          sold_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          key_value: string;
          is_sold?: boolean;
          sold_to_user_id?: string | null;
          sold_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          key_value?: string;
          is_sold?: boolean;
          sold_to_user_id?: string | null;
          sold_at?: string | null;
          created_at?: string;
        };
      };
      users_profile: {
        Row: {
          id: string;
          username: string;
          full_name: string;
          role: string;
          is_blocked: boolean;
          last_ip: string;
          country: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string;
          role?: string;
          is_blocked?: boolean;
          last_ip?: string;
          country?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string;
          role?: string;
          is_blocked?: boolean;
          last_ip?: string;
          country?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          order_number: string;
          total_amount: number;
          status: string;
          payment_method: string;
          ip_address: string;
          country: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          order_number: string;
          total_amount: number;
          status?: string;
          payment_method?: string;
          ip_address?: string;
          country?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          order_number?: string;
          total_amount?: number;
          status?: string;
          payment_method?: string;
          ip_address?: string;
          country?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_key_id: string | null;
          product_name: string;
          price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_key_id?: string | null;
          product_name: string;
          price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          product_key_id?: string | null;
          product_name?: string;
          price?: number;
          created_at?: string;
        };
      };
      user_sessions: {
        Row: {
          id: string;
          user_id: string;
          ip_address: string;
          country: string;
          user_agent: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          ip_address?: string;
          country?: string;
          user_agent?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          ip_address?: string;
          country?: string;
          user_agent?: string;
          created_at?: string;
        };
      };
    };
  };
};
