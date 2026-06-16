import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/category.dart';
import '../models/expense.dart';
import '../providers/auth_provider.dart';
import '../providers/expense_provider.dart';
import '../theme/app_theme.dart';
import '../utils/formatters.dart';
import '../widgets/category_tile.dart';

/// Redesigned premium category detail screen.
class CategoryDetailScreen extends StatefulWidget {
  final Category category;
  const CategoryDetailScreen({super.key, required this.category});

  @override
  State<CategoryDetailScreen> createState() => _CategoryDetailScreenState();
}

class _CategoryDetailScreenState extends State<CategoryDetailScreen> {
  List<Expense> _expenses = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      setState(() => _loading = true);
      final list =
          await context.read<ExpenseProvider>().expensesFor(widget.category.id);
      if (!mounted) return;
      setState(() {
        _expenses = list;
        _loading = false;
      });
    } catch (e, stack) {
      debugPrint('Error loading category expenses: $e\n$stack');
      if (!mounted) return;
      setState(() => _loading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to load details: $e'),
          backgroundColor: AppColors.danger,
        ),
      );
    }
  }

  double get _subtotal =>
      _expenses.where((e) => e.amount > 0.01).fold(0.0, (sum, e) => sum + e.amount);

  Future<void> _deleteExpense(Expense e) async {
    final symbol = context.read<AuthProvider>().currencySymbol;
    final ok = await _confirm('Delete this entry?',
        '${Formatters.currency(e.amount, symbol: symbol)} will be removed.');
    if (ok != true) return;
    await context.read<ExpenseProvider>().deleteExpense(e.id);
    await _load();
  }

  Future<void> _deleteCategory() async {
    final ok = await _confirm(
      'Delete "${widget.category.name}"?',
      'This will remove the category and all its entries.',
    );
    if (ok != true) return;
    await context.read<ExpenseProvider>().deleteCategory(widget.category.id);
    if (mounted) Navigator.of(context).pop();
  }

  Future<void> _renameCategory() async {
    final ctrl = TextEditingController(text: widget.category.name);
    final name = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Rename Category'),
        content: TextField(
          controller: ctrl, 
          autofocus: true,
          decoration: const InputDecoration(labelText: 'Category Name'),
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel')),
          ElevatedButton(
              onPressed: () => Navigator.pop(ctx, ctrl.text.trim()),
              style: ElevatedButton.styleFrom(minimumSize: const Size(80, 40)),
              child: const Text('Save')),
        ],
      ),
    );
    if (name != null && name.isNotEmpty) {
      await context
          .read<ExpenseProvider>()
          .renameCategory(widget.category.id, name);
      if (mounted) Navigator.of(context).pop();
    }
  }

  Future<bool?> _confirm(String title, String message) {
    return showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.danger,
              minimumSize: const Size(80, 40),
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  void _viewFullImage(String base64, String? noteText) {
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        backgroundColor: Colors.transparent,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
              ),
              clipBehavior: Clip.antiAlias,
              child: Image.memory(
                base64Decode(base64),
                fit: BoxFit.contain,
              ),
            ),
            if (noteText != null && noteText.trim().isNotEmpty) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.85),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  noteText,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ],
            const SizedBox(height: 16),
            IconButton(
              icon: const Icon(Icons.close_rounded, color: Colors.white, size: 36),
              onPressed: () => Navigator.pop(ctx),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final currencySymbol = auth.currencySymbol;
    // Generate a beautiful header gradient based on the category index color
    final categories = context.watch<ExpenseProvider>().categories;
    final catIndex = categories.indexWhere((c) => c.id == widget.category.id);
    final categoryColor = AppColors.forIndex(catIndex >= 0 ? catIndex : 0);

    final recordPics = _expenses.where((e) => e.imageBase64 != null && e.amount == 0.0).toList();
    final actualExpenses = _expenses.where((e) => e.amount > 0.0 || (e.amount == 0.0 && e.imageBase64 == null)).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FC),
      appBar: AppBar(
        title: Text(widget.category.name),
        backgroundColor: Colors.transparent,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: const TextStyle(
          color: AppColors.textPrimary,
          fontSize: 20,
          fontWeight: FontWeight.w800,
        ),
        iconTheme: const IconThemeData(color: AppColors.textPrimary),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 20),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert_rounded),
            onSelected: (v) {
              if (v == 'rename') _renameCategory();
              if (v == 'delete') _deleteCategory();
            },
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            itemBuilder: (_) => const [
              PopupMenuItem(
                value: 'rename', 
                child: Row(
                  children: [
                    Icon(Icons.edit_rounded, size: 20, color: AppColors.textSecondary),
                    SizedBox(width: 8),
                    Text('Rename Category'),
                  ],
                ),
              ),
              PopupMenuItem(
                value: 'delete', 
                child: Row(
                  children: [
                    Icon(Icons.delete_rounded, size: 20, color: AppColors.danger),
                    SizedBox(width: 8),
                    Text('Delete Category', style: TextStyle(color: AppColors.danger)),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : OrientationBuilder(
              builder: (context, orientation) {
                final isPortrait = orientation == Orientation.portrait;
                    final topSection = Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Top Category Summary Card
                        Padding(
                          padding: EdgeInsets.all(isPortrait ? 16 : 8),
                          child: Container(
                            width: double.infinity,
                            padding: EdgeInsets.all(isPortrait ? 22 : 14),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          categoryColor.withOpacity(0.9),
                          categoryColor,
                        ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: categoryColor.withOpacity(0.25),
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
                              'TOTAL SPENT ON ${widget.category.name.toUpperCase()}',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                color: Colors.white.withOpacity(0.8),
                                letterSpacing: 1.5,
                              ),
                            ),
                            Icon(
                              iconFor(widget.category.icon),
                              color: Colors.white.withOpacity(0.9),
                              size: 22,
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Text(
                          Formatters.currency(_subtotal, symbol: currencySymbol),
                          style: TextStyle(
                            fontSize: isPortrait ? 34 : 26,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                          ),
                        ),
                        SizedBox(height: isPortrait ? 12 : 4),
                        Text(
                          'Transactions: ${_expenses.length}',
                          style: const TextStyle(
                            fontSize: 13,
                            color: Colors.white70,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                if (recordPics.isNotEmpty)
                  _buildRecordPicsRow(recordPics, isPortrait),

                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 18, vertical: isPortrait ? 8 : 4),
                  child: Text(
                    'Transaction History',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ),

                  ],
                );

                Widget listWidget;
                if (actualExpenses.isEmpty) {
                  listWidget = const Center(
                          child: Padding(
                            padding: EdgeInsets.all(32),
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.receipt_long_rounded, size: 64, color: Colors.black12),
                                SizedBox(height: 16),
                                Text(
                                  'No entries yet in this category.',
                                  style: TextStyle(
                                      fontSize: 16, color: AppColors.textSecondary),
                                  textAlign: TextAlign.center,
                                ),
                              ],
                            ),
                          ),
                        );
                } else {
                  listWidget = ListView.separated(
                    shrinkWrap: !isPortrait,
                    physics: isPortrait ? const AlwaysScrollableScrollPhysics() : const NeverScrollableScrollPhysics(),
                    padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
                          itemCount: actualExpenses.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 10),
                          itemBuilder: (context, i) {
                            final e = actualExpenses[i];
                            return Dismissible(
                              key: ValueKey(e.id),
                              direction: DismissDirection.endToStart,
                              confirmDismiss: (_) async {
                                await _deleteExpense(e);
                                return false; // we reload manually
                              },
                              background: Container(
                                alignment: Alignment.centerRight,
                                padding: const EdgeInsets.only(right: 20),
                                decoration: BoxDecoration(
                                  color: AppColors.danger,
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                child: const Icon(Icons.delete_sweep_rounded, color: Colors.white, size: 28),
                              ),
                              child: Container(
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(16),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.02),
                                      blurRadius: 8,
                                      offset: const Offset(0, 3),
                                    ),
                                  ],
                                  border: Border.all(color: const Color(0xFFEBEFF5)),
                                ),
                                child: ListTile(
                                  contentPadding: const EdgeInsets.symmetric(
                                      horizontal: 16, vertical: 8),
                                  leading: e.imageBase64 != null
                                      ? GestureDetector(
                                          onTap: () => _viewFullImage(e.imageBase64!, e.noteText),
                                          child: Hero(
                                            tag: e.id,
                                            child: Container(
                                              width: 44,
                                              height: 44,
                                              decoration: BoxDecoration(
                                                borderRadius: BorderRadius.circular(12),
                                                image: DecorationImage(
                                                  image: MemoryImage(base64Decode(e.imageBase64!)),
                                                  fit: BoxFit.cover,
                                                ),
                                                border: Border.all(color: const Color(0xFFEBEFF5)),
                                              ),
                                            ),
                                          ),
                                        )
                                      : Container(
                                          width: 44,
                                          height: 44,
                                          decoration: BoxDecoration(
                                            color: const Color(0xFFF0F4F8),
                                            borderRadius: BorderRadius.circular(12),
                                          ),
                                          child: const Icon(Icons.receipt_rounded, color: AppColors.textSecondary, size: 20),
                                        ),
                                  title: Text(
                                    Formatters.currency(e.amount, symbol: currencySymbol),
                                    style: const TextStyle(
                                        fontSize: 18, 
                                        fontWeight: FontWeight.bold,
                                        color: AppColors.textPrimary,
                                    ),
                                  ),
                                  subtitle: Text(
                                    e.noteText?.isNotEmpty == true
                                        ? '${e.noteText}  •  ${Formatters.date(e.spentAt)}'
                                        : Formatters.date(e.spentAt),
                                    style: const TextStyle(
                                        fontSize: 13,
                                        color: AppColors.textSecondary,
                                        fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                  trailing: const Icon(Icons.swipe_left_rounded, size: 16, color: Colors.black12),
                                ),
                              ),
                            );
                          },
                        );
                }

                if (isPortrait) {
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      topSection,
                      Expanded(child: listWidget),
                    ],
                  );
                } else {
                  return SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        topSection,
                        listWidget,
                      ],
                    ),
                  );
                }
              },
            ),
    );
  }

  Widget _buildRecordPicsRow(List<Expense> pics, bool isPortrait) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 10),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Record Gallery / Khata Pics',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  '${pics.length} pics',
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    color: AppColors.primary,
                  ),
                ),
              ),
            ],
          ),
        ),
        SizedBox(
          height: isPortrait ? 115 : 85,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: pics.length,
            itemBuilder: (context, index) {
              final e = pics[index];
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 6),
                child: GestureDetector(
                  onTap: () => _viewFullImage(e.imageBase64!, e.noteText),
                  child: Container(
                    width: isPortrait ? 115 : 85,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFEBEFF5), width: 1.5),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.02),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Stack(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(14),
                          child: Image.memory(
                            base64Decode(e.imageBase64!),
                            width: double.infinity,
                            height: double.infinity,
                            fit: BoxFit.cover,
                          ),
                        ),
                        // Delete button overlay
                        Positioned(
                          top: 4,
                          right: 4,
                          child: GestureDetector(
                            onTap: () => _deleteExpense(e),
                            child: Container(
                              padding: const EdgeInsets.all(4),
                              decoration: const BoxDecoration(
                                color: Colors.black54,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.close_rounded,
                                size: 14,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                        // Text note overlay if present
                        if (e.noteText?.isNotEmpty == true)
                          Positioned(
                            bottom: 0,
                            left: 0,
                            right: 0,
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 6),
                              decoration: const BoxDecoration(
                                color: Colors.black54,
                                borderRadius: BorderRadius.only(
                                  bottomLeft: Radius.circular(14),
                                  bottomRight: Radius.circular(14),
                                ),
                              ),
                              child: Text(
                                e.noteText!,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  fontSize: 10,
                                  color: Colors.white,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 12),
      ],
    );
  }
}

