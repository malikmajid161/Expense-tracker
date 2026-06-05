import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/category.dart';
import '../models/expense.dart';
import 'supabase_service.dart';

/// All read/write operations for categories and expenses.
class DatabaseService {
  final SupabaseClient _client = SupabaseService.client;

  String get _uid => _client.auth.currentUser!.id;

  // ───────────── Categories ─────────────

  /// Loads all categories for the current user, each with its total spent.
  Future<List<Category>> getCategoriesWithTotals() async {
    final catRows = await _client
        .from('categories')
        .select()
        .order('created_at', ascending: true);

    final expRows =
        await _client.from('expenses').select('category_id, amount');

    // Sum expenses per category in memory.
    final Map<String, double> totals = {};
    for (final row in (expRows as List)) {
      final cid = row['category_id'] as String;
      final amt = (row['amount'] as num).toDouble();
      if (amt > 0.01) {
        totals[cid] = (totals[cid] ?? 0) + amt;
      }
    }

    return (catRows as List)
        .map((m) => Category.fromMap(
              m as Map<String, dynamic>,
              total: totals[m['id']] ?? 0,
            ))
        .toList();
  }

  /// Creates a category and returns it.
  Future<Category> addCategory(String name, {String icon = 'wallet'}) async {
    final inserted = await _client
        .from('categories')
        .insert({'name': name, 'icon': icon, 'user_id': _uid})
        .select()
        .single();
    return Category.fromMap(inserted);
  }

  /// Finds a category by name (case-insensitive) or creates a new one.
  Future<Category> findOrCreateCategory(String name) async {
    final existing = await _client
        .from('categories')
        .select()
        .ilike('name', name.trim())
        .maybeSingle();

    if (existing != null) {
      return Category.fromMap(existing);
    }
    return addCategory(name.trim());
  }

  Future<void> renameCategory(String id, String newName) async {
    await _client.from('categories').update({'name': newName}).eq('id', id);
  }

  Future<void> deleteCategory(String id) async {
    // Expenses are removed automatically via ON DELETE CASCADE.
    await _client.from('categories').delete().eq('id', id);
  }

  // ───────────── Expenses ─────────────

  Future<List<Expense>> getExpensesForCategory(String categoryId) async {
    final rows = await _client
        .from('expenses')
        .select()
        .eq('category_id', categoryId)
        .order('spent_at', ascending: false);

    return (rows as List)
        .map((m) => Expense.fromMap(m as Map<String, dynamic>))
        .toList();
  }

  Future<void> addExpense({
    required String categoryId,
    required double amount,
    String? note,
    DateTime? spentAt,
  }) async {
    await _client.from('expenses').insert({
      'category_id': categoryId,
      'amount': amount,
      'note': note,
      'spent_at': (spentAt ?? DateTime.now()).toIso8601String(),
      'user_id': _uid,
    });
  }

  Future<void> deleteExpense(String id) async {
    await _client.from('expenses').delete().eq('id', id);
  }

  /// Grand total across all categories.
  Future<double> getGrandTotal() async {
    final rows = await _client.from('expenses').select('amount');
    double total = 0;
    for (final row in (rows as List)) {
      final amt = (row['amount'] as num).toDouble();
      if (amt > 0.01) {
        total += amt;
      }
    }
    return total;
  }
}
