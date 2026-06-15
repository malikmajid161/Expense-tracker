/// Represents a single expense entry inside a category.
class Expense {
  final String id;
  final String userId;
  final String categoryId;
  final double amount;
  final String? note;
  final DateTime spentAt;
  final DateTime createdAt;

  Expense({
    required this.id,
    required this.userId,
    required this.categoryId,
    required this.amount,
    this.note,
    required this.spentAt,
    required this.createdAt,
  });

  String? get noteText {
    if (note == null) return null;
    if (note!.startsWith('IMAGE_BASE64:')) {
      final index = note!.indexOf('||NOTE:');
      if (index != -1) {
        return note!.substring(index + 7);
      }
      return '';
    }
    return note;
  }

  String? get imageBase64 {
    if (note == null) return null;
    if (note!.startsWith('IMAGE_BASE64:')) {
      final index = note!.indexOf('||NOTE:');
      if (index != -1) {
        return note!.substring(13, index);
      }
      return note!.substring(13);
    }
    return null;
  }

  factory Expense.fromMap(Map<String, dynamic> map) {
    return Expense(
      id: map['id'] as String,
      userId: map['user_id'] as String,
      categoryId: map['category_id'] as String,
      amount: (map['amount'] as num).toDouble(),
      note: map['note'] as String?,
      spentAt: DateTime.parse(map['spent_at'] as String),
      createdAt: DateTime.parse(map['created_at'] as String),
    );
  }

  Map<String, dynamic> toInsertMap() => {
        'category_id': categoryId,
        'amount': amount,
        'note': note,
        'spent_at': spentAt.toIso8601String(),
      };

  Map<String, dynamic> toMap() => {
        'id': id,
        'user_id': userId,
        'category_id': categoryId,
        'amount': amount,
        'note': note,
        'spent_at': spentAt.toIso8601String(),
        'created_at': createdAt.toIso8601String(),
      };
}
