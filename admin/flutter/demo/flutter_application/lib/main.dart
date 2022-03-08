import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import 'http/http.dart' as http;
import 'layout.dart';
import 'router/router.dart';

void main() {
  http.main();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      initialRoute: '/login',
      routes: routes,
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: const LayoutPage(),
      builder: EasyLoading.init(),
    );
  }
}
