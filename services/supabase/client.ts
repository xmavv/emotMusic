import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseEnv = {
  url: process.env.SUPABASE_URL || "",
  key: process.env.SUPABASE_KEY || "",
};
if (!supabaseEnv.url || !supabaseEnv.key)
  throw new Error("provide required supabaseClient environment!");

const supabaseClient = createClient<Database>(supabaseEnv.url, supabaseEnv.key);

export default supabaseClient;
