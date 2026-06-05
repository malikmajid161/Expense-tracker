import 'package:flutter/material.dart';

/// Central place for all colors used in the app.
/// Soft, friendly colors that are easy on aged eyes.
class AppColors {
  static const Color primary = Color(0xFF1D9E75); // green
  static const Color primaryDark = Color(0xFF0F6E56);
  static const Color background = Color(0xFFF7F6F2);
  static const Color card = Colors.white;
  static const Color textPrimary = Color(0xFF1A1A1A);
  static const Color textSecondary = Color(0xFF6B6B6B);
  static const Color danger = Color(0xFFE24B4A);
  static const Color totalBar = Color(0xFFE6F1FB);
  static const Color totalText = Color(0xFF0C447C);

  /// A palette assigned to categories so each one has its own color.
  static const List<Color> categoryColors = [
    Color(0xFF1D9E75), // teal/green
    Color(0xFF378ADD), // blue
    Color(0xFFBA7517), // amber
    Color(0xFFD4537E), // pink
    Color(0xFF7F77DD), // purple
    Color(0xFFD85A30), // coral
    Color(0xFF639922), // green
    Color(0xFFE24B4A), // red
  ];

  static Color forIndex(int index) =>
      categoryColors[index % categoryColors.length];
}

class AppTheme {
  static ThemeData get light {
    final base = ThemeData.light(useMaterial3: true);
    return base.copyWith(
      scaffoldBackgroundColor: AppColors.background,
      colorScheme: base.colorScheme.copyWith(
        primary: AppColors.primary,
        secondary: AppColors.primaryDark,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          color: Colors.white,
          fontSize: 22,
          fontWeight: FontWeight.w600,
        ),
      ),
      // Larger text everywhere for readability.
      textTheme: base.textTheme.copyWith(
        bodyLarge: const TextStyle(fontSize: 18, color: AppColors.textPrimary),
        bodyMedium: const TextStyle(fontSize: 16, color: AppColors.textPrimary),
        titleLarge: const TextStyle(
          fontSize: 22,
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimary,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          minimumSize: const Size.fromHeight(56),
          textStyle: const TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFD3D1C7)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFD3D1C7)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
      ),
    );
  }
}
