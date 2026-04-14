import 'package:flutter_test/flutter_test.dart';
import 'package:tython_x_sos_app/src/core/contact.dart';

void main() {
  group('EmergencyContact', () {
    test('sanitizes phone numbers', () {
      const contact = EmergencyContact(name: 'Ana', phoneNumber: '+421 900-111-222');
      expect(contact.normalizedPhoneNumber, '+421900111222');
    });

    test('rejects empty name or phone', () {
      const contact = EmergencyContact(name: '', phoneNumber: '0900');
      expect(contact.isValid, false);
    });

    test('keeps plus at start only', () {
      const contact = EmergencyContact(name: 'Lukas', phoneNumber: '+4+2+1');
      expect(contact.normalizedPhoneNumber, '+421');
    });
  });
}
