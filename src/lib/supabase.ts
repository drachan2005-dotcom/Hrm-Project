// File này khởi tạo kết nối với Supabase
import { createClient } from '@supabase/supabase-js';

// Lấy thông tin kết nối từ file .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Tạo client để kết nối với Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
