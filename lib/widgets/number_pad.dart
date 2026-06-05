import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// A premium, tactile number pad for entering amounts.
class NumberPad extends StatelessWidget {
  final String value;
  final ValueChanged<String> onChanged;

  const NumberPad({super.key, required this.value, required this.onChanged});

  void _tap(String key) {
    if (key == 'back') {
      if (value.isNotEmpty) {
        onChanged(value.substring(0, value.length - 1));
      }
      return;
    }
    // Prevent absurdly long numbers.
    if (value.length >= 9) return;
    // Avoid leading zeros.
    if (value == '0') {
      onChanged(key);
    } else {
      onChanged(value + key);
    }
  }

  @override
  Widget build(BuildContext context) {
    final keys = [
      '1', '2', '3',
      '4', '5', '6',
      '7', '8', '9',
      'clear', '0', 'back',
    ];

    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: const Color(0xFFF4F6F9),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFE5E9F0)),
      ),
      child: GridView.count(
        crossAxisCount: 3,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        mainAxisSpacing: 10,
        crossAxisSpacing: 10,
        childAspectRatio: 1.5,
        children: keys.map((k) {
          if (k == 'clear') {
            return _PadButton(
              backgroundColor: AppColors.danger.withOpacity(0.08),
              foregroundColor: AppColors.danger,
              onTap: () => onChanged(''),
              child: const Text(
                'C',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
              ),
            );
          }
          if (k == 'back') {
            return _PadButton(
              backgroundColor: const Color(0xFFE2E7F0),
              foregroundColor: AppColors.textPrimary,
              onTap: () => _tap('back'),
              child: const Icon(Icons.backspace_rounded, size: 22),
            );
          }
          return _PadButton(
            backgroundColor: Colors.white,
            foregroundColor: AppColors.textPrimary,
            onTap: () => _tap(k),
            child: Text(
              k,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w700,
                letterSpacing: -0.5,
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

class _PadButton extends StatelessWidget {
  final Widget child;
  final VoidCallback onTap;
  final Color backgroundColor;
  final Color foregroundColor;

  const _PadButton({
    required this.child,
    required this.onTap,
    required this.backgroundColor,
    required this.foregroundColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(16),
        boxShadow: backgroundColor == Colors.white
            ? [
                BoxShadow(
                  color: Colors.black.withOpacity(0.04),
                  blurRadius: 6,
                  offset: const Offset(0, 3),
                ),
              ]
            : null,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: onTap,
          splashColor: foregroundColor.withOpacity(0.1),
          highlightColor: foregroundColor.withOpacity(0.05),
          child: Center(
            child: DefaultTextStyle.merge(
              style: TextStyle(color: foregroundColor),
              child: IconTheme.merge(
                data: IconThemeData(color: foregroundColor),
                child: child,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

