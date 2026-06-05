import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:expense_tracker/main.dart';

void main() {
  testWidgets('Setup needed screen shows when env file is not loaded', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const MyApp(startupError: 'File not found: .env'));

    // Verify that setup needed message is shown.
    expect(find.text('Setup needed'), findsOneWidget);
    expect(find.text('File not found: .env'), findsOneWidget);
  });
}

