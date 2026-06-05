import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import '../providers/auth_provider.dart';
import '../providers/expense_provider.dart';
import '../theme/app_theme.dart';
import '../utils/formatters.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final ImagePicker _imagePicker = ImagePicker();
  final _budgetCtrl = TextEditingController();
  final _usernameCtrl = TextEditingController();
  bool _updatingUsername = false;

  @override
  void initState() {
    super.initState();
    final auth = context.read<AuthProvider>();
    _budgetCtrl.text = auth.budgetLimit.toStringAsFixed(0);
    
    final email = auth.user?.email ?? '';
    final currentUsername = auth.user?.userMetadata?['username'] as String? ?? 
        (email.isNotEmpty ? email.split('@')[0] : 'User');
    _usernameCtrl.text = currentUsername;
  }

  @override
  void dispose() {
    _budgetCtrl.dispose();
    _usernameCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickProfilePic() async {
    try {
      final file = await _imagePicker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 40,
        maxWidth: 300,
        maxHeight: 300,
      );
      if (file != null) {
        final bytes = await file.readAsBytes();
        final base64 = base64Encode(bytes);
        if (mounted) {
          await context.read<AuthProvider>().updateProfilePic(base64);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Profile picture updated!'), backgroundColor: AppColors.primary),
          );
        }
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Error updating profile picture.')),
      );
    }
  }

  Future<void> _updateUsername() async {
    final newName = _usernameCtrl.text.trim();
    if (newName.isEmpty) return;
    setState(() => _updatingUsername = true);

    try {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      final success = await auth.updateUsername(newName);
      
      if (mounted) {
        if (success) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Username updated successfully!'), backgroundColor: AppColors.primary),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(auth.error ?? 'Failed to update username.'), backgroundColor: AppColors.danger),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to update username.'), backgroundColor: AppColors.danger),
        );
      }
    } finally {
      if (mounted) setState(() => _updatingUsername = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final expense = context.watch<ExpenseProvider>();

    final email = auth.user?.email ?? '';
    final username = auth.user?.userMetadata?['username'] as String? ?? 
        (email.isNotEmpty ? email.split('@')[0] : 'User');
    final initialLetter = username.isNotEmpty ? username[0].toUpperCase() : 'U';

    final totalSpent = expense.grandTotal;
    final budget = auth.budgetLimit;
    final percentSpent = budget > 0 ? (totalSpent / budget) : 0.0;
    final budgetPercentString = (percentSpent * 100).toStringAsFixed(1);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FC),
      appBar: AppBar(
        title: const Text('Profile & Settings'),
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
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            // Profile Picture Editor Section
            Center(
              child: Stack(
                children: [
                  Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white,
                      border: Border.all(color: AppColors.primary, width: 3),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.08),
                          blurRadius: 15,
                          offset: const Offset(0, 6),
                        ),
                      ],
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
                                  initialLetter,
                                  style: const TextStyle(
                                    fontSize: 44,
                                    fontWeight: FontWeight.w900,
                                    color: AppColors.primary,
                                  ),
                                ),
                              ),
                            ),
                    ),
                  ),
                  Positioned(
                    bottom: 0,
                    right: 4,
                    child: GestureDetector(
                      onTap: _pickProfilePic,
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: const BoxDecoration(
                          color: AppColors.primary,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.camera_alt_rounded,
                          color: Colors.white,
                          size: 18,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            Text(
              username,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                color: AppColors.textPrimary,
              ),
            ),
            Text(
              email,
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
                fontWeight: FontWeight.w500,
              ),
            ),
            
            const SizedBox(height: 32),
            
            // Monthly Budget Summary Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.02),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
                border: Border.all(color: const Color(0xFFEBEFF5)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Monthly Budget',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      Text(
                        Formatters.currency(budget, symbol: auth.currencySymbol),
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(6),
                    child: LinearProgressIndicator(
                      value: percentSpent.clamp(0.0, 1.0),
                      minHeight: 8,
                      backgroundColor: const Color(0xFFEDF2F7),
                      valueColor: AlwaysStoppedAnimation<Color>(
                        percentSpent > 0.9 ? AppColors.danger : AppColors.primary,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Spent: ${Formatters.currency(totalSpent, symbol: auth.currencySymbol)} ($budgetPercentString%)',
                        style: TextStyle(
                          fontSize: 12,
                          color: percentSpent > 0.9 ? AppColors.danger : AppColors.textSecondary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Text(
                        'Left: ${Formatters.currency((budget - totalSpent).clamp(0.0, budget), symbol: auth.currencySymbol)}',
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 24),
            
            // Settings Cards
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.02),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
                border: Border.all(color: const Color(0xFFEBEFF5)),
              ),
              child: Column(
                children: [
                  // Edit Username setting
                  ListTile(
                    leading: const Icon(Icons.person_outline_rounded, color: AppColors.primary),
                    title: const Text('Display Name', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                    trailing: SizedBox(
                      width: 150,
                      child: TextField(
                        controller: _usernameCtrl,
                        textAlign: TextAlign.end,
                        decoration: const InputDecoration(
                          border: InputBorder.none,
                          hintText: 'Add name',
                        ),
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                        onSubmitted: (_) => _updateUsername(),
                      ),
                    ),
                  ),
                  const Divider(height: 1, color: Color(0xFFF1F4F9), indent: 50),
                  
                  // Monthly Budget limit setting slider/input
                  ListTile(
                    leading: const Icon(Icons.add_card_rounded, color: AppColors.primary),
                    title: const Text('Limit Budget', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                    trailing: SizedBox(
                      width: 110,
                      child: TextField(
                        controller: _budgetCtrl,
                        keyboardType: TextInputType.number,
                        textAlign: TextAlign.end,
                        decoration: const InputDecoration(
                          border: InputBorder.none,
                          suffixText: ' Rs',
                        ),
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                        onSubmitted: (v) {
                          final limit = double.tryParse(v) ?? 15000.0;
                          context.read<AuthProvider>().updateBudgetLimit(limit);
                        },
                      ),
                    ),
                  ),
                  const Divider(height: 1, color: Color(0xFFF1F4F9), indent: 50),
                  
                  // Currency selector drop-down
                  ListTile(
                    leading: const Icon(Icons.monetization_on_outlined, color: AppColors.primary),
                    title: const Text('Currency Symbol', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                    trailing: DropdownButton<String>(
                      value: auth.currencySymbol,
                      underline: const SizedBox(),
                      elevation: 4,
                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                      onChanged: (v) {
                        if (v != null) {
                          context.read<AuthProvider>().updateCurrencySymbol(v);
                        }
                      },
                      items: const [
                        DropdownMenuItem(value: 'Rs', child: Text('Rs (PKR)')),
                        DropdownMenuItem(value: '\$', child: Text('\$ (USD)')),
                        DropdownMenuItem(value: '€', child: Text('€ (EUR)')),
                        DropdownMenuItem(value: '£', child: Text('£ (GBP)')),
                        DropdownMenuItem(value: '¥', child: Text('¥ (JPY)')),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 32),
            
            // Sign Out Button
            SizedBox(
              width: double.infinity,
              height: 52,
              child: OutlinedButton.icon(
                onPressed: () {
                  auth.signOut();
                  Navigator.of(context).pop();
                },
                icon: const Icon(Icons.logout_rounded, size: 20),
                label: const Text(
                  'Sign Out',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.danger,
                  side: const BorderSide(color: AppColors.danger, width: 1.5),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
