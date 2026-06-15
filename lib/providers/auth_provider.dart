import 'dart:async';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/auth_service.dart';
import '../services/supabase_service.dart';

/// Holds authentication state and exposes login/signup/logout.
class AuthProvider extends ChangeNotifier {
  final AuthService _auth = AuthService();

  User? _user;
  bool _loading = false;
  String? _error;

  // Persistent user profile settings
  String? _profilePicBase64;
  double _budgetLimit = 15000.0;
  String _currencySymbol = 'Rs';

  User? get user => _user;
  bool get loading => _loading;
  String? get error => _error;
  bool get isLoggedIn => _user != null;

  String? get profilePicBase64 => _profilePicBase64;
  double get budgetLimit => _budgetLimit;
  String get currencySymbol => _currencySymbol;

  StreamSubscription<AuthState>? _authSubscription;

  AuthProvider() {
    _init();
  }

  Future<void> _init() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final isOffline = prefs.getBool('use_offline_mode') ?? false;
      SupabaseService.useOfflineMode = isOffline;

      if (isOffline) {
        final email = prefs.getString('offline_user_email') ?? 'demo@example.com';
        final username = prefs.getString('offline_user_username') ?? 'Demo User';
        _user = User(
          id: 'offline_user_id',
          appMetadata: const {},
          userMetadata: {'username': username},
          aud: 'authenticated',
          createdAt: DateTime.now().toIso8601String(),
          email: email,
        );
      } else {
        if (SupabaseService.isInitialized) {
          _user = _auth.currentUser;
          _listenToAuthChanges();
        }
      }
      await loadProfile();
    } catch (_) {}
    notifyListeners();
  }

  void _listenToAuthChanges() {
    if (_authSubscription != null) return;
    try {
      _authSubscription = _auth.authStateChanges.listen((state) {
        if (!SupabaseService.useOfflineMode) {
          _user = state.session?.user;
          loadProfile();
          notifyListeners();
        }
      });
    } catch (_) {}
  }

  Future<void> loadProfile() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final uid = _user?.id ?? 'guest';
      _profilePicBase64 = prefs.getString('${uid}_profile_pic');
      _budgetLimit = prefs.getDouble('${uid}_budget_limit') ?? 15000.0;
      _currencySymbol = prefs.getString('${uid}_currency_symbol') ?? 'Rs';
      notifyListeners();
    } catch (_) {}
  }

  Future<void> updateProfilePic(String? base64) async {
    _profilePicBase64 = base64;
    notifyListeners();
    try {
      final prefs = await SharedPreferences.getInstance();
      final uid = _user?.id ?? 'guest';
      if (base64 != null) {
        await prefs.setString('${uid}_profile_pic', base64);
      } else {
        await prefs.remove('${uid}_profile_pic');
      }
    } catch (_) {}
  }

  Future<void> updateBudgetLimit(double limit) async {
    _budgetLimit = limit;
    notifyListeners();
    try {
      final prefs = await SharedPreferences.getInstance();
      final uid = _user?.id ?? 'guest';
      await prefs.setDouble('${uid}_budget_limit', limit);
    } catch (_) {}
  }

  Future<void> updateCurrencySymbol(String symbol) async {
    _currencySymbol = symbol;
    notifyListeners();
    try {
      final prefs = await SharedPreferences.getInstance();
      final uid = _user?.id ?? 'guest';
      await prefs.setString('${uid}_currency_symbol', symbol);
    } catch (_) {}
  }

  /// Activates offline demo mode with mock user details
  Future<bool> enableOfflineMode({required String email, String? username}) async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('use_offline_mode', true);
      await prefs.setString('offline_user_email', email);
      if (username != null) {
        await prefs.setString('offline_user_username', username);
      }

      SupabaseService.useOfflineMode = true;
      _user = User(
        id: 'offline_user_id',
        appMetadata: const {},
        userMetadata: {'username': username ?? 'Demo User'},
        aud: 'authenticated',
        createdAt: DateTime.now().toIso8601String(),
        email: email,
      );

      await loadProfile();
      _loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = 'Failed to enable offline mode: $e';
      _loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> signIn(String email, String password) async {
    if (SupabaseService.useOfflineMode) {
      return enableOfflineMode(email: email, username: email.split('@')[0]);
    }

    try {
      await SupabaseService.init();
      _listenToAuthChanges();
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      notifyListeners();
      return false;
    }

    return _run(() => _auth.signIn(email: email, password: password));
  }

  Future<bool> signUp(String email, String password, {String? username}) async {
    if (SupabaseService.useOfflineMode) {
      return enableOfflineMode(email: email, username: username ?? email.split('@')[0]);
    }

    try {
      await SupabaseService.init();
      _listenToAuthChanges();
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      notifyListeners();
      return false;
    }

    return _run(() async {
      await _auth.signUp(email: email, password: password, username: username);
      try {
        await _auth.signIn(email: email, password: password);
      } catch (_) {
        // Ignore sign-in failure if email confirmation is required,
        // so the sign-up success itself is still handled.
      }
    });
  }

  Future<bool> updateUsername(String username) async {
    if (SupabaseService.useOfflineMode) {
      try {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('offline_user_username', username);
        _user = User(
          id: 'offline_user_id',
          appMetadata: const {},
          userMetadata: {'username': username},
          aud: 'authenticated',
          createdAt: _user?.createdAt ?? DateTime.now().toIso8601String(),
          email: _user?.email ?? 'demo@example.com',
        );
        notifyListeners();
        return true;
      } catch (_) {
        return false;
      }
    }

    final success = await _run(() => _auth.updateUsername(username));
    if (success) {
      _user = _auth.currentUser;
      notifyListeners();
    }
    return success;
  }

  Future<void> signOut() async {
    if (SupabaseService.useOfflineMode) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('use_offline_mode', false);
      await prefs.remove('offline_user_email');
      await prefs.remove('offline_user_username');
      SupabaseService.useOfflineMode = false;
      _user = null;
      notifyListeners();
      return;
    }
    await _auth.signOut();
    _user = null;
    notifyListeners();
  }

  @override
  void dispose() {
    _authSubscription?.cancel();
    super.dispose();
  }

  /// Wraps an async auth action with loading + error handling.
  Future<bool> _run(Future<void> Function() action) async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      await action().timeout(const Duration(seconds: 15));
      _loading = false;
      notifyListeners();
      return true;
    } on TimeoutException {
      _error = 'Connection timed out. Please check your internet connection or use a VPN.';
    } on AuthException catch (e) {
      _error = e.message;
    } catch (e) {
      _error = 'Something went wrong. Please try again.';
    }
    _loading = false;
    notifyListeners();
    return false;
  }
}
