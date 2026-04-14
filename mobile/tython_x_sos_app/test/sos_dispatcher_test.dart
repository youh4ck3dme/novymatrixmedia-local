import 'package:geolocator/geolocator.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:tython_x_sos_app/src/core/contact.dart';
import 'package:tython_x_sos_app/src/core/platform_capabilities.dart';
import 'package:tython_x_sos_app/src/services/sos_dispatcher.dart';
import 'package:url_launcher/url_launcher.dart';

void main() {
  PlatformCapabilities capabilities() => const PlatformCapabilities(
        platformLabel: 'Web',
        emergencyNumber: '112',
        countryCode: 'SK',
        supportsForegroundExecution: false,
        supportsBackgroundLocationRefresh: false,
        supportsSilentSmsSending: false,
        supportsSilentEmergencyDial: false,
      );

  Position position() => Position(
        latitude: 48.1486,
        longitude: 17.1077,
        timestamp: DateTime.utc(2026, 4, 14),
        accuracy: 5,
        altitude: 0,
        altitudeAccuracy: 1,
        heading: 0,
        headingAccuracy: 1,
        speed: 0,
        speedAccuracy: 0,
      );

  group('SosDispatcher', () {
    test('returns warning when contacts are missing', () async {
      final dispatcher = SosDispatcher(
        capabilities: capabilities(),
        canLaunchUri: (_) async => true,
        launchUri: (_, {mode = LaunchMode.platformDefault}) async => true,
        isLocationServiceEnabled: () async => false,
        checkPermission: () async => LocationPermission.denied,
        requestPermission: () async => LocationPermission.denied,
        getCurrentPosition: ({required desiredAccuracy, timeLimit}) async =>
            position(),
      );

      final result = await dispatcher.dispatch(contacts: const <EmergencyContact>[]);

      expect(result.smsIntentOpened, isFalse);
      expect(result.callIntentOpened, isTrue);
      expect(
        result.warnings.any((warning) => warning.contains('No emergency contacts')),
        isTrue,
      );
    });

    test('uses fallback message when location permission denied', () async {
      Uri? smsUri;

      final dispatcher = SosDispatcher(
        capabilities: capabilities(),
        canLaunchUri: (_) async => true,
        launchUri: (uri, {mode = LaunchMode.platformDefault}) async {
          if (uri.scheme == 'sms') {
            smsUri = uri;
          }
          return true;
        },
        isLocationServiceEnabled: () async => true,
        checkPermission: () async => LocationPermission.denied,
        requestPermission: () async => LocationPermission.deniedForever,
        getCurrentPosition: ({required desiredAccuracy, timeLimit}) async =>
            position(),
      );

      final result = await dispatcher.dispatch(
        contacts: const <EmergencyContact>[
          EmergencyContact(name: 'Mama', phoneNumber: '+421900111222'),
        ],
      );

      expect(result.smsIntentOpened, isTrue);
      expect(result.callIntentOpened, isTrue);
      expect(smsUri, isNotNull);
      final body = smsUri!.queryParameters['body'] ?? '';
      expect(body, contains('Location unavailable'));
    });

    test('dispatches sms and call with map url when location available', () async {
      Uri? smsUri;
      Uri? callUri;

      final dispatcher = SosDispatcher(
        capabilities: capabilities(),
        canLaunchUri: (_) async => true,
        launchUri: (uri, {mode = LaunchMode.platformDefault}) async {
          if (uri.scheme == 'sms') {
            smsUri = uri;
          }
          if (uri.scheme == 'tel') {
            callUri = uri;
          }
          return true;
        },
        isLocationServiceEnabled: () async => true,
        checkPermission: () async => LocationPermission.whileInUse,
        requestPermission: () async => LocationPermission.whileInUse,
        getCurrentPosition: ({required desiredAccuracy, timeLimit}) async =>
            position(),
      );

      final result = await dispatcher.dispatch(
        contacts: const <EmergencyContact>[
          EmergencyContact(name: 'Friend', phoneNumber: '+421900222333'),
        ],
      );

      expect(result.smsIntentOpened, isTrue);
      expect(result.callIntentOpened, isTrue);
      expect(smsUri.toString(), contains('maps.google.com'));
      expect(callUri.toString(), 'tel:112');
    });
  });
}
