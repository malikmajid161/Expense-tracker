import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter/material.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  const url = 'https://ppiyecfcjpdajnpfrsyg.supabase.co';
  const key = 'sb_publishable_-fQ56EziX2yWdSBwZQU3Ag_iutcKnoZ';
  
  try {
    await Supabase.initialize(url: url, anonKey: key);
    final client = Supabase.instance.client;
    final response = await client.auth.signInWithPassword(
      email: 'test@example.com',
      password: 'testpassword'
    );
    print('Success: ${response.user?.id}');
  } catch (e) {
    print('Error caught in Dart: $e');
  }
}
