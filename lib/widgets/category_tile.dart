import 'package:flutter/material.dart';
import '../models/category.dart';
import '../theme/app_theme.dart';
import '../utils/formatters.dart';

/// Maps stored icon names to Material icons.
IconData iconFor(String key) {
  switch (key) {
    case 'cart':
    case 'grocery':
      return Icons.shopping_cart_rounded;
    case 'home':
    case 'rent':
      return Icons.home_rounded;
    case 'fuel':
    case 'gas':
      return Icons.local_gas_station_rounded;
    case 'food':
      return Icons.restaurant_rounded;
    case 'medical':
      return Icons.local_hospital_rounded;
    case 'bills':
      return Icons.receipt_long_rounded;
    case 'camera':
    case 'photo':
    case 'photos':
      return Icons.camera_alt_rounded;
    default:
      return Icons.account_balance_wallet_rounded;
  }
}

/// A single tappable account row showing icon, name, percentage of spending, progress bar, and its total.
class CategoryTile extends StatelessWidget {
  final Category category;
  final int colorIndex;
  final double grandTotal;
  final String currencySymbol;
  final VoidCallback onTap;

  const CategoryTile({
    super.key,
    required this.category,
    required this.colorIndex,
    required this.grandTotal,
    this.currencySymbol = 'Rs',
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final color = AppColors.forIndex(colorIndex);
    final percent = grandTotal > 0 ? (category.total / grandTotal) : 0.0;
    final percentString = (percent * 100).toStringAsFixed(1);

    return Container(
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.025),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
        border: Border.all(color: const Color(0xFFEBEFF5)),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(18),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: color.withOpacity(0.12),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(iconFor(category.icon), color: color, size: 22),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            category.name,
                            style: const TextStyle(
                              fontSize: 17,
                              fontWeight: FontWeight.bold,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '$percentString% of total spending',
                            style: const TextStyle(
                              fontSize: 13,
                              color: AppColors.textSecondary,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          Formatters.currency(category.total, symbol: currencySymbol),
                          style: const TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w800,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        const Row(
                          children: [
                            Text(
                              'View details',
                              style: TextStyle(
                                fontSize: 12,
                                color: AppColors.primary,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Icon(Icons.chevron_right, size: 14, color: AppColors.primary),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
                if (grandTotal > 0) ...[
                  const SizedBox(height: 12),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: percent,
                      backgroundColor: const Color(0xFFEDF2F7),
                      valueColor: AlwaysStoppedAnimation<Color>(color),
                      minHeight: 6,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

