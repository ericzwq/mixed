import 'package:flutter/material.dart';
import 'package:flutter_application/layout.dart';
import '../pages/user/login/login.dart';

Map<String, Widget Function(BuildContext)> routes = {
  '/': (context) => const LayoutPage(),
  '/login': (context) => const LoginPage(),
};
