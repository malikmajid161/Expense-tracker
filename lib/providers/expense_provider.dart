import 'package:flutter/material.dart';
import '../models/category.dart';
import '../models/expense.dart';
import '../services/database_service.dart';

/// Holds the list of categories, the grand total, and exposes
/// all the actions the UI needs (add expense, add/rename/delete category).
class ExpenseProvider extends ChangeNotifier {
  final DatabaseService _db = DatabaseService();

  List<Category> _categories = [];
  double _grandTotal = 0;
  bool _loading = false;
  String? _error;

  List<Category> get categories => _categories;
  double get grandTotal => _grandTotal;
  bool get loading => _loading;
  String? get error => _error;

  /// Loads categories with their totals and computes the grand total.
  Future<void> loadDashboard() async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      _categories = await _db.getCategoriesWithTotals();
      if (_categories.isEmpty) {
        await _db.addCategory('Photos', icon: 'camera');
        await _db.addCategory('Food', icon: 'food');
        await _db.addCategory('Fuel', icon: 'fuel');
        await _db.addCategory('Bills', icon: 'bills');
        _categories = await _db.getCategoriesWithTotals();
      }
      _grandTotal = _categories.fold(0.0, (sum, c) => sum + c.total);
    } catch (e) {
      _error = 'Could not load your data. Check your internet.';
    }
    _loading = false;
    notifyListeners();
  }

  /// Adds an expense. If [categoryName] is given (a new account typed by
  /// the user), it finds-or-creates that category first.
  Future<void> addExpense({
    String? categoryId,
    String? categoryName,
    required double amount,
    String? note,
    DateTime? spentAt,
  }) async {
    String resolvedId;
    if (categoryId != null) {
      resolvedId = categoryId;
    } else if (categoryName != null && categoryName.trim().isNotEmpty) {
      final cat = await _db.findOrCreateCategory(categoryName);
      resolvedId = cat.id;
    } else {
      throw Exception('No category selected.');
    }

    await _db.addExpense(
      categoryId: resolvedId,
      amount: amount,
      note: note,
      spentAt: spentAt,
    );
    await loadDashboard();
  }

  Future<List<Expense>> expensesFor(String categoryId) {
    return _db.getExpensesForCategory(categoryId);
  }

  Future<void> addCategory(String name) async {
    await _db.addCategory(name);
    await loadDashboard();
  }

  Future<void> renameCategory(String id, String newName) async {
    await _db.renameCategory(id, newName);
    await loadDashboard();
  }

  Future<void> deleteCategory(String id) async {
    await _db.deleteCategory(id);
    await loadDashboard();
  }

  Future<void> deleteExpense(String id) async {
    await _db.deleteExpense(id);
    await loadDashboard();
  }
}
