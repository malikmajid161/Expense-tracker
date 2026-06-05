import 'package:intl/intl.dart';

/// Formatting helpers used across the app.
class Formatters {
  /// Formats a number as "Rs 12,500".
  static String currency(num amount, {String symbol = 'Rs'}) {
    final f = NumberFormat.decimalPattern('en_PK');
    return '$symbol ${f.format(amount)}';
  }

  /// Short readable date, e.g. "4 Jun 2026".
  static String date(DateTime d) => DateFormat('d MMM yyyy').format(d);

  /// Date + time, e.g. "4 Jun 2026, 3:40 PM".
  static String dateTime(DateTime d) =>
      DateFormat('d MMM yyyy, h:mm a').format(d);
}
