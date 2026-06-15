/// Represents one account / category (e.g. "Grocery", "Rent").
class Category {
  final String id;
  final String userId;
  final String name;
  final String icon; // Tabler-like icon name or material icon key
  final DateTime createdAt;

  /// Running total of expenses in this category.
  /// Not stored in DB — computed and attached when loading.
  final double total;

  Category({
    required this.id,
    required this.userId,
    required this.name,
    required this.icon,
    required this.createdAt,
    this.total = 0,
  });

  factory Category.fromMap(Map<String, dynamic> map, {double total = 0}) {
    return Category(
      id: map['id'] as String,
      userId: map['user_id'] as String,
      name: map['name'] as String,
      icon: (map['icon'] as String?) ?? 'wallet',
      createdAt: DateTime.parse(map['created_at'] as String),
      total: total,
    );
  }

  Map<String, dynamic> toInsertMap() => {
        'name': name,
        'icon': icon,
      };

  Map<String, dynamic> toMap() => {
        'id': id,
        'user_id': userId,
        'name': name,
        'icon': icon,
        'created_at': createdAt.toIso8601String(),
      };

  Category copyWith({String? name, String? icon, double? total}) {
    return Category(
      id: id,
      userId: userId,
      name: name ?? this.name,
      icon: icon ?? this.icon,
      createdAt: createdAt,
      total: total ?? this.total,
    );
  }
}
