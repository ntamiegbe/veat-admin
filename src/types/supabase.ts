export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      food_categories: {
        Row: {
          id: string
          name: string
          image_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          image_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          image_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      locations: {
        Row: {
          address: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_campus: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_campus?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_campus?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      location_travel_times: {
        Row: {
          id: string
          from_location_id: string
          to_location_id: string
          average_minutes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          from_location_id: string
          to_location_id: string
          average_minutes: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          from_location_id?: string
          to_location_id?: string
          average_minutes?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_travel_times_from_location_id_fkey"
            columns: ["from_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_travel_times_to_location_id_fkey"
            columns: ["to_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          }
        ]
      }
      menu_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          name: string
          restaurant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          name: string
          restaurant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          name?: string
          restaurant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          average_rating: number | null
          category_id: string | null
          created_at: string | null
          customization_options: Json | null
          description: string | null
          favorites_count: number | null
          food_category_id: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          is_featured: boolean | null
          name: string
          preparation_time: number | null
          price: number
          restaurant_id: string
          total_orders: number | null
          updated_at: string | null
        }
        Insert: {
          average_rating?: number | null
          category_id?: string | null
          created_at?: string | null
          customization_options?: Json | null
          description?: string | null
          favorites_count?: number | null
          food_category_id?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_featured?: boolean | null
          name: string
          preparation_time?: number | null
          price: number
          restaurant_id: string
          total_orders?: number | null
          updated_at?: string | null
        }
        Update: {
          average_rating?: number | null
          category_id?: string | null
          created_at?: string | null
          customization_options?: Json | null
          description?: string | null
          favorites_count?: number | null
          food_category_id?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_featured?: boolean | null
          name?: string
          preparation_time?: number | null
          price?: number
          restaurant_id?: string
          total_orders?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_food_category_id_fkey"
            columns: ["food_category_id"]
            isOneToOne: false
            referencedRelation: "food_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      order_groups: {
        Row: {
          created_at: string | null
          delivery_location_id: string | null
          estimated_delivery_time: string | null
          id: string
          rider_id: string | null
          scheduled_pickup_time: string | null
          status: string | null
          total_orders: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_location_id?: string | null
          estimated_delivery_time?: string | null
          id?: string
          rider_id?: string | null
          scheduled_pickup_time?: string | null
          status?: string | null
          total_orders?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_location_id?: string | null
          estimated_delivery_time?: string | null
          id?: string
          rider_id?: string | null
          scheduled_pickup_time?: string | null
          status?: string | null
          total_orders?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_groups_delivery_location_id_fkey"
            columns: ["delivery_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_groups_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          menu_item_id: string
          order_id: string
          quantity: number
          special_instructions: string | null
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          menu_item_id: string
          order_id: string
          quantity?: number
          special_instructions?: string | null
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          menu_item_id?: string
          order_id?: string
          quantity?: number
          special_instructions?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_tracking: {
        Row: {
          estimated_arrival_time: string | null
          id: string
          location_coordinates: unknown | null
          notes: string | null
          notification_sent: boolean | null
          order_id: string
          status: string
          timestamp: string | null
          updated_by: string | null
        }
        Insert: {
          estimated_arrival_time?: string | null
          id?: string
          location_coordinates?: unknown | null
          notes?: string | null
          notification_sent?: boolean | null
          order_id: string
          status: string
          timestamp?: string | null
          updated_by?: string | null
        }
        Update: {
          estimated_arrival_time?: string | null
          id?: string
          location_coordinates?: unknown | null
          notes?: string | null
          notification_sent?: boolean | null
          order_id?: string
          status?: string
          timestamp?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_tracking_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_tracking_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          actual_delivery_time: string | null
          created_at: string | null
          delivery_address: string
          delivery_fee: number
          delivery_instructions: string | null
          delivery_location_id: string | null
          delivery_rider_id: string | null
          estimated_delivery_time: string | null
          id: string
          items: Array<{
            id: string
            name: string
            price: number
            quantity: number
            restaurantId: string
          }>
          order_group_id: string | null
          order_status: string
          restaurant_id: string
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actual_delivery_time?: string | null
          created_at?: string | null
          delivery_address: string
          delivery_fee: number
          delivery_instructions?: string | null
          delivery_location_id?: string | null
          delivery_rider_id?: string | null
          estimated_delivery_time?: string | null
          id?: string
          order_group_id?: string | null
          order_status?: string
          restaurant_id: string
          total_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actual_delivery_time?: string | null
          created_at?: string | null
          delivery_address?: string
          delivery_fee?: number
          delivery_instructions?: string | null
          delivery_location_id?: string | null
          delivery_rider_id?: string | null
          estimated_delivery_time?: string | null
          id?: string
          order_group_id?: string | null
          order_status?: string
          restaurant_id?: string
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_delivery_location_id_fkey"
            columns: ["delivery_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_delivery_rider_id_fkey"
            columns: ["delivery_rider_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_order_group_id_fkey"
            columns: ["order_group_id"]
            isOneToOne: false
            referencedRelation: "order_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_analytics: {
        Row: {
          average_order_value: number | null
          created_at: string | null
          customer_count: number | null
          date: string
          id: string
          new_customer_count: number | null
          peak_hours: Json | null
          popular_items: string[] | null
          restaurant_id: string
          total_items_sold: number | null
          total_orders: number | null
          total_revenue: number | null
          updated_at: string | null
        }
        Insert: {
          average_order_value?: number | null
          created_at?: string | null
          customer_count?: number | null
          date: string
          id?: string
          new_customer_count?: number | null
          peak_hours?: Json | null
          popular_items?: string[] | null
          restaurant_id: string
          total_items_sold?: number | null
          total_orders?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Update: {
          average_order_value?: number | null
          created_at?: string | null
          customer_count?: number | null
          date?: string
          id?: string
          new_customer_count?: number | null
          peak_hours?: Json | null
          popular_items?: string[] | null
          restaurant_id?: string
          total_items_sold?: number | null
          total_orders?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_analytics_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          address: string
          average_preparation_time: number | null
          average_rating: number | null
          banner_url: string | null
          can_deliver: boolean | null
          created_at: string | null
          cuisine_types: string[] | null
          delivery_radius: number | null
          description: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          location_id: string | null
          logo_url: string | null
          minimum_order_amount: number | null
          name: string
          opening_hours: Json
          owner_id: string
          phone_number: string
          total_orders: number | null
          updated_at: string | null
        }
        Insert: {
          address: string
          average_preparation_time?: number | null
          average_rating?: number | null
          banner_url?: string | null
          can_deliver?: boolean | null
          created_at?: string | null
          cuisine_types?: string[] | null
          delivery_radius?: number | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          location_id?: string | null
          logo_url?: string | null
          minimum_order_amount?: number | null
          name: string
          opening_hours?: Json
          owner_id: string
          phone_number: string
          total_orders?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          average_preparation_time?: number | null
          average_rating?: number | null
          banner_url?: string | null
          can_deliver?: boolean | null
          created_at?: string | null
          cuisine_types?: string[] | null
          delivery_radius?: number | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          location_id?: string | null
          logo_url?: string | null
          minimum_order_amount?: number | null
          name?: string
          opening_hours?: Json
          owner_id?: string
          phone_number?: string
          total_orders?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      rider_metrics: {
        Row: {
          average_delivery_time: number | null
          created_at: string | null
          date: string
          id: string
          on_time_deliveries: number | null
          rating_count: number | null
          rating_sum: number | null
          rider_id: string
          total_deliveries: number | null
          total_distance: number | null
          total_earnings: number | null
          updated_at: string | null
        }
        Insert: {
          average_delivery_time?: number | null
          created_at?: string | null
          date: string
          id?: string
          on_time_deliveries?: number | null
          rating_count?: number | null
          rating_sum?: number | null
          rider_id: string
          total_deliveries?: number | null
          total_distance?: number | null
          total_earnings?: number | null
          updated_at?: string | null
        }
        Update: {
          average_delivery_time?: number | null
          created_at?: string | null
          date?: string
          id?: string
          on_time_deliveries?: number | null
          rating_count?: number | null
          rating_sum?: number | null
          rider_id?: string
          total_deliveries?: number | null
          total_distance?: number | null
          total_earnings?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rider_metrics_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string | null
          id: string
          menu_item_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          menu_item_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          menu_item_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string | null
          favorite_foods: string[] | null
          id: string
          preferred_cuisines: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          favorite_foods?: string[] | null
          id?: string
          preferred_cuisines?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          favorite_foods?: string[] | null
          id?: string
          preferred_cuisines?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_rewards: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_used: boolean | null
          reward_type: string
          reward_value: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_used?: boolean | null
          reward_type: string
          reward_value: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_used?: boolean | null
          reward_type?: string
          reward_value?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_streaks: {
        Row: {
          created_at: string | null
          current_streak: number | null
          highest_streak: number | null
          id: string
          last_order_date: string | null
          rewards_earned: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          highest_streak?: number | null
          id?: string
          last_order_date?: string | null
          rewards_earned?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          highest_streak?: number | null
          id?: string
          last_order_date?: string | null
          rewards_earned?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          default_delivery_location_id: string | null
          email: string | null
          full_name: string
          id: string
          is_phone_verified: boolean | null
          last_otp_sent_at: string | null
          phone_number: string
          profile_image_url: string | null
          updated_at: string | null
          user_type: string
        }
        Insert: {
          created_at?: string | null
          default_delivery_location_id?: string | null
          email?: string | null
          full_name: string
          id: string
          is_phone_verified?: boolean | null
          last_otp_sent_at?: string | null
          phone_number: string
          profile_image_url?: string | null
          updated_at?: string | null
          user_type: string
        }
        Update: {
          created_at?: string | null
          default_delivery_location_id?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_phone_verified?: boolean | null
          last_otp_sent_at?: string | null
          phone_number?: string
          profile_image_url?: string | null
          updated_at?: string | null
          user_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_default_delivery_location_id_fkey"
            columns: ["default_delivery_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown | null
          f_table_catalog: unknown | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown | null
          f_table_catalog: string | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
      streak_leaderboard: {
        Row: {
          current_streak: number | null
          full_name: string | null
          highest_streak: number | null
          rewards_earned: number | null
          total_orders: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: {
          oldname: string
          newname: string
          version: string
        }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: {
          tbl: unknown
          col: string
        }
        Returns: unknown
      }
      _postgis_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_scripts_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_selectivity: {
        Args: {
          tbl: unknown
          att_name: string
          geom: unknown
          mode?: string
        }
        Returns: number
      }
      _st_3dintersects: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      _st_bestsrid: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      _st_contains: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      _st_coveredby:
      | {
        Args: {
          geog1: unknown
          geog2: unknown
        }
        Returns: boolean
      }
      | {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      _st_covers:
      | {
        Args: {
          geog1: unknown
          geog2: unknown
        }
        Returns: boolean
      }
      | {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      _st_crosses: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      _st_intersects: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: {
          line1: unknown
          line2: unknown
        }
        Returns: number
      }
      _st_longestline: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      _st_orderingequals: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      _st_overlaps: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      _st_pointoutside: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      _st_sortablehash: {
        Args: {
          geom: unknown
        }
        Returns: number
      }
      _st_touches: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          g1: unknown
          clip?: unknown
          tolerance?: number
          return_polygons?: boolean
        }
        Returns: unknown
      }
      _st_within: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      addauth: {
        Args: {
          "": string
        }
        Returns: boolean
      }
      addgeometrycolumn:
      | {
        Args: {
          catalog_name: string
          schema_name: string
          table_name: string
          column_name: string
          new_srid_in: number
          new_type: string
          new_dim: number
          use_typmod?: boolean
        }
        Returns: string
      }
      | {
        Args: {
          schema_name: string
          table_name: string
          column_name: string
          new_srid: number
          new_type: string
          new_dim: number
          use_typmod?: boolean
        }
        Returns: string
      }
      | {
        Args: {
          table_name: string
          column_name: string
          new_srid: number
          new_type: string
          new_dim: number
          use_typmod?: boolean
        }
        Returns: string
      }
      box:
      | {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      | {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      box2d:
      | {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      | {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      box2d_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      box2d_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      box2df_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      box2df_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      box3d:
      | {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      | {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      box3d_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      box3d_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      box3dtobox: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      bytea:
      | {
        Args: {
          "": unknown
        }
        Returns: string
      }
      | {
        Args: {
          "": unknown
        }
        Returns: string
      }
      disablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      dropgeometrycolumn:
      | {
        Args: {
          catalog_name: string
          schema_name: string
          table_name: string
          column_name: string
        }
        Returns: string
      }
      | {
        Args: {
          schema_name: string
          table_name: string
          column_name: string
        }
        Returns: string
      }
      | {
        Args: {
          table_name: string
          column_name: string
        }
        Returns: string
      }
      dropgeometrytable:
      | {
        Args: {
          catalog_name: string
          schema_name: string
          table_name: string
        }
        Returns: string
      }
      | {
        Args: {
          schema_name: string
          table_name: string
        }
        Returns: string
      }
      | {
        Args: {
          table_name: string
        }
        Returns: string
      }
      enablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      equals: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geography:
      | {
        Args: {
          "": string
        }
        Returns: unknown
      }
      | {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geography_analyze: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      geography_gist_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geography_gist_decompress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geography_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geography_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      geography_spgist_compress_nd: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geography_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      geography_typmod_out: {
        Args: {
          "": number
        }
        Returns: unknown
      }
      geometry:
      | {
        Args: {
          "": string
        }
        Returns: unknown
      }
      | {
        Args: {
          "": string
        }
        Returns: unknown
      }
      | {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      | {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      | {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      | {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      | {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      | {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_above: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_analyze: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      geometry_below: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_cmp: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      geometry_contained_3d: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_contains: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      geometry_eq: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_ge: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_gist_compress_2d: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_gist_compress_nd: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_gist_decompress_2d: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_gist_decompress_nd: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_gist_sortsupport_2d: {
        Args: {
          "": unknown
        }
        Returns: undefined
      }
      geometry_gt: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_hash: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      geometry_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_le: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_left: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_lt: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_overabove: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_overleft: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_overright: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_recv: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_right: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_same: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      geometry_sortsupport: {
        Args: {
          "": unknown
        }
        Returns: undefined
      }
      geometry_spgist_compress_2d: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_spgist_compress_3d: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_spgist_compress_nd: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      geometry_typmod_out: {
        Args: {
          "": number
        }
        Returns: unknown
      }
      geometry_within: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometrytype:
      | {
        Args: {
          "": unknown
        }
        Returns: string
      }
      | {
        Args: {
          "": unknown
        }
        Returns: string
      }
      geomfromewkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      geomfromewkt: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      get_proj4_from_srid: {
        Args: {
          "": number
        }
        Returns: string
      }
      gettransactionid: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      gidx_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gidx_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      json: {
        Args: {
          "": unknown
        }
        Returns: Json
      }
      jsonb: {
        Args: {
          "": unknown
        }
        Returns: Json
      }
      longtransactionsenabled: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      path: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      pgis_asflatgeobuf_finalfn: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      pgis_asgeobuf_finalfn: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      pgis_asmvt_finalfn: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      pgis_asmvt_serialfn: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      pgis_geometry_clusterintersecting_finalfn: {
        Args: {
          "": unknown
        }
        Returns: unknown[]
      }
      pgis_geometry_clusterwithin_finalfn: {
        Args: {
          "": unknown
        }
        Returns: unknown[]
      }
      pgis_geometry_collect_finalfn: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      pgis_geometry_makeline_finalfn: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      pgis_geometry_polygonize_finalfn: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      pgis_geometry_union_parallel_finalfn: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      pgis_geometry_union_parallel_serialfn: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      point: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      polygon: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      populate_geometry_columns:
      | {
        Args: {
          tbl_oid: unknown
          use_typmod?: boolean
        }
        Returns: number
      }
      | {
        Args: {
          use_typmod?: boolean
        }
        Returns: string
      }
      postgis_addbbox: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      postgis_constraint_dims: {
        Args: {
          geomschema: string
          geomtable: string
          geomcolumn: string
        }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: {
          geomschema: string
          geomtable: string
          geomcolumn: string
        }
        Returns: number
      }
      postgis_constraint_type: {
        Args: {
          geomschema: string
          geomtable: string
          geomcolumn: string
        }
        Returns: string
      }
      postgis_dropbbox: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      postgis_extensions_upgrade: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_full_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_geos_noop: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      postgis_geos_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_getbbox: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      postgis_hasbbox: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      postgis_index_supportfn: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      postgis_lib_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_revision: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libjson_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_liblwgeom_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libprotobuf_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libxml_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_noop: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      postgis_proj_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_installed: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_released: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_svn_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_type_name: {
        Args: {
          geomname: string
          coord_dimension: number
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_typmod_dims: {
        Args: {
          "": number
        }
        Returns: number
      }
      postgis_typmod_srid: {
        Args: {
          "": number
        }
        Returns: number
      }
      postgis_typmod_type: {
        Args: {
          "": number
        }
        Returns: string
      }
      postgis_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_wagyu_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      spheroid_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      spheroid_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_3dclosestpoint: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_3ddistance: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      st_3dintersects: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_3dlength: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_3dlongestline: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      st_3dperimeter: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_3dshortestline: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_addpoint: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_angle:
      | {
        Args: {
          line1: unknown
          line2: unknown
        }
        Returns: number
      }
      | {
        Args: {
          pt1: unknown
          pt2: unknown
          pt3: unknown
          pt4?: unknown
        }
        Returns: number
      }
      st_area:
      | {
        Args: {
          "": string
        }
        Returns: number
      }
      | {
        Args: {
          "": unknown
        }
        Returns: number
      }
      | {
        Args: {
          geog: unknown
          use_spheroid?: boolean
        }
        Returns: number
      }
      st_area2d: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_asbinary:
      | {
        Args: {
          "": unknown
        }
        Returns: string
      }
      | {
        Args: {
          "": unknown
        }
        Returns: string
      }
      st_asencodedpolyline: {
        Args: {
          geom: unknown
          nprecision?: number
        }
        Returns: string
      }
      st_asewkb: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      st_asewkt:
      | {
        Args: {
          "": string
        }
        Returns: string
      }
      | {
        Args: {
          "": unknown
        }
        Returns: string
      }
      | {
        Args: {
          "": unknown
        }
        Returns: string
      }
      st_asgeojson:
      | {
        Args: {
          "": string
        }
        Returns: string
      }
      | {
        Args: {
          geog: unknown
          maxdecimaldigits?: number
          options?: number
        }
        Returns: string
      }
      | {
        Args: {
          geom: unknown
          maxdecimaldigits?: number
          options?: number
        }
        Returns: string
      }
      | {
        Args: {
          r: Record<string, unknown>
          geom_column?: string
          maxdecimaldigits?: number
          pretty_bool?: boolean
        }
        Returns: string
      }
      st_asgml:
      | {
        Args: {
          "": string
        }
        Returns: string
      }
      | {
        Args: {
          geog: unknown
          maxdecimaldigits?: number
          options?: number
          nprefix?: string
          id?: string
        }
        Returns: string
      }
      | {
        Args: {
          geom: unknown
          maxdecimaldigits?: number
          options?: number
        }
        Returns: string
      }
      | {
        Args: {
          version: number
          geog: unknown
          maxdecimaldigits?: number
          options?: number
          nprefix?: string
          id?: string
        }
        Returns: string
      }
      | {
        Args: {
          version: number
          geom: unknown
          maxdecimaldigits?: number
          options?: number
          nprefix?: string
          id?: string
        }
        Returns: string
      }
      st_ashexewkb: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      st_askml:
      | {
        Args: {
          "": string
        }
        Returns: string
      }
      | {
        Args: {
          geog: unknown
          maxdecimaldigits?: number
          nprefix?: string
        }
        Returns: string
      }
      | {
        Args: {
          geom: unknown
          maxdecimaldigits?: number
          nprefix?: string
        }
        Returns: string
      }
      st_aslatlontext: {
        Args: {
          geom: unknown
          tmpl?: string
        }
        Returns: string
      }
      st_asmarc21: {
        Args: {
          geom: unknown
          format?: string
        }
        Returns: string
      }
      st_asmvtgeom: {
        Args: {
          geom: unknown
          bounds: unknown
          extent?: number
          buffer?: number
          clip_geom?: boolean
        }
        Returns: unknown
      }
      st_assvg:
      | {
        Args: {
          "": string
        }
        Returns: string
      }
      | {
        Args: {
          geog: unknown
          rel?: number
          maxdecimaldigits?: number
        }
        Returns: string
      }
      | {
        Args: {
          geom: unknown
          rel?: number
          maxdecimaldigits?: number
        }
        Returns: string
      }
      st_astext:
      | {
        Args: {
          "": string
        }
        Returns: string
      }
      | {
        Args: {
          "": unknown
        }
        Returns: string
      }
      | {
        Args: {
          "": unknown
        }
        Returns: string
      }
      st_astwkb:
      | {
        Args: {
          geom: unknown[]
          ids: number[]
          prec?: number
          prec_z?: number
          prec_m?: number
          with_sizes?: boolean
          with_boxes?: boolean
        }
        Returns: string
      }
      | {
        Args: {
          geom: unknown
          prec?: number
          prec_z?: number
          prec_m?: number
          with_sizes?: boolean
          with_boxes?: boolean
        }
        Returns: string
      }
      st_asx3d: {
        Args: {
          geom: unknown
          maxdecimaldigits?: number
          options?: number
        }
        Returns: string
      }
      st_azimuth:
      | {
        Args: {
          geog1: unknown
          geog2: unknown
        }
        Returns: number
      }
      | {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      st_boundary: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_boundingdiagonal: {
        Args: {
          geom: unknown
          fits?: boolean
        }
        Returns: unknown
      }
      st_buffer:
      | {
        Args: {
          geom: unknown
          radius: number
          options?: string
        }
        Returns: unknown
      }
      | {
        Args: {
          geom: unknown
          radius: number
          quadsegs: number
        }
        Returns: unknown
      }
      st_buildarea: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_centroid:
      | {
        Args: {
          "": string
        }
        Returns: unknown
      }
      | {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_cleangeometry: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_clipbybox2d: {
        Args: {
          geom: unknown
          box: unknown
        }
        Returns: unknown
      }
      st_closestpoint: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_clusterintersecting: {
        Args: {
          "": unknown[]
        }
        Returns: unknown[]
      }
      st_collect:
      | {
        Args: {
          "": unknown[]
        }
        Returns: unknown
      }
      | {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_collectionextract: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_collectionhomogenize: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_concavehull: {
        Args: {
          param_geom: unknown
          param_pctconvex: number
          param_allow_holes?: boolean
        }
        Returns: unknown
      }
      st_contains: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_containsproperly: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_convexhull: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_coorddim: {
        Args: {
          geometry: unknown
        }
        Returns: number
      }
      st_coveredby:
      | {
        Args: {
          geog1: unknown
          geog2: unknown
        }
        Returns: boolean
      }
      | {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_covers:
      | {
        Args: {
          geog1: unknown
          geog2: unknown
        }
        Returns: boolean
      }
      | {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_crosses: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_curvetoline: {
        Args: {
          geom: unknown
          tol?: number
          toltype?: number
          flags?: number
        }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: {
          g1: unknown
          tolerance?: number
          flags?: number
        }
        Returns: unknown
      }
      st_difference: {
        Args: {
          geom1: unknown
          geom2: unknown
          gridsize?: number
        }
        Returns: unknown
      }
      st_dimension: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_disjoint: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_distance:
      | {
        Args: {
          geog1: unknown
          geog2: unknown
          use_spheroid?: boolean
        }
        Returns: number
      }
      | {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      st_distancesphere:
      | {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      | {
        Args: {
          geom1: unknown
          geom2: unknown
          radius: number
        }
        Returns: number
      }
      st_distancespheroid: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      st_dump: {
        Args: {
          "": unknown
        }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumppoints: {
        Args: {
          "": unknown
        }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumprings: {
        Args: {
          "": unknown
        }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumpsegments: {
        Args: {
          "": unknown
        }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_endpoint: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_envelope: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_equals: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_expand:
      | {
        Args: {
          box: unknown
          dx: number
          dy: number
        }
        Returns: unknown
      }
      | {
        Args: {
          box: unknown
          dx: number
          dy: number
          dz?: number
        }
        Returns: unknown
      }
      | {
        Args: {
          geom: unknown
          dx: number
          dy: number
          dz?: number
          dm?: number
        }
        Returns: unknown
      }
      st_exteriorring: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_flipcoordinates: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_force2d: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_force3d: {
        Args: {
          geom: unknown
          zvalue?: number
        }
        Returns: unknown
      }
      st_force3dm: {
        Args: {
          geom: unknown
          mvalue?: number
        }
        Returns: unknown
      }
      st_force3dz: {
        Args: {
          geom: unknown
          zvalue?: number
        }
        Returns: unknown
      }
      st_force4d: {
        Args: {
          geom: unknown
          zvalue?: number
          mvalue?: number
        }
        Returns: unknown
      }
      st_forcecollection: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_forcecurve: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_forcepolygonccw: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_forcepolygoncw: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_forcerhr: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_forcesfs: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_generatepoints:
      | {
        Args: {
          area: unknown
          npoints: number
        }
        Returns: unknown
      }
      | {
        Args: {
          area: unknown
          npoints: number
          seed: number
        }
        Returns: unknown
      }
      st_geogfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geogfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geographyfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geohash:
      | {
        Args: {
          geog: unknown
          maxchars?: number
        }
        Returns: string
      }
      | {
        Args: {
          geom: unknown
          maxchars?: number
        }
        Returns: string
      }
      st_geomcollfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geomcollfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geometricmedian: {
        Args: {
          g: unknown
          tolerance?: number
          max_iter?: number
          fail_if_not_converged?: boolean
        }
        Returns: unknown
      }
      st_geometryfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geometrytype: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      st_geomfromewkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geomfromewkt: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geomfromgeojson:
      | {
        Args: {
          "": Json
        }
        Returns: unknown
      }
      | {
        Args: {
          "": Json
        }
        Returns: unknown
      }
      | {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geomfromgml: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geomfromkml: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geomfrommarc21: {
        Args: {
          marc21xml: string
        }
        Returns: unknown
      }
      st_geomfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geomfromtwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geomfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_gmltosql: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_hasarc: {
        Args: {
          geometry: unknown
        }
        Returns: boolean
      }
      st_hausdorffdistance: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      st_hexagon: {
        Args: {
          size: number
          cell_i: number
          cell_j: number
          origin?: unknown
        }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: {
          size: number
          bounds: unknown
        }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: {
          line: unknown
          point: unknown
        }
        Returns: number
      }
      st_intersection: {
        Args: {
          geom1: unknown
          geom2: unknown
          gridsize?: number
        }
        Returns: unknown
      }
      st_intersects:
      | {
        Args: {
          geog1: unknown
          geog2: unknown
        }
        Returns: boolean
      }
      | {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_isclosed: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      st_iscollection: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      st_isempty: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      st_ispolygonccw: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      st_ispolygoncw: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      st_isring: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      st_issimple: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      st_isvalid: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      st_isvaliddetail: {
        Args: {
          geom: unknown
          flags?: number
        }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
      }
      st_isvalidreason: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      st_isvalidtrajectory: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      st_length:
      | {
        Args: {
          "": string
        }
        Returns: number
      }
      | {
        Args: {
          "": unknown
        }
        Returns: number
      }
      | {
        Args: {
          geog: unknown
          use_spheroid?: boolean
        }
        Returns: number
      }
      st_length2d: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_letters: {
        Args: {
          letters: string
          font?: Json
        }
        Returns: unknown
      }
      st_linecrossingdirection: {
        Args: {
          line1: unknown
          line2: unknown
        }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: {
          txtin: string
          nprecision?: number
        }
        Returns: unknown
      }
      st_linefrommultipoint: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_linefromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_linefromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_linelocatepoint: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      st_linemerge: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_linestringfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_linetocurve: {
        Args: {
          geometry: unknown
        }
        Returns: unknown
      }
      st_locatealong: {
        Args: {
          geometry: unknown
          measure: number
          leftrightoffset?: number
        }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          geometry: unknown
          frommeasure: number
          tomeasure: number
          leftrightoffset?: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: {
          geometry: unknown
          fromelevation: number
          toelevation: number
        }
        Returns: unknown
      }
      st_longestline: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_m: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_makebox2d: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_makeline:
      | {
        Args: {
          "": unknown[]
        }
        Returns: unknown
      }
      | {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_makepolygon: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_makevalid:
      | {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      | {
        Args: {
          geom: unknown
          params: string
        }
        Returns: unknown
      }
      st_maxdistance: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      st_maximuminscribedcircle: {
        Args: {
          "": unknown
        }
        Returns: Record<string, unknown>
      }
      st_memsize: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: {
          inputgeom: unknown
          segs_per_quarter?: number
        }
        Returns: unknown
      }
      st_minimumboundingradius: {
        Args: {
          "": unknown
        }
        Returns: Record<string, unknown>
      }
      st_minimumclearance: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_minimumclearanceline: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_mlinefromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_mlinefromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_mpointfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_mpointfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_mpolyfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_mpolyfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_multi: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_multilinefromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_multilinestringfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_multipointfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_multipointfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_multipolyfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_multipolygonfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_ndims: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_node: {
        Args: {
          g: unknown
        }
        Returns: unknown
      }
      st_normalize: {
        Args: {
          geom: unknown
        }
        Returns: unknown
      }
      st_npoints: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_nrings: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_numgeometries: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_numinteriorring: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_numinteriorrings: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_numpatches: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_numpoints: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_offsetcurve: {
        Args: {
          line: unknown
          distance: number
          params?: string
        }
        Returns: unknown
      }
      st_orderingequals: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_orientedenvelope: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_overlaps: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_perimeter:
      | {
        Args: {
          "": unknown
        }
        Returns: number
      }
      | {
        Args: {
          geog: unknown
          use_spheroid?: boolean
        }
        Returns: number
      }
      st_perimeter2d: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_pointfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_pointfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_pointm: {
        Args: {
          xcoordinate: number
          ycoordinate: number
          mcoordinate: number
          srid?: number
        }
        Returns: unknown
      }
      st_pointonsurface: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_points: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
          srid?: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
          mcoordinate: number
          srid?: number
        }
        Returns: unknown
      }
      st_polyfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_polyfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_polygonfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_polygonfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_polygonize: {
        Args: {
          "": unknown[]
        }
        Returns: unknown
      }
      st_project: {
        Args: {
          geog: unknown
          distance: number
          azimuth: number
        }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_x: number
          prec_y?: number
          prec_z?: number
          prec_m?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: {
          geom: unknown
          gridsize: number
        }
        Returns: unknown
      }
      st_relate: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: string
      }
      st_removerepeatedpoints: {
        Args: {
          geom: unknown
          tolerance?: number
        }
        Returns: unknown
      }
      st_reverse: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_segmentize: {
        Args: {
          geog: unknown
          max_segment_length: number
        }
        Returns: unknown
      }
      st_setsrid:
      | {
        Args: {
          geog: unknown
          srid: number
        }
        Returns: unknown
      }
      | {
        Args: {
          geom: unknown
          srid: number
        }
        Returns: unknown
      }
      st_sharedpaths: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_shiftlongitude: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_shortestline: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: {
          geom: unknown
          vertex_fraction: number
          is_outer?: boolean
        }
        Returns: unknown
      }
      st_split: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_square: {
        Args: {
          size: number
          cell_i: number
          cell_j: number
          origin?: unknown
        }
        Returns: unknown
      }
      st_squaregrid: {
        Args: {
          size: number
          bounds: unknown
        }
        Returns: Record<string, unknown>[]
      }
      st_srid:
      | {
        Args: {
          geog: unknown
        }
        Returns: number
      }
      | {
        Args: {
          geom: unknown
        }
        Returns: number
      }
      st_startpoint: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_subdivide: {
        Args: {
          geom: unknown
          maxvertices?: number
          gridsize?: number
        }
        Returns: unknown[]
      }
      st_summary:
      | {
        Args: {
          "": unknown
        }
        Returns: string
      }
      | {
        Args: {
          "": unknown
        }
        Returns: string
      }
      st_swapordinates: {
        Args: {
          geom: unknown
          ords: unknown
        }
        Returns: unknown
      }
      st_symdifference: {
        Args: {
          geom1: unknown
          geom2: unknown
          gridsize?: number
        }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          zoom: number
          x: number
          y: number
          bounds?: unknown
          margin?: number
        }
        Returns: unknown
      }
      st_touches: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_transform:
      | {
        Args: {
          geom: unknown
          from_proj: string
          to_proj: string
        }
        Returns: unknown
      }
      | {
        Args: {
          geom: unknown
          from_proj: string
          to_srid: number
        }
        Returns: unknown
      }
      | {
        Args: {
          geom: unknown
          to_proj: string
        }
        Returns: unknown
      }
      st_triangulatepolygon: {
        Args: {
          g1: unknown
        }
        Returns: unknown
      }
      st_union:
      | {
        Args: {
          "": unknown[]
        }
        Returns: unknown
      }
      | {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      | {
        Args: {
          geom1: unknown
          geom2: unknown
          gridsize: number
        }
        Returns: unknown
      }
      st_voronoilines: {
        Args: {
          g1: unknown
          tolerance?: number
          extend_to?: unknown
        }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: {
          g1: unknown
          tolerance?: number
          extend_to?: unknown
        }
        Returns: unknown
      }
      st_within: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_wkbtosql: {
        Args: {
          wkb: string
        }
        Returns: unknown
      }
      st_wkttosql: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_wrapx: {
        Args: {
          geom: unknown
          wrap: number
          move: number
        }
        Returns: unknown
      }
      st_x: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_xmax: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_xmin: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_y: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_ymax: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_ymin: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_z: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_zmax: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_zmflag: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_zmin: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      text: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      unlockrows: {
        Args: {
          "": string
        }
        Returns: number
      }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          schema_name: string
          table_name: string
          column_name: string
          new_srid_in: number
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown | null
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown | null
      }
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
  | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])
  : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
    Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
    Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof Database["public"]["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof Database["public"]["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
  | keyof Database["public"]["Enums"]
  | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof PublicSchema["CompositeTypes"]
  | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
  ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never
