import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../../../http/http.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({Key? key}) : super(key: key);

  @override
  State<StatefulWidget> createState() => LoginPageState();
}

class LoginPageState extends State<LoginPage> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  String? _username = '';
  String? _password = '';

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
                TextFormField(
                  decoration: const InputDecoration(hintText: '请输入用户名', border: OutlineInputBorder(), label: Text('用户名')),
                  validator: (v) {
                    if (v == null || v == '') return '请输入用户名';
                    if (v.length < 2 || v.length > 10) return '长度在2-10之间';
                    return null;
                  },
                  onSaved: (v) => _username = v,
                ),
                const SizedBox(
                  height: 20,
                ),
                TextFormField(
                  obscureText: true,
                  decoration: const InputDecoration(hintText: '请输入密码', border: OutlineInputBorder(), label: Text('密码')),
                  validator: (v) {
                    if (v == null || v == '') return '请输入密码';
                    if (v.length < 6 || v.length > 18) return '长度在6-18之间';
                    return null;
                  },
                  onSaved: (v) => _password = v,
                ),
                const SizedBox(
                  height: 20,
                ),
                ElevatedButton(
                  style: ButtonStyle(padding: MaterialStateProperty.all(const EdgeInsets.fromLTRB(20, 15, 20, 15))),
                  onPressed: () async {
                    // if (!(_formKey.currentState?.validate() ?? false)) return;
                    _formKey.currentState?.save();
                    try {
                      var res = await dio.post('http://localhost:5000', data: {'username': _username}, options: ExtOptions(noLoading: true));
                      print(res);
                      // Navigator.pushNamed(context, '/');
                    } on DioError catch (e) {
                      // print(e);
                    }
                  },
                  child: const Text('登录'),
                )
              ],
            ),
          ),
        ),
        padding: const EdgeInsets.all(20),
        margin: const EdgeInsets.only(top: 100),
      ),
    );
  }
}
