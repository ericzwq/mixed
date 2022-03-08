import 'package:flutter_easyloading/flutter_easyloading.dart';

class MyApp extends StatelessWidget {
  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter EasyLoading',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: MyHomePage(title: 'Flutter EasyLoading'),
      builder: EasyLoading.init(),
    );
  }
}


EasyLoading.show(status: 'loading...');

EasyLoading.showProgress(0.3, status: 'downloading...');

EasyLoading.showSuccess('Great Success!');

EasyLoading.showError('Failed with Error');

EasyLoading.showInfo('Useful Information.');

EasyLoading.showToast('Toast');

EasyLoading.dismiss();


EasyLoading.addStatusCallback((status) {
print('EasyLoading Status $status');
});

EasyLoading.removeCallback(statusCallback);

EasyLoading.removeAllCallbacks();
