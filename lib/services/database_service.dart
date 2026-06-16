import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/category.dart';
import '../models/expense.dart';
import 'supabase_service.dart';

/// All read/write operations for categories and expenses.
/// Supports both Supabase (online) and SharedPreferences (offline/demo mode).
class DatabaseService {
  final SupabaseClient _client = SupabaseService.client;

  String get _uid {
    if (SupabaseService.useOfflineMode) {
      return 'offline_user_id';
    }
    return _client.auth.currentUser!.id;
  }

  // ───────────── Offline Database Helpers ─────────────
  static const String _categoriesKey = 'offline_categories';
  static const String _expensesKey = 'offline_expenses';

  Future<List<Category>> _loadOfflineCategories() async {
    final prefs = await SharedPreferences.getInstance();
    final data = prefs.getString(_categoriesKey);
    if (data == null) return [];
    final list = jsonDecode(data) as List;
    return list.map((item) => Category.fromMap(item as Map<String, dynamic>)).toList();
  }

  Future<void> _saveOfflineCategories(List<Category> categories) async {
    final prefs = await SharedPreferences.getInstance();
    final data = jsonEncode(categories.map((c) => c.toMap()).toList());
    await prefs.setString(_categoriesKey, data);
  }

  Future<List<Expense>> _loadOfflineExpenses() async {
    final prefs = await SharedPreferences.getInstance();
    final data = prefs.getString(_expensesKey);
    if (data == null) return [];
    final list = jsonDecode(data) as List;
    return list.map((item) => Expense.fromMap(item as Map<String, dynamic>)).toList();
  }

  Future<void> _saveOfflineExpenses(List<Expense> expenses) async {
    final prefs = await SharedPreferences.getInstance();
    final data = jsonEncode(expenses.map((e) => e.toMap()).toList());
    await prefs.setString(_expensesKey, data);
  }

  // ───────────── Categories ─────────────

  /// Loads all categories for the current user, each with its total spent.
  Future<List<Category>> getCategoriesWithTotals() async {
    if (SupabaseService.useOfflineMode) {
      return _getOfflineCategoriesWithTotals();
    }

    try {
      final catRows = await _client
          .from('categories')
          .select()
          .order('created_at', ascending: true)
          .timeout(const Duration(seconds: 10));

      final expRows = await _client
          .from('expenses')
          .select('category_id, amount')
          .timeout(const Duration(seconds: 10));

      // Sum expenses per category in memory.
      final Map<String, double> totals = {};
      for (final row in (expRows as List)) {
        final cid = row['category_id'] as String;
        final amt = (row['amount'] as num).toDouble();
        if (amt > 0.01) {
          totals[cid] = (totals[cid] ?? 0) + amt;
        }
      }

      final categories = (catRows as List)
          .map((m) => Category.fromMap(
                m as Map<String, dynamic>,
                total: totals[m['id']] ?? 0,
              ))
          .toList();
          
      await _saveOfflineCategories(categories);
      return categories;
    } catch (e) {
      return _getOfflineCategoriesWithTotals();
    }
  }
  
  Future<List<Category>> _getOfflineCategoriesWithTotals() async {
    final categories = await _loadOfflineCategories();
    final expenses = await _loadOfflineExpenses();

    final Map<String, double> totals = {};
    for (final exp in expenses) {
      if (exp.amount > 0.01) {
        totals[exp.categoryId] = (totals[exp.categoryId] ?? 0) + exp.amount;
      }
    }

    return categories.map((c) => c.copyWith(total: totals[c.id] ?? 0)).toList();
  }

  /// Creates a category and returns it.
  Future<Category> addCategory(String name, {String icon = 'wallet'}) async {
    if (SupabaseService.useOfflineMode) {
      return _addOfflineCategory(name, icon);
    }

    try {
      final inserted = await _client
          .from('categories')
          .insert({'name': name, 'icon': icon, 'user_id': _uid})
          .select()
          .single()
          .timeout(const Duration(seconds: 10));
          
      final newCat = Category.fromMap(inserted);
      final categories = await _loadOfflineCategories();
      categories.add(newCat);
      await _saveOfflineCategories(categories);
      
      return newCat;
    } catch (e) {
      return _addOfflineCategory(name, icon);
    }
  }
  
  Future<Category> _addOfflineCategory(String name, String icon) async {
    final categories = await _loadOfflineCategories();
    final newCat = Category(
      id: DateTime.now().microsecondsSinceEpoch.toString(),
      userId: _uid,
      name: name,
      icon: icon,
      createdAt: DateTime.now(),
    );
    categories.add(newCat);
    await _saveOfflineCategories(categories);
    return newCat;
  }

  /// Finds a category by name (case-insensitive) or creates a new one.
  Future<Category> findOrCreateCategory(String name) async {
    if (SupabaseService.useOfflineMode) {
      return _findOrCreateOfflineCategory(name);
    }

    try {
      final existing = await _client
          .from('categories')
          .select()
          .ilike('name', name.trim())
          .maybeSingle()
          .timeout(const Duration(seconds: 10));

      if (existing != null) {
        return Category.fromMap(existing);
      }
      return addCategory(name.trim());
    } catch (e) {
      return _findOrCreateOfflineCategory(name);
    }
  }
  
  Future<Category> _findOrCreateOfflineCategory(String name) async {
    final categories = await _loadOfflineCategories();
    for (final cat in categories) {
      if (cat.name.trim().toLowerCase() == name.trim().toLowerCase()) {
        return cat;
      }
    }
    return _addOfflineCategory(name.trim(), 'wallet');
  }

