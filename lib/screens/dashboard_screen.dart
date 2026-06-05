import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/expense_provider.dart';
import '../theme/app_theme.dart';
import '../utils/formatters.dart';
import '../widgets/category_tile.dart';
import 'add_expense_screen.dart';
import 'category_detail_screen.dart';
import 'profile_screen.dart';

/// Redesigned premium dashboard screen.
class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ExpenseProvider>().loadDashboard();
    });
  }

  Future<void> _openAddExpense() async {
    await Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const AddExpenseScreen()),
    );
    if (mounted) context.read<ExpenseProvider>().loadDashboard();
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<ExpenseProvider>();
    final auth = context.watch<AuthProvider>();
    
    final email = auth.user?.email ?? '';
    final username = auth.user?.userMetadata?['username'] as String? ?? 
        (email.isNotEmpty ? email.split('@')[0] : 'User');

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FC),
      appBar: AppBar(
        title: const Text('My Khata'),
        elevation: 0,
        backgroundColor: Colors.transparent,
        foregroundColor: AppColors.textPrimary,
        centerTitle: false,
        titleTextStyle: const TextStyle(
          color: AppColors.textPrimary,
          fontSize: 22,
          fontWeight: FontWeight.w800,
        ),
        actions: [
          GestureDetector(
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const ProfileScreen()),
              );
            },
            child: Container(
              margin: const EdgeInsets.only(right: 16, top: 8, bottom: 8),
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white,
                border: Border.all(color: AppColors.primary.withOpacity(0.2), width: 1.5),
              ),
              child: ClipOval(
                child: auth.profilePicBase64 != null
                    ? Image.memory(
                        base64Decode(auth.profilePicBase64!),
                        fit: BoxFit.cover,
                      )
                    : Container(
                        color: AppColors.primary.withOpacity(0.1),
                        child: Center(
                          child: Text(
                            username.isNotEmpty ? username[0].toUpperCase() : 'U',
                            style: const TextStyle(
                              color: AppColors.primary,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                        ),
                      ),
              ),
            ),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => provider.loadDashboard(),
        color: AppColors.primary,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Greeting & Balance Header Card
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Welcome back,',
                    style: TextStyle(
                      fontSize: 15,
                      color: AppColors.textSecondary.withOpacity(0.8),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Text(
                    username,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                      color: AppColors.textPrimary,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 18),
                  
                  // Gradient Total Spending Card
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(22),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [AppColors.primaryDark, AppColors.primary],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withOpacity(0.25),
                          blurRadius: 15,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'TOTAL SPENDING',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w800,
                                color: Colors.white.withOpacity(0.75),
                                letterSpacing: 1.5,
                              ),
                            ),
                            const Icon(
                              Icons.account_balance_wallet_rounded,
                              color: Colors.white70,
                              size: 20,
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Text(
                          Formatters.currency(provider.grandTotal, symbol: auth.currencySymbol),
                          style: const TextStyle(
                            fontSize: 36,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                            letterSpacing: -0.5,
                          ),
                        ),
                        const SizedBox(height: 18),
                        
                        // Budget limit progress row
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Budget Limit: ${Formatters.currency(auth.budgetLimit, symbol: auth.currencySymbol)}',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.white.withOpacity(0.85),
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                Text(
                                  '${((provider.grandTotal / auth.budgetLimit) * 100).toStringAsFixed(0)}% used',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.white.withOpacity(0.85),
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            ClipRRect(
                              borderRadius: BorderRadius.circular(4),
                              child: LinearProgressIndicator(
                                value: (provider.grandTotal / auth.budgetLimit).clamp(0.0, 1.0),
                                backgroundColor: Colors.white.withOpacity(0.18),
                                valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
                                minHeight: 6,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            'Active categories: ${provider.categories.length}',
                            style: const TextStyle(
                              fontSize: 13,
                              color: Colors.white,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            
            // List title
            const Padding(
              padding: EdgeInsets.fromLTRB(18, 12, 18, 8),
              child: Text(
                'Spending Categories',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                ),
              ),
            ),
            
            // Body categories list
            Expanded(
              child: _buildBody(provider),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openAddExpense,
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 6,
        icon: const Icon(Icons.add_rounded, size: 24),
        label: const Text(
          'Add Expense',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  Widget _buildBody(ExpenseProvider provider) {
    final auth = context.watch<AuthProvider>();
    if (provider.loading && provider.categories.isEmpty) {
      return const Center(child: CircularProgressIndicator(color: AppColors.primary));
    }

    if (provider.error != null && provider.categories.isEmpty) {
      return _MessageView(
        icon: Icons.wifi_off_rounded,
        title: 'Could not load dashboard',
        message: provider.error!,
        actionLabel: 'Try again',
        onAction: () => provider.loadDashboard(),
      );
    }

    if (provider.categories.isEmpty) {
      return const _MessageView(
        icon: Icons.add_chart_rounded,
        title: 'No spending accounts',
        message: 'Tap "Add Expense" to record your first transaction.',
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 4, 16, 80),
      itemCount: provider.categories.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final cat = provider.categories[index];
        return CategoryTile(
          category: cat,
          colorIndex: index,
          grandTotal: provider.grandTotal,
          currencySymbol: auth.currencySymbol,
          onTap: () async {
            await Navigator.of(context).push(
              MaterialPageRoute(
                builder: (_) => CategoryDetailScreen(category: cat),
              ),
            );
            if (mounted) provider.loadDashboard();
          },
        );
      },
    );
  }
}

/// Generic centered message view for empty / error states.
class _MessageView extends StatelessWidget {
  final IconData icon;
  final String title;
  final String message;
  final String? actionLabel;
  final VoidCallback? onAction;

  const _MessageView({
    required this.icon,
    required this.title,
    required this.message,
    this.actionLabel,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 40),
      children: [
        Icon(icon, size: 64, color: AppColors.textSecondary.withOpacity(0.5)),
        const SizedBox(height: 16),
        Text(
          title,
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          message,
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 15,
            color: AppColors.textSecondary,
          ),
        ),
        if (actionLabel != null) ...[
          const SizedBox(height: 24),
          Center(
            child: OutlinedButton.icon(
              onPressed: onAction,
              icon: const Icon(Icons.refresh_rounded, size: 18),
              label: Text(actionLabel!),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.primary,
                side: const BorderSide(color: AppColors.primary),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
          ),
        ],
      ],
    );
  }
}
