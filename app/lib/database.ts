import { createServerClient } from "./supabase";

/* ═══ Types ═══ */

export type User = {
  id: string;
  auth_id: string;
  email: string;
  name: string | null;
  country: string | null;
  operations: string[] | null;
  language: string | null;
  about_you: string | null;
  custom_instructions: string | null;
  memory_enabled: boolean;
  web_search_enabled: boolean;
  theme: string | null;
  created_at: string;
  updated_at: string;
};

export type Conversation = {
  id: string;
  user_id: string;
  mode: string;
  title: string | null;
  project_id?: string | null;
  created_at: string;
  updated_at: string;
};

export type DBMessage = {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  attachments: any[] | null;
  created_at: string;
};

export type Memory = {
  id: string;
  user_id: string;
  fact: string;
  category: string | null;
  conversation_id: string | null;
  created_at: string;
};

/* ═══ Users ═══ */

export async function getUser(authId: string): Promise<User | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("auth_id", authId)
    .single();
  if (error) return null;
  return data as User;
}

export async function createUser(data: {
  auth_id: string;
  email: string;
  name?: string;
  country?: string;
  operations?: string[];
  language?: string;
}): Promise<User | null> {
  const supabase = createServerClient();
  const { data: user, error } = await supabase
    .from("users")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return user as User;
}

export async function updateUser(
  id: string,
  data: Partial<Omit<User, "id" | "auth_id" | "created_at">>,
): Promise<User | null> {
  const supabase = createServerClient();
  const { data: user, error } = await supabase
    .from("users")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return user as User;
}

/* ═══ Conversations ═══ */

export async function getConversations(
  userId: string,
  limit = 50,
): Promise<Conversation[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Conversation[];
}

export async function createConversation(
  userId: string,
  mode: string,
): Promise<Conversation> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("conversations")
    .insert({ user_id: userId, mode })
    .select()
    .single();
  if (error) throw error;
  return data as Conversation;
}

export async function updateConversationTitle(
  id: string,
  title: string,
): Promise<void> {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("conversations")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteConversation(id: string): Promise<void> {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

/* ═══ Messages ═══ */

export async function getMessages(
  conversationId: string,
): Promise<DBMessage[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as DBMessage[];
}

export async function saveMessage(
  conversationId: string,
  role: string,
  content: string,
  attachments?: any[],
): Promise<DBMessage> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      role,
      content,
      ...(attachments ? { attachments } : {}),
    })
    .select()
    .single();
  if (error) throw error;
  return data as DBMessage;
}

/* ═══ Memories ═══ */

export async function getMemories(userId: string): Promise<Memory[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("memories")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Memory[];
}

export async function saveMemory(
  userId: string,
  fact: string,
  category?: string,
  conversationId?: string,
): Promise<Memory> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("memories")
    .insert({
      user_id: userId,
      fact,
      ...(category ? { category } : {}),
      ...(conversationId ? { conversation_id: conversationId } : {}),
    })
    .select()
    .single();
  if (error) throw error;
  return data as Memory;
}

export async function deleteMemory(id: string): Promise<void> {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("memories")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
