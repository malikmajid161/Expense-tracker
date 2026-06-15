import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// Initializes and exposes the Supabase client.
class SupabaseService {
  SupabaseService._();

  /// Whether offline/demo mode is active.
  static bool useOfflineMode = false;

  static bool _initialized = false;
  static bool get isInitialized => _initialized;

  static Future<void> init() async {
    if (_initialized) return;

    final url = 'https://ppiyecfcjpdajnpfrsyg.supabase.co';
    final anonKey = 'sb_publishable_-fQ56EziX2yWdSBwZQU3Ag_iutcKnoZ';

    if (url == null ||
        anonKey == null ||
        url.isEmpty ||
        anonKey.isEmpty ||
        url.contains('your-project-ref') ||
        anonKey.contains('your-anon')) {
      throw Exception(
        'Supabase credentials are missing or invalid. '
        'Please enter correct credentials in the .env file.',
      );
    }

    await Supabase.initialize(url: url.trim(), anonKey: anonKey.trim());
    _initialized = true;
  }

  /// Shortcut to the global Supabase client.
  static SupabaseClient get client {
    if (!_initialized) {
      throw Exception('Supabase is not initialized. Please check your .env file.');
    }
    return Supabase.instance.client;
  }

  /// Currently logged-in user (null if signed out).
  static User? get currentUser {
    if (useOfflineMode || !_initialized) {
      return null;
    }
    try {
      return client.auth.currentUser;
    } catch (_) {
      return null;
    }
  }
}
