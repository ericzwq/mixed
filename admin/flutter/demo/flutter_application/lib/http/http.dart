import 'package:dio/dio.dart';
import 'package:flutter_application/common/utils.dart';

Dio dio = Dio(BaseOptions(receiveTimeout: 10000, baseUrl: '/api'));
Loading loading = Loading();
int count = 0;

void main() async {
  dio.interceptors.add(InterceptorsWrapper(onRequest: (options, handler) {
    count++;
    if (loading.getAutoOpen() && loading.getClosed()) loading.open();
    return handler.next(options);
  }, onResponse: (response, handler) {
    if (--count == 0) {
      loading.setAutoOpen(true);
      if (!loading.getManual() && !loading.getClosed()) loading.close();
    }
    return handler.next(response);
  }, onError: (DioError e, handler) {
    if (--count == 0) {
      // 网络原因应该关闭loading
      loading.setAutoOpen(true);
      if (!loading.getClosed()) loading.close();
    }
    return handler.next(e);
  }));
}
