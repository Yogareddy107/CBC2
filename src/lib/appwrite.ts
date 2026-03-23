import { Client, Account, Databases, Storage, Users, Query } from "node-appwrite";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "./supabase-server";
import crypto from "crypto";

export async function createSessionClient() {
  const cookieStore = await cookies();
  const appwriteSession = cookieStore.get("appwrite-session");

  // If Appwrite session exists, use Appwrite
  if (appwriteSession && appwriteSession.value) {
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

    client.setSession(appwriteSession.value);

    return {
      get account() {
        return new Account(client);
      },
      get databases() {
        return new Databases(client);
      },
    };
  }

  // Fallback to Supabase - Only if a Supabase cookie is detected to avoid unnecessary DNS hits
  const allCookies = cookieStore.getAll();
  const hasSupabaseCookie = allCookies.some(c => c.name.startsWith('sb-'));

  if (hasSupabaseCookie) {
    try {
      const supabase = await createSupabaseServerClient();
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();

      if (supabaseUser) {
        return {
          get account() {
            return {
              async get() {
                return {
                  $id: supabaseUser.id,
                  email: supabaseUser.email || "",
                  name: supabaseUser.user_metadata?.full_name || supabaseUser.email || "User",
                };
              },
              async getPrefs() {
                return supabaseUser.user_metadata?.prefs || {};
              },
              async updatePrefs(prefs: any) {
                const { data, error } = await supabase.auth.updateUser({
                  data: { 
                    prefs: { 
                        ...(supabaseUser.user_metadata?.prefs || {}), 
                        ...prefs 
                    } 
                  }
                });
                if (error) throw error;
                return data.user.user_metadata.prefs;
              },
              async deleteSession(sessionId: string) {
                await supabase.auth.signOut();
              }
            } as any;
          },
          get databases() {
            return {} as any;
          },
        };
      }
    } catch (supabaseError) {
      console.error('⚠️ Supabase session check failed (network/DNS issue):', supabaseError);
      // Fall through to "No session found"
    }
  }

  // No session found
  console.log('❌ Auth Logic: No Appwrite or Supabase session found');
  throw new Error("No session");
}

export async function createAdminClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
    get storage() {
      return new Storage(client);
    },
    get users() {
      return new Users(client);
    },
  };
}

export function generateApiKey() {
  return `cbc_${crypto.randomBytes(24).toString('hex')}`;
}

export async function verifyApiKey(apiKey: string) {
  if (!apiKey || !apiKey.startsWith('cbc_')) return null;

  const adminClient = await createAdminClient();
  const users = adminClient.users;

  try {
    // List all users. For small systems this is fine. 
    // In production, we'd use a database collection for API keys to allow indexing.
    const result = await users.list();
    
    for (const user of result.users) {
      if (user.prefs?.cbc_api_key === apiKey) {
        return {
          $id: user.$id,
          name: user.name,
          email: user.email,
          github_token: user.prefs.github_token,
          prefs: user.prefs
        };
      }
    }
  } catch (error) {
    console.error('[verifyApiKey] Error:', error);
  }

  return null;
}
