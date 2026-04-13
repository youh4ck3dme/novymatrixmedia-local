import 'package:geolocator/geolocator.dart';
import 'package:url_launcher/url_launcher.dart';

import '../core/contact.dart';
import '../core/platform_capabilities.dart';

class SosDispatchResult {
  const SosDispatchResult({
    required this.smsIntentOpened,
    required this.callIntentOpened,
    required this.position,
    required this.warnings,
  });

  final bool smsIntentOpened;
  final bool callIntentOpened;
  final Position? position;
  final List<String> warnings;

  String get shortSummary {
    if (smsIntentOpened && callIntentOpened) {
      return 'SOS flow opened: SMS + call';
    }
    if (smsIntentOpened && !callIntentOpened) {
      return 'SOS flow opened: SMS only';
    }
    if (!smsIntentOpened && callIntentOpened) {
      return 'SOS flow opened: call only';
    }
    return 'SOS flow was blocked by system settings';
  }
}

class SosDispatcher {
  const SosDispatcher({
    required this.capabilities,
  });

  final PlatformCapabilities capabilities;

  Future<SosDispatchResult> dispatch({
    required List<EmergencyContact> contacts,
  }) async {
    final warnings = <String>[];
    final position = await _tryResolvePosition(warnings);
    final message = _buildMessage(position);

    final smsIntentOpened = await _openSmsComposer(
      contacts: contacts,
      message: message,
      warnings: warnings,
    );

    final callIntentOpened = await _openEmergencyDialer(warnings: warnings);

    if (!capabilities.supportsSilentSmsSending) {
      warnings.add('SMS must be confirmed in system messaging app.');
    }
    if (!capabilities.supportsSilentEmergencyDial) {
      warnings.add('Emergency call must be confirmed in system dialer.');
    }

    return SosDispatchResult(
      smsIntentOpened: smsIntentOpened,
      callIntentOpened: callIntentOpened,
      position: position,
      warnings: warnings,
    );
  }

  Future<Position?> _tryResolvePosition(List<String> warnings) async {
    final serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      warnings.add('Location services are disabled.');
      return null;
    }

    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }

    if (permission == LocationPermission.denied ||
        permission == LocationPermission.deniedForever) {
      warnings.add('Location permission is not granted.');
      return null;
    }

    try {
      return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 8),
      );
    } on Exception {
      warnings.add('Location could not be resolved in time.');
      return null;
    }
  }

  String _buildMessage(Position? position) {
    final timestamp = DateTime.now().toUtc().toIso8601String();
    final lines = <String>[
      'SOS ALERT',
      'Time (UTC): $timestamp',
    ];

    if (position != null) {
      final mapUrl = _mapUrl(position);
      lines.add('Location: ${position.latitude}, ${position.longitude}');
      lines.add('Map: $mapUrl');
    } else {
      lines.add('Location unavailable. Please call me back now.');
    }

    return lines.join('\n');
  }

  Future<bool> _openSmsComposer({
    required List<EmergencyContact> contacts,
    required String message,
    required List<String> warnings,
  }) async {
    if (contacts.isEmpty) {
      warnings.add('No emergency contacts configured.');
      return false;
    }

    final recipients = contacts
        .map((contact) => contact.normalizedPhoneNumber)
        .where((phone) => phone.isNotEmpty)
        .join(',');

    if (recipients.isEmpty) {
      warnings.add('No valid emergency phone number found.');
      return false;
    }

    final smsUri = Uri(
      scheme: 'sms',
      path: recipients,
      queryParameters: <String, String>{
        'body': message,
      },
    );

    final canLaunch = await canLaunchUrl(smsUri);
    if (!canLaunch) {
      warnings.add('SMS app is not available.');
      return false;
    }

    return launchUrl(smsUri, mode: LaunchMode.externalApplication);
  }

  Future<bool> _openEmergencyDialer({
    required List<String> warnings,
  }) async {
    final telUri = Uri(
      scheme: 'tel',
      path: capabilities.emergencyNumber,
    );

    final canLaunch = await canLaunchUrl(telUri);
    if (!canLaunch) {
      warnings.add('Dialer app is not available.');
      return false;
    }

    return launchUrl(telUri, mode: LaunchMode.externalApplication);
  }

  String _mapUrl(Position position) {
    return 'https://maps.google.com/?q=${position.latitude},${position.longitude}';
  }
}
