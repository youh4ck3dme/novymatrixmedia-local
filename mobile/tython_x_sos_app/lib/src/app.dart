import 'package:flutter/material.dart';

import 'screens/home_screen.dart';

class TythonXSosApp extends StatelessWidget {
  const TythonXSosApp({super.key});

  @override
  Widget build(BuildContext context) {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: const Color(0xFFE53935),
      brightness: Brightness.dark,
      primary: const Color(0xFFFF4D4D),
      secondary: const Color(0xFF4D7CFF),
      surface: const Color(0xFF0B1020),
    );

    return MaterialApp(
      title: 'Tython X SOS',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: colorScheme,
        scaffoldBackgroundColor: const Color(0xFF050816),
        useMaterial3: true,
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.transparent,
          foregroundColor: Colors.white,
          surfaceTintColor: Colors.transparent,
          centerTitle: false,
        ),
        snackBarTheme: SnackBarThemeData(
          backgroundColor: const Color(0xFF10182D),
          contentTextStyle: const TextStyle(color: Colors.white),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          behavior: SnackBarBehavior.floating,
        ),
      ),
      home: const HomeScreen(),
    );
  }
}
