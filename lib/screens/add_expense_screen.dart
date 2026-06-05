import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import '../models/category.dart';
import '../providers/auth_provider.dart';
import '../providers/expense_provider.dart';
import '../theme/app_theme.dart';
import '../utils/formatters.dart';
import '../widgets/category_tile.dart';
import '../widgets/number_pad.dart';

/// Redesigned premium expense addition screen.
class AddExpenseScreen extends StatefulWidget {
  const AddExpenseScreen({super.key});

  @override
  State<AddExpenseScreen> createState() => _AddExpenseScreenState();
}

class _AddExpenseScreenState extends State<AddExpenseScreen> {
  String _amount = '';
  String? _selectedCategoryId;
  String? _newCategoryName;
  bool _saving = false;

  // Note and image fields
  final _noteCtrl = TextEditingController();
  String? _imageBase64;
  final ImagePicker _imagePicker = ImagePicker();

  @override
  void dispose() {
    _noteCtrl.dispose();
    super.dispose();
  }

  bool get _canSave =>
      ((double.tryParse(_amount) ?? 0) > 0 || _imageBase64 != null) &&
      (_selectedCategoryId != null ||
          (_newCategoryName != null && _newCategoryName!.trim().isNotEmpty));

  Future<void> _save() async {
    if (!_canSave || _saving) return;
    setState(() => _saving = true);

    try {
      // Build final note containing optional base64 image data
      String? finalNote = _noteCtrl.text.trim();
      if (_imageBase64 != null) {
        finalNote = 'IMAGE_BASE64:$_imageBase64||NOTE:$finalNote';
      } else if (finalNote.isEmpty) {
        finalNote = null;
      }

      final parsedAmt = double.tryParse(_amount) ?? 0.0;
      final finalAmt = parsedAmt > 0.0 ? parsedAmt : 0.01;

      await context.read<ExpenseProvider>().addExpense(
            categoryId: _selectedCategoryId,
            categoryName: _selectedCategoryId == null ? _newCategoryName : null,
            amount: finalAmt,
            note: finalNote,
          );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Expense saved successfully!'),
          backgroundColor: AppColors.primary,
          duration: Duration(seconds: 1),
        ),
      );
      Navigator.of(context).pop();
    } catch (e) {
      if (!mounted) return;
      setState(() => _saving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Failed to save expense. Please check connection.'),
          backgroundColor: AppColors.danger,
        ),
      );
    }
  }

  Future<void> _pickImage() async {
    try {
      final file = await _imagePicker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 40,
        maxWidth: 500,
        maxHeight: 500,
      );
      if (file != null) {
        final bytes = await file.readAsBytes();
        setState(() {
          _imageBase64 = base64Encode(bytes);
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Error selecting image.')),
      );
    }
  }

  Future<void> _promptNewCategory() async {
    final ctrl = TextEditingController();
    final name = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('New Category'),
        content: TextField(
          controller: ctrl,
          autofocus: true,
          textCapitalization: TextCapitalization.words,
          decoration: const InputDecoration(
            hintText: 'e.g. Electricity, Shopping',
            labelText: 'Category Name',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, ctrl.text.trim()),
            style: ElevatedButton.styleFrom(
              minimumSize: const Size(80, 40),
            ),
            child: const Text('Create'),
          ),
        ],
      ),
    );
    if (name != null && name.isNotEmpty) {
      setState(() {
        _newCategoryName = name;
        _selectedCategoryId = null;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final categories = context.watch<ExpenseProvider>().categories;
    final auth = context.watch<AuthProvider>();
    final symbol = auth.currencySymbol;

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FB),
      appBar: AppBar(
        title: const Text('Add Expense'),
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
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Amount Card
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.primaryDark, AppColors.primary],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withOpacity(0.3),
                      blurRadius: 15,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Text(
                      'HOW MUCH?',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        color: Colors.white.withOpacity(0.7),
                        letterSpacing: 2,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.baseline,
                      textBaseline: TextBaseline.alphabetic,
                      children: [
                        Text(
                          _amount.isEmpty
                              ? '$symbol 0'
                              : Formatters.currency(int.parse(_amount), symbol: symbol),
                          style: const TextStyle(
                            fontSize: 48,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                            letterSpacing: -1,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            
            // Category & Pad Section
            Expanded(
              child: Container(
                width: double.infinity,
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(32),
                    topRight: Radius.circular(32),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Color(0x0A000000),
                      blurRadius: 20,
                      offset: Offset(0, -5),
                    ),
                  ],
                ),
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Select Category',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 16),
                      _buildCategoryGrid(categories),
                      const SizedBox(height: 24),
                      
                      const Text(
                        'Details & Receipt (Optional)',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 12),
                      // Note field
                      TextField(
                        controller: _noteCtrl,
                        decoration: InputDecoration(
                          hintText: 'e.g. Dinner with team, office supplies',
                          labelText: 'Add Note',
                          prefixIcon: const Icon(Icons.note_alt_rounded),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: const BorderSide(color: Color(0xFFE5E9F0)),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: const BorderSide(color: Color(0xFFE5E9F0)),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: const BorderSide(color: AppColors.primary, width: 2),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      // Receipt Picker Card
                      GestureDetector(
                        onTap: _pickImage,
                        child: Container(
                          width: double.infinity,
                          height: 120,
                          decoration: BoxDecoration(
                            color: const Color(0xFFF7F9FC),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: const Color(0xFFD3DCE6),
                              width: 1.5,
                              style: BorderStyle.solid,
                            ),
                          ),
                          child: _imageBase64 != null
                              ? Stack(
                                  children: [
                                    ClipRRect(
                                      borderRadius: BorderRadius.circular(16),
                                      child: Image.memory(
                                        base64Decode(_imageBase64!),
                                        width: double.infinity,
                                        height: double.infinity,
                                        fit: BoxFit.cover,
                                      ),
                                    ),
                                    Container(
                                      decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(16),
                                        gradient: LinearGradient(
                                          colors: [Colors.black.withOpacity(0.4), Colors.transparent],
                                          begin: Alignment.topCenter,
                                          end: Alignment.bottomCenter,
                                        ),
                                      ),
                                    ),
                                    const Positioned(
                                      bottom: 12,
                                      left: 12,
                                      child: Row(
                                        children: [
                                          Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
                                          SizedBox(width: 6),
                                          Text(
                                            'Receipt image selected',
                                            style: TextStyle(
                                              color: Colors.white,
                                              fontWeight: FontWeight.bold,
                                              fontSize: 13,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    Positioned(
                                      top: 8,
                                      right: 8,
                                      child: GestureDetector(
                                        onTap: () {
                                          setState(() {
                                            _imageBase64 = null;
                                          });
                                        },
                                        child: Container(
                                          padding: const EdgeInsets.all(6),
                                          decoration: const BoxDecoration(
                                            color: Colors.black54,
                                            shape: BoxShape.circle,
                                          ),
                                          child: const Icon(
                                            Icons.close_rounded,
                                            color: Colors.white,
                                            size: 16,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                )
                              : const Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(
                                      Icons.add_a_photo_rounded,
                                      color: AppColors.textSecondary,
                                      size: 32,
                                    ),
                                    SizedBox(height: 8),
                                    Text(
                                      'Attach Receipt / Bill Photo',
                                      style: TextStyle(
                                        fontSize: 14,
                                        color: AppColors.textSecondary,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    Text(
                                      'Optional',
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: Colors.black26,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ],
                                ),
                        ),
                      ),
                      
                      const SizedBox(height: 28),
                      NumberPad(
                        value: _amount,
                        onChanged: (v) => setState(() => _amount = v),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            
            // Save Button Action
            Container(
              color: Colors.white,
              padding: const EdgeInsets.fromLTRB(24, 0, 24, 20),
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: _canSave && !_saving
                      ? [
                          BoxShadow(
                            color: AppColors.primary.withOpacity(0.35),
                            blurRadius: 12,
                            offset: const Offset(0, 6),
                          ),
                        ]
                      : null,
                ),
                child: ElevatedButton(
                  onPressed: _canSave && !_saving ? _save : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    disabledBackgroundColor: const Color(0xFFE2E6EE),
                    minimumSize: const Size.fromHeight(60),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: _saving
                      ? const SizedBox(
                          height: 24,
                          width: 24,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2.5,
                          ),
                        )
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.check_circle_rounded, size: 24),
                            const SizedBox(width: 10),
                            Text(
                              _amount.isEmpty && _imageBase64 != null
                                  ? 'Save Record Pic'
                                  : 'Save Expense',
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryGrid(List<Category> categories) {
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: [
        ...List.generate(categories.length, (i) {
          final cat = categories[i];
          final selected = _selectedCategoryId == cat.id;
          final color = AppColors.forIndex(i);
          return GestureDetector(
            onTap: () => setState(() {
              _selectedCategoryId = cat.id;
              _newCategoryName = null;
            }),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: selected ? color.withOpacity(0.12) : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: selected ? color : const Color(0xFFE5E9F0),
                  width: selected ? 2.0 : 1.0,
                ),
                boxShadow: selected
                    ? [
                        BoxShadow(
                          color: color.withOpacity(0.15),
                          blurRadius: 8,
                          offset: const Offset(0, 4),
                        ),
                      ]
                    : null,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: selected ? color : color.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      iconFor(cat.icon),
                      size: 18,
                      color: selected ? Colors.white : color,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    cat.name,
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: selected ? FontWeight.bold : FontWeight.w600,
                      color: selected ? color : AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
            ),
          );
        }),
        // Add Category Card
        GestureDetector(
          onTap: _promptNewCategory,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: _newCategoryName != null
                  ? AppColors.primary.withOpacity(0.12)
                  : Colors.transparent,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: _newCategoryName != null
                    ? AppColors.primary
                    : const Color(0xFFE5E9F0),
                style: _newCategoryName != null ? BorderStyle.solid : BorderStyle.solid,
                width: _newCategoryName != null ? 2.0 : 1.0,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  _newCategoryName != null ? Icons.check : Icons.add_circle_outline,
                  size: 20,
                  color: _newCategoryName != null ? AppColors.primary : AppColors.textSecondary,
                ),
                const SizedBox(width: 10),
                Text(
                  _newCategoryName ?? 'New category',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: _newCategoryName != null ? FontWeight.bold : FontWeight.w600,
                    color: _newCategoryName != null ? AppColors.primary : AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
