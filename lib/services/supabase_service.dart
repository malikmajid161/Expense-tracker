import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// Initializes and exposes the Supabase client.
class SupabaseService {
  SupabaseService._();

  /// Call once in main() before runApp().
  static Future<void> init() async {
    final url = dotenv.env['SUPABASE_URL'];
    final anonKey = dotenv.env['SUPABASE_ANON_KEY'];

    if (url == null ||
        anonKey == null ||
        url.contains('your-project-ref') ||
        anonKey.contains('your-anon')) {
      throw Exception(
        'Supabase credentials are missing. '
        'Please open the ".env" file and add your SUPABASE_URL and '
        'SUPABASE_ANON_KEY from your Supabase dashboard.',
      );
    }

    await Supabase.initialize(url: url, anonKey: anonKey);
  }

  /// Shortcut to the global Supabase client.
  static SupabaseClient get client => Supabase.instance.client;

  /// Currently logged-in user (null if signed out).
  static User? get currentUser => client.auth.currentUser;
}
