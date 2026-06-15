import 'package:supabase/supabase.dart';

void main() async {
  print('Testing Supabase Connection...');
  const url = 'https://ppiyecfcjpdajnpfrsyg.supabase.co';
  const key = 'sb_publishable_-fQ56EziX2yWdSBwZQU3Ag_iutcKnoZ';
  
  try {
    final client = SupabaseClient(url, key);
    final response = await client.auth.signInWithPassword(
      email: 'test@example.com',
      password: 'password123',
    );
    print('Success: ${response.user?.id}');
  } catch (e) {
    print('Error: $e');
  }
}
