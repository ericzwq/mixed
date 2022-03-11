import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

class Loading extends StatefulWidget {
  @override
  State<StatefulWidget> createState() => LoadingState();
}

class LoadingState extends State<Loading> {
  bool hide = true;
  @override
  void initState() {
    super.initState();
    print('init');
    hide = false;
    Future.delayed(Duration(seconds: 1), (){
      setState(() {
        hide = true;
      });
    });
  }
  void open() {
    setState(() {
      hide = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Offstage(
      child: LoadingDialog(),
      offstage: hide,
    );
  }
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      // home: LoadingPage(),
      builder: (context, widget) {
        return Stack(
          children: [LoadingPage(), Loading()],
        );
      },
    );
  }
}

class LoadingDialog extends Dialog {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Material(
        color: Colors.black38,
        child: Center(
          child: SizedBox(
            width: 120.0,
            height: 120.0,
            child: Container(
              decoration: ShapeDecoration(color: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(8.0)))),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: <Widget>[
                  // CircularProgressIndicator(),
                  CupertinoActivityIndicator(),
                  Padding(padding: EdgeInsets.only(top: 10.0)),
                  Text(
                    "加载中...",
                    style: TextStyle(fontSize: 16.0, color: Colors.black),
                  )
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class LoadingPage extends StatefulWidget {
  @override
  State<StatefulWidget> createState() {
    return _LoadingPageState();
  }
}

class _LoadingPageState extends State<LoadingPage> {
  bool loadingVisible = false;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: <Widget>[
        Scaffold(
          appBar: AppBar(
            title: Text("加载框"),
          ),
          body: Container(
            child: Column(
              children: <Widget>[
                FlatButton(
                  child: Text("点击弹框"),
                  onPressed: () {
                    _requestData();
                  },
                )
              ],
            ),
          ),
        ),
        Offstage(
          child: LoadingDialog(),
          offstage: !loadingVisible,
        )
      ],
    );
  }

  void _requestData() {
    new LoadingState().open();
    setState(() {
      // this.loadingVisible = true;
    });
    Future.delayed(Duration(seconds: 2), () {
      throw AssertionError("Error");
    }).then((value) {
      print("value:$value");
    }).catchError((e) {
      print("e:$e");
    }).whenComplete(() {
      setState(() {
        this.loadingVisible = false;
      });
    });
  }
}
