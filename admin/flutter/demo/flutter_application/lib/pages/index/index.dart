import 'package:flutter/material.dart';

class IndexPage extends StatefulWidget {
  const IndexPage({Key? key}) : super(key: key);

  @override
  State<StatefulWidget> createState() => IndexPageState();
}

class IndexPageState extends State<IndexPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Container(
          width: 600,
          alignment: Alignment.center,
          decoration: BoxDecoration(border: Border.all(color: Colors.black)),
          child: Stack(
            children: [
              TextField(
                decoration: InputDecoration(
                  prefixIcon: Icon(Icons.people),
                  hintText: "请输入账号",
                  labelText: "用户名",
                ),
              )
            ],
          ),
          height: 400,
          padding: EdgeInsets.all(10),
          margin: EdgeInsets.fromLTRB(10, 50, 10, 10),
        ),
      ),
    );
  }
}
