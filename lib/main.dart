import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'providers/auth_provider.dart';
import 'providers/expense_provider.dart';
import 'screens/auth_gate.dart';
import 'services/supabase_service.dart';
import 'theme/app_theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Load .env, then initialize Supabase. If anything fails (e.g. the
  // credentials are still placeholders), show a friendly setup screen
  // instead of a blank crash, with an option to use offline mode.
  String? startupError;
  try {
    await dotenv.load(fileName: '.env');
    final prefs = await SharedPreferences.getInstance();
    final isOffline = prefs.getBool('use_offline_mode') ?? false;
    SupabaseService.useOfflineMode = isOffline;

    if (!isOffline) {
      await SupabaseService.init().timeout(
        const Duration(seconds: 10),
      );
    }
  } catch (e) {
    startupError = e.toString().replaceAll('Exception: ', '');
  }

  runApp(MyApp(startupError: startupError));
}

class MyApp extends StatefulWidget {
  final String? startupError;
  const MyApp({super.key, this.startupError});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  String? _startupError;

  @override
  void initState() {
    super.initState();
    _startupError = widget.startupError;
  }

  Future<void> _enableOfflineMode() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('use_offline_mode', true);
      SupabaseService.useOfflineMode = true;

      setState(() {
        _startupError = null;
      });
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    if (_startupError != null) {
      return MaterialApp(
        title: 'Expense Tracker',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light,
        builder: (context, child) => MobileDeviceWrapper(child: child ?? const SizedBox()),
        home: _SetupErrorScreen(
          message: _startupError!,
          onContinueOffline: _enableOfflineMode,
        ),
      );
    }

    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => ExpenseProvider()),
      ],
      child: MaterialApp(
        title: 'Expense Tracker',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light,
        builder: (context, child) => MobileDeviceWrapper(child: child ?? const SizedBox()),
        home: const AuthGate(),
      ),
    );
  }
}

/// Simulated Mobile Device Wrapper for web/desktop viewports.
class MobileDeviceWrapper extends StatelessWidget {
  final Widget child;
  const MobileDeviceWrapper({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth > 500) {
          final screenHeight = MediaQuery.of(context).size.height;
          // Ensure wrapper height fits small laptop or tablet screen viewports cleanly
          final wrapperHeight = (screenHeight - 40).clamp(400.0, 840.0);
          final showNotch = wrapperHeight > 600;

          return Scaffold(
            backgroundColor: const Color(0xFFE5EBF5),
            body: Center(
              child: Container(
                width: 410,
                height: wrapperHeight,
                margin: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(showNotch ? 44 : 24),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.18),
                      blurRadius: 36,
                      offset: const Offset(0, 16),
                    ),
                  ],
                  border: Border.all(
                    color: const Color(0xFF1E2022),
                    width: showNotch ? 12 : 6,
                  ),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(showNotch ? 32 : 18),
                  child: Stack(
                    children: [
                      // Child app view with safe area top padding overridden for notch
                      Positioned.fill(
                        child: MediaQuery(
                          data: MediaQuery.of(context).copyWith(
                            padding: EdgeInsets.only(top: showNotch ? 40 : 12),
                          ),
                          child: child,
                        ),
                      ),

                      // Camera Punch Hole / Dynamic Island representation
                      if (showNotch)
                        Align(
                          alignment: Alignment.topCenter,
                          child: Container(
                            margin: const EdgeInsets.only(top: 10),
                            width: 100,
                            height: 24,
                            decoration: BoxDecoration(
                              color: const Color(0xFF1E2022),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                Container(
                                  margin: const EdgeInsets.only(right: 12),
                                  width: 7,
                                  height: 7,
                                  decoration: const BoxDecoration(
                                    color: Color(0xFF0C0E10),
                                    shape: BoxShape.circle,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ),
          );
        }
        return child;
      },
    );
  }
}

/// Shown when Supabase credentials are missing or wrong.
class _SetupErrorScreen extends StatelessWidget {
  final String message;
  final VoidCallback onContinueOffline;

  const _SetupErrorScreen({
    required this.message,
    required this.onContinueOffline,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(28),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.settings, size: 64, color: AppColors.danger),
              const SizedBox(height: 16),
              const Text(
                'Setup needed',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 12),
              Text(
                message,
                textAlign: TextAlign.center,
                style: const TextStyle(
                    fontSize: 16, color: AppColors.textSecondary),
              ),
              const SizedBox(height: 20),
              const Text(
                'Open the .env file, paste your Supabase URL and anon key, '
                'then restart the app.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 15),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: onContinueOffline,
                icon: const Icon(Icons.wifi_off),
                label: const Text('Continue in Offline Mode'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
