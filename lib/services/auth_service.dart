import 'package:supabase_flutter/supabase_flutter.dart';
import 'supabase_service.dart';

/// Handles all authentication with Supabase.
class AuthService {
  SupabaseClient get _client => SupabaseService.client;

  /// Stream of auth state changes (used to switch between login/home).
  Stream<AuthState> get authStateChanges => _client.auth.onAuthStateChange;

  User? get currentUser => _client.auth.currentUser;

  Future<void> signUp({
    required String email,
    required String password,
    String? username,
  }) async {
    await _client.auth.signUp(
      email: email,
      password: password,
      data: username != null && username.trim().isNotEmpty
          ? {'username': username.trim()}
          : null,
    );
  }


  Future<void> signIn({
    required String email,
    required String password,
  }) async {
    await _client.auth.signInWithPassword(email: email, password: password);
  }

  Future<void> updateUsername(String username) async {
    await _client.auth.updateUser(
      UserAttributes(
        data: {'username': username.trim()},
      ),
    );
  }

  Future<void> signOut() async {
    await _client.auth.signOut();
  }
}
