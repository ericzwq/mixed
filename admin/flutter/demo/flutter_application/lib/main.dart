import 'package:flutter/material.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
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
    return ScreenUtilInit(
      designSize: const Size(375, 667),
      minTextAdapt: true,
      splitScreenMode: true,
      builder: () => MaterialApp(
        initialRoute: '/login',
        debugShowCheckedModeBanner: false,
        routes: routes,
        theme: ThemeData(
          primarySwatch: Colors.blue,
          // ScreenUtil().setWidth(540)  (sdk>=2.6 : 540.w)   //根据屏幕宽度适配尺寸
          // ScreenUtil().setHeight(200) (sdk>=2.6 : 200.h)   //根据屏幕高度适配尺寸(一般根据宽度适配即可)
          // ScreenUtil().radius(200)    (sdk>=2.6 : 200.r)   //根据宽度或高度中的较小者进行调整
          // ScreenUtil().setSp(24)      (sdk>=2.6 : 24.sp)   //适配字体
          textTheme: TextTheme(button: TextStyle(fontSize: 15.sp)),
        ),
        builder: EasyLoading.init(),
        // builder: (context, widget) {
        //   ScreenUtil.setContext(context);
        //   return MediaQuery(
        //     data: MediaQuery.of(context).copyWith(textScaleFactor: 1.0),
        //     child: widget!,
        //   );
        // },
        // home: const LayoutPage(),
      ),
    );

    return MaterialApp(
      initialRoute: '/login',
      routes: routes,
      theme: ThemeData(
        primarySwatch: Colors.blue,
        // textTheme: TextTheme(button: TextStyle(fontSize: 45.sp)),
      ),
      // home: const LayoutPage(),
      // builder: EasyLoading.init(),
    );
  }
}