  Future<void> renameCategory(String id, String newName) async {
    if (SupabaseService.useOfflineMode) {
      return _renameOfflineCategory(id, newName);
    }

    try {
      await _client.from('categories').update({'name': newName}).eq('id', id).timeout(const Duration(seconds: 10));
      await _renameOfflineCategory(id, newName);
    } catch (e) {
      await _renameOfflineCategory(id, newName);
    }
  }
  
  Future<void> _renameOfflineCategory(String id, String newName) async {
    final categories = await _loadOfflineCategories();
    final index = categories.indexWhere((c) => c.id == id);
    if (index != -1) {
      categories[index] = categories[index].copyWith(name: newName);
      await _saveOfflineCategories(categories);
    }
  }

  Future<void> deleteCategory(String id) async {
    if (SupabaseService.useOfflineMode) {
      return _deleteOfflineCategory(id);
    }

    try {
      await _client.from('categories').delete().eq('id', id).timeout(const Duration(seconds: 10));
      await _deleteOfflineCategory(id);
    } catch (e) {
      await _deleteOfflineCategory(id);
    }
  }
  
  Future<void> _deleteOfflineCategory(String id) async {
    final categories = await _loadOfflineCategories();
    categories.removeWhere((c) => c.id == id);
    await _saveOfflineCategories(categories);

    // Cascade delete expenses
    final expenses = await _loadOfflineExpenses();
    expenses.removeWhere((e) => e.categoryId == id);
    await _saveOfflineExpenses(expenses);
  }

  // ───────────── Expenses ─────────────

  Future<List<Expense>> getExpensesForCategory(String categoryId) async {
    if (SupabaseService.useOfflineMode) {
      return _getOfflineExpensesForCategory(categoryId);
    }

    try {
      final rows = await _client
          .from('expenses')
          .select()
          .eq('category_id', categoryId)
          .order('spent_at', ascending: false)
          .timeout(const Duration(seconds: 10));

      final fetchedExpenses = (rows as List)
          .map((m) => Expense.fromMap(m as Map<String, dynamic>))
          .toList();
          
      final allExpenses = await _loadOfflineExpenses();
      allExpenses.removeWhere((e) => e.categoryId == categoryId);
      allExpenses.addAll(fetchedExpenses);
      await _saveOfflineExpenses(allExpenses);
      
      return fetchedExpenses;
    } catch (e) {
      return _getOfflineExpensesForCategory(categoryId);
    }
  }
  
  Future<List<Expense>> _getOfflineExpensesForCategory(String categoryId) async {
    final expenses = await _loadOfflineExpenses();
    final filtered = expenses.where((e) => e.categoryId == categoryId).toList();
    filtered.sort((a, b) => b.spentAt.compareTo(a.spentAt));
    return filtered;
  }

  Future<void> addExpense({
    required String categoryId,
    required double amount,
    String? note,
    DateTime? spentAt,
  }) async {
    if (SupabaseService.useOfflineMode) {
      return _addOfflineExpense(categoryId: categoryId, amount: amount, note: note, spentAt: spentAt);
    }

    try {
      final inserted = await _client.from('expenses').insert({
        'category_id': categoryId,
        'amount': amount,
        'note': note,
        'spent_at': (spentAt ?? DateTime.now()).toIso8601String(),
        'user_id': _uid,
      }).select().single().timeout(const Duration(seconds: 10));
      
      final expenses = await _loadOfflineExpenses();
      expenses.add(Expense.fromMap(inserted));
      await _saveOfflineExpenses(expenses);
    } catch (e) {
      await _addOfflineExpense(categoryId: categoryId, amount: amount, note: note, spentAt: spentAt);
    }
  }
  
  Future<void> _addOfflineExpense({
    required String categoryId,
    required double amount,
    String? note,
    DateTime? spentAt,
  }) async {
    final expenses = await _loadOfflineExpenses();
    final newExp = Expense(
      id: DateTime.now().microsecondsSinceEpoch.toString(),
      userId: _uid,
      categoryId: categoryId,
      amount: amount,
      note: note,
      spentAt: spentAt ?? DateTime.now(),
      createdAt: DateTime.now(),
    );
    expenses.add(newExp);
    await _saveOfflineExpenses(expenses);
  }

  Future<void> deleteExpense(String id) async {
    if (SupabaseService.useOfflineMode) {
      return _deleteOfflineExpense(id);
    }

    try {
      await _client.from('expenses').delete().eq('id', id).timeout(const Duration(seconds: 10));
      await _deleteOfflineExpense(id);
    } catch (e) {
      await _deleteOfflineExpense(id);
    }
  }
  
  Future<void> _deleteOfflineExpense(String id) async {
    final expenses = await _loadOfflineExpenses();
    expenses.removeWhere((e) => e.id == id);
    await _saveOfflineExpenses(expenses);
  }

  /// Grand total across all categories.
  Future<double> getGrandTotal() async {
    if (SupabaseService.useOfflineMode) {
      return _getOfflineGrandTotal();
    }

    try {
      final rows = await _client.from('expenses').select('amount').timeout(const Duration(seconds: 10));
      double total = 0;
      for (final row in (rows as List)) {
        final amt = (row['amount'] as num).toDouble();
        if (amt > 0.01) {
          total += amt;
        }
      }
      return total;
    } catch (e) {
      return _getOfflineGrandTotal();
    }
  }
  
  Future<double> _getOfflineGrandTotal() async {
    final expenses = await _loadOfflineExpenses();
    double total = 0;
    for (final e in expenses) {
      if (e.amount > 0.01) {
        total += e.amount;
      }
    }
    return total;
  }
}
