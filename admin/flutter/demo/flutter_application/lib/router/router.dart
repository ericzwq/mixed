import 'package:flutter/material.dart';
import '../pages/user/login/login.dart';

Map<String, Widget Function(BuildContext)> routes = {
  '/login': (context) => const LoginPage(),
};
