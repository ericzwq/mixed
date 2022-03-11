import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../../../http/http.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({Key? key}) : super(key: key);

  @override
  State<StatefulWidget> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final Map<String, String> _params = {'username': '', 'password': ''};

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        child: Center(
          child: Form(
            key: _formKey,
            child: Column(
              children: [
                SizedBox(
                  height: 150.r,
                ),
                TextFormField(
                  decoration:
                      const InputDecoration(hintText: '请输入用户名', border: OutlineInputBorder(), label: Text('用户名'), contentPadding: EdgeInsets.all(5)),
                  validator: (v) {
                    if (v == null || v == '') return '请输入用户名';
                    if (v.length < 2 || v.length > 10) return '长度在2-10之间';
                    return null;
                  },
                  onSaved: (v) => _params['username'] = v!,
                ),
                SizedBox(
                  height: 20.r,
                ),
                TextFormField(
                  obscureText: true,
                  decoration:
                      const InputDecoration(hintText: '请输入密码', border: OutlineInputBorder(), label: Text('密码'), contentPadding: EdgeInsets.all(5)),
                  validator: (v) {
                    if (v == null || v == '') return '请输入密码';
                    if (v.length < 6 || v.length > 18) return '长度在6-18之间';
                    return null;
                  },
                  onSaved: (v) => _params['password'] = v!,
                ),
                SizedBox(
                  height: 30.r,
                ),
                ElevatedButton(
                  style: ButtonStyle(padding: MaterialStateProperty.all(EdgeInsets.fromLTRB(20, 15, 20, 15))),
                  onPressed: () async {
                    if (!(_formKey.currentState?.validate() ?? false)) return;
                    _formKey.currentState?.save();
                    try {
                      var res = await dio.post('/register', data: _params);
                      print(res);
                      // Navigator.pushNamed(context, '/');
                    } on DioError catch (e) {
                      print(e);
                    }
                  },
                  child: const Text('登录'),
                )
              ],
            ),
          ),
        ),
        padding: EdgeInsets.all(20.r),
      ),
    );
  }
}
